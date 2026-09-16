const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleGuard');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requireRoles('ADMIN', 'SALES_USER'),
  asyncHandler(async (req, res) => {
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
      },
      orderBy: { name: 'asc' },
    });

    const data = products.map((p) => ({
      ...p,
      availableQuantity: p.inventory
        ? p.inventory.physicalQuantity - p.inventory.reservedQuantity
        : 0,
    }));

    res.json({ success: true, data });
  })
);

module.exports = router;
