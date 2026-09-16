const prisma = require('../config/database');

async function generateNumber(prefix, model, field) {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-`;

  const latest = await model.findFirst({
    where: { [field]: { startsWith: pattern } },
    orderBy: { [field]: 'desc' },
    select: { [field]: true },
  });

  let sequence = 1;
  if (latest) {
    const parts = latest[field].split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  return `${pattern}${String(sequence).padStart(4, '0')}`;
}

async function generateEnquiryNumber() {
  return generateNumber('ENQ', prisma.enquiry, 'enquiryNumber');
}

async function generateQuotationNumber() {
  return generateNumber('QUO', prisma.quotation, 'quotationNumber');
}

async function generateOrderNumber() {
  return generateNumber('SO', prisma.salesOrder, 'orderNumber');
}

async function generateDispatchNumber() {
  return generateNumber('DSP', prisma.dispatch, 'dispatchNumber');
}

module.exports = {
  generateEnquiryNumber,
  generateQuotationNumber,
  generateOrderNumber,
  generateDispatchNumber,
};
