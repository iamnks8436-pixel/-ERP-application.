const express = require('express');
const enquiryController = require('../controllers/enquiryController');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { enquirySchema } = require('../validators/schemas');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles('ADMIN', 'SALES_USER'),
  validate(enquirySchema),
  asyncHandler(enquiryController.createEnquiry)
);

router.get(
  '/',
  requireRoles('ADMIN', 'SALES_USER'),
  asyncHandler(enquiryController.getEnquiries)
);

module.exports = router;
