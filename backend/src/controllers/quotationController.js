const quotationService = require('../services/quotationService');
const salesOrderService = require('../services/salesOrderService');

async function createQuotation(req, res) {
  const quotation = await quotationService.createQuotation({
    ...req.validated.body,
    createdById: req.user.id,
  });
  res.status(201).json({ success: true, data: quotation });
}

async function getQuotations(req, res) {
  const quotations = await quotationService.getQuotations();
  res.json({ success: true, data: quotations });
}

async function updateQuotationStatus(req, res) {
  const { id } = req.validated.params;
  const { status } = req.validated.body;
  const quotation = await quotationService.updateQuotationStatus(id, status);
  res.json({ success: true, data: quotation });
}

async function convertToSalesOrder(req, res) {
  const { id } = req.validated.params;
  const salesOrder = await salesOrderService.convertQuotationToSalesOrder(id);
  res.status(201).json({ success: true, data: salesOrder });
}

module.exports = {
  createQuotation,
  getQuotations,
  updateQuotationStatus,
  convertToSalesOrder,
};
