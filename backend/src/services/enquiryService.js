const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { generateEnquiryNumber } = require('../utils/numberGenerator');

async function createEnquiry({ customerId, customer, requiredDate, notes, items, createdById }) {
  return prisma.$transaction(async (tx) => {
    let resolvedCustomerId = customerId;

    if (!resolvedCustomerId && customer) {
      const newCustomer = await tx.customer.create({ data: customer });
      resolvedCustomerId = newCustomer.id;
    }

    if (!resolvedCustomerId) {
      throw new AppError('Customer is required', 400);
    }

    const existingCustomer = await tx.customer.findUnique({ where: { id: resolvedCustomerId } });
    if (!existingCustomer) {
      throw new AppError('Customer not found', 404);
    }

    const productIds = items.map((i) => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) {
      throw new AppError('One or more products not found', 404);
    }

    const enquiryNumber = await generateEnquiryNumber();

    return tx.enquiry.create({
      data: {
        enquiryNumber,
        customerId: resolvedCustomerId,
        createdById,
        requiredDate: new Date(requiredDate),
        notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  });
}

async function getEnquiries() {
  return prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      items: { include: { product: true } },
      createdBy: { select: { id: true, name: true } },
      quotations: { select: { id: true, quotationNumber: true, status: true } },
    },
  });
}

module.exports = {
  createEnquiry,
  getEnquiries,
};
