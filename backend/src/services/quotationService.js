const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { generateQuotationNumber } = require('../utils/numberGenerator');
const { calculateLineItem, calculateGrandTotal } = require('../utils/quotationCalculator');

async function createQuotation({ enquiryId, validUntil, items, createdById }) {
  return prisma.$transaction(async (tx) => {
    const enquiry = await tx.enquiry.findUnique({
      where: { id: enquiryId },
      include: { items: true },
    });

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    if (enquiry.status === 'LOST') {
      throw new AppError('Cannot create quotation for a lost enquiry', 400);
    }

    const calculatedItems = items.map((item) => {
      const amounts = calculateLineItem(item);
      return { ...item, ...amounts };
    });

    const grandTotal = calculateGrandTotal(calculatedItems);
    const quotationNumber = await generateQuotationNumber();

    const quotation = await tx.quotation.create({
      data: {
        quotationNumber,
        enquiryId,
        customerId: enquiry.customerId,
        createdById,
        validUntil: new Date(validUntil),
        grandTotal,
        status: 'DRAFT',
        items: {
          create: calculatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPct: item.discountPct ?? 0,
            gstPct: item.gstPct ?? 18,
            baseAmount: item.baseAmount,
            discountAmount: item.discountAmount,
            afterDiscount: item.afterDiscount,
            gstAmount: item.gstAmount,
            finalAmount: item.finalAmount,
          })),
        },
      },
      include: {
        customer: true,
        enquiry: true,
        items: { include: { product: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (enquiry.status === 'NEW') {
      await tx.enquiry.update({
        where: { id: enquiryId },
        data: { status: 'QUOTED' },
      });
    }

    return quotation;
  });
}

async function getQuotations() {
  return prisma.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      enquiry: { select: { id: true, enquiryNumber: true, status: true } },
      items: { include: { product: true } },
      salesOrder: { select: { id: true, orderNumber: true, status: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
}

async function updateQuotationStatus(id, status) {
  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUnique({
      where: { id },
      include: { salesOrder: true },
    });

    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    if (quotation.status === 'ACCEPTED' && status !== 'ACCEPTED') {
      throw new AppError('Accepted quotation status cannot be changed', 400);
    }

    if (quotation.status === 'REJECTED') {
      throw new AppError('Rejected quotation cannot be updated', 400);
    }

    if (status === 'ACCEPTED') {
      if (quotation.status !== 'SENT' && quotation.status !== 'DRAFT') {
        throw new AppError('Only DRAFT or SENT quotations can be accepted', 400);
      }
      if (new Date() > quotation.validUntil) {
        throw new AppError('Quotation has expired', 400);
      }
    }

    const updated = await tx.quotation.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        enquiry: true,
        items: { include: { product: true } },
      },
    });

    if (status === 'ACCEPTED') {
      await tx.enquiry.update({
        where: { id: quotation.enquiryId },
        data: { status: 'WON' },
      });
    } else if (status === 'REJECTED') {
      await tx.enquiry.update({
        where: { id: quotation.enquiryId },
        data: { status: 'LOST' },
      });
    }

    return updated;
  });
}

module.exports = {
  createQuotation,
  getQuotations,
  updateQuotationStatus,
};
