const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/schemas');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/login', validate(loginSchema), asyncHandler(authController.login));

module.exports = router;
