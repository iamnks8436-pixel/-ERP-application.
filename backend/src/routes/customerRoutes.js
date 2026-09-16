const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { customerSchema } = require('../validators/schemas');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles('ADMIN', 'SALES_USER'),
  validate(customerSchema),
  asyncHandler(customerController.createCustomer)
);

router.get(
  '/',
  requireRoles('ADMIN', 'SALES_USER'),
  asyncHandler(customerController.getCustomers)
);

module.exports = router;
