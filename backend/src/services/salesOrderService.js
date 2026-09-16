const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { generateOrderNumber, generateDispatchNumber } = require('../utils/numberGenerator');
const { lockAndReserveStock, lockAndDispatchStock } = require('./inventoryService');

async function convertQuotationToSalesOrder(quotationId) {
  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUnique({
      where: { id: quotationId },
      include: {
        items: true,
        salesOrder: true,
      },
    });

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    if (quotation.status !== 'ACCEPTED') {
      throw new AppError(
        'Only ACCEPTED quotations can be converted to sales orders',
        400
      );
    }

    if (quotation.salesOrder) {
      throw new AppError('Sales order already exists for this quotation', 409);
    }

    const orderNumber = await generateOrderNumber();

    const salesOrder = await tx.salesOrder.create({
      data: {
        orderNumber,
        quotationId,
        customerId: quotation.customerId,
        totalAmount: quotation.grandTotal,
        status: 'PENDING',
        items: {
          create: quotation.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineAmount: item.finalAmount,
          })),
        },
      },
      include: {
        customer: true,
        quotation: { select: { id: true, quotationNumber: true } },
        items: { include: { product: true } },
      },
    });

    return salesOrder;
  });
}

async function getSalesOrders() {
  return prisma.salesOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      quotation: { select: { id: true, quotationNumber: true, status: true } },
      items: { include: { product: true } },
      dispatches: {
        include: { items: { include: { product: true } } },
      },
    },
  });
}

async function confirmSalesOrder(orderId) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new AppError('Sales order not found', 404);
    }

    if (order.status !== 'PENDING') {
      throw new AppError(`Cannot confirm order with status ${order.status}`, 400);
    }

    for (const item of order.items) {
      await lockAndReserveStock(tx, item.productId, item.quantity);

      await tx.salesOrderItem.update({
        where: { id: item.id },
        data: { reservedQty: item.quantity },
      });
    }

    return tx.salesOrder.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
  });
}

async function dispatchSalesOrder(orderId, { vehicleNumber, driverName, items }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        dispatches: { include: { items: true } },
      },
    });

    if (!order) {
      throw new AppError('Sales order not found', 404);
    }

    if (order.status === 'CANCELLED') {
      throw new AppError('Cannot dispatch a cancelled order', 400);
    }

    if (order.status !== 'CONFIRMED' && order.status !== 'DISPATCHED') {
      throw new AppError('Order must be confirmed before dispatch', 400);
    }

    const orderItemMap = new Map(order.items.map((i) => [i.productId, i]));

    for (const dispatchItem of items) {
      const orderItem = orderItemMap.get(dispatchItem.productId);
      if (!orderItem) {
        throw new AppError(`Product ${dispatchItem.productId} not in sales order`, 400);
      }

      const alreadyDispatched = order.dispatches.reduce((sum, d) => {
        const di = d.items.find((i) => i.productId === dispatchItem.productId);
        return sum + (di?.quantity || 0);
      }, 0);

      const remainingToDispatch = orderItem.quantity - alreadyDispatched;
      if (dispatchItem.quantity > remainingToDispatch) {
        throw new AppError(
          `Dispatch quantity exceeds remaining order quantity for product`,
          400
        );
      }

      const remainingReserved = orderItem.reservedQty - orderItem.dispatchedQty;
      if (dispatchItem.quantity > remainingReserved) {
        throw new AppError(
          `Dispatch quantity exceeds reserved quantity for product`,
          400
        );
      }

      await lockAndDispatchStock(tx, dispatchItem.productId, dispatchItem.quantity);

      await tx.salesOrderItem.update({
        where: { id: orderItem.id },
        data: {
          dispatchedQty: { increment: dispatchItem.quantity },
        },
      });
    }

    const dispatchNumber = await generateDispatchNumber();

    const dispatch = await tx.dispatch.create({
      data: {
        dispatchNumber,
        salesOrderId: orderId,
        vehicleNumber,
        driverName,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    const updatedOrder = await tx.salesOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    const fullyDispatched = updatedOrder.items.every(
      (i) => i.dispatchedQty >= i.quantity
    );

    if (fullyDispatched) {
      await tx.salesOrder.update({
        where: { id: orderId },
        data: { status: 'DISPATCHED' },
      });
    }

    return dispatch;
  });
}

module.exports = {
  convertQuotationToSalesOrder,
  getSalesOrders,
  confirmSalesOrder,
  dispatchSalesOrder,
};
