const customerService = require('../services/customerService');

async function createCustomer(req, res) {
  const customer = await customerService.createCustomer(req.validated.body);
  res.status(201).json({ success: true, data: customer });
}

async function getCustomers(req, res) {
  const customers = await customerService.getCustomers();
  res.json({ success: true, data: customers });
}

module.exports = { createCustomer, getCustomers };
