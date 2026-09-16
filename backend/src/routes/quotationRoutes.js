const express = require('express');
const quotationController = require('../controllers/quotationController');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const {
  quotationSchema,
  quotationStatusSchema,
  convertQuotationSchema,
} = require('../validators/schemas');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles('ADMIN', 'SALES_USER'),
  validate(quotationSchema),
  asyncHandler(quotationController.createQuotation)
);

router.get(
  '/',
  requireRoles('ADMIN', 'SALES_USER'),
  asyncHandler(quotationController.getQuotations)
);

router.patch(
  '/:id/status',
  requireRoles('ADMIN', 'SALES_USER'),
  validate(quotationStatusSchema),
  asyncHandler(quotationController.updateQuotationStatus)
);

router.post(
  '/:id/convert',
  requireRoles('ADMIN', 'SALES_USER'),
  validate(convertQuotationSchema),
  asyncHandler(quotationController.convertToSalesOrder)
);

module.exports = router;
