const salesOrderService = require('../services/salesOrderService');
const inventoryService = require('../services/inventoryService');

async function getSalesOrders(req, res) {
  const orders = await salesOrderService.getSalesOrders();
  res.json({ success: true, data: orders });
}

async function confirmSalesOrder(req, res) {
  const { id } = req.validated.params;
  const order = await salesOrderService.confirmSalesOrder(id);
  res.json({ success: true, data: order });
}

async function dispatchSalesOrder(req, res) {
  const { id } = req.validated.params;
  const dispatch = await salesOrderService.dispatchSalesOrder(id, req.validated.body);
  res.status(201).json({ success: true, data: dispatch });
}

async function getInventory(req, res) {
  const inventory = await inventoryService.getInventoryWithAvailability();
  res.json({ success: true, data: inventory });
}

module.exports = {
  getSalesOrders,
  confirmSalesOrder,
  dispatchSalesOrder,
  getInventory,
};
