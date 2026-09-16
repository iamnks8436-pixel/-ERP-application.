const express = require('express');
const salesOrderController = require('../controllers/salesOrderController');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { confirmOrderSchema, dispatchSchema } = require('../validators/schemas');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requireRoles('ADMIN', 'SALES_USER'),
  asyncHandler(salesOrderController.getSalesOrders)
);

router.get(
  '/inventory',
  requireRoles('ADMIN', 'SALES_USER'),
  asyncHandler(salesOrderController.getInventory)
);

router.post(
  '/:id/confirm',
  requireRoles('ADMIN'),
  validate(confirmOrderSchema),
  asyncHandler(salesOrderController.confirmSalesOrder)
);

router.post(
  '/:id/dispatch',
  requireRoles('ADMIN'),
  validate(dispatchSchema),
  asyncHandler(salesOrderController.dispatchSalesOrder)
);

module.exports = router;
