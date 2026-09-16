const prisma = require('../config/database');
const AppError = require('../utils/AppError');

function getAvailableQuantity(inventory) {
  return inventory.physicalQuantity - inventory.reservedQuantity;
}

async function getInventoryWithAvailability() {
  const inventory = await prisma.inventory.findMany({
    include: {
      product: {
        select: { id: true, sku: true, name: true, unit: true },
      },
    },
    orderBy: { product: { name: 'asc' } },
  });

  return inventory.map((item) => ({
    ...item,
    availableQuantity: getAvailableQuantity(item),
  }));
}

/**
 * Lock inventory row and reserve stock within a transaction.
 * Uses SELECT ... FOR UPDATE to prevent race conditions.
 */
async function lockAndReserveStock(tx, productId, quantity) {
  const rows = await tx.$queryRaw`
    SELECT id, product_id, physical_quantity, reserved_quantity
    FROM inventory
    WHERE product_id = ${productId}
    FOR UPDATE
  `;

  if (!rows.length) {
    throw new AppError(`Inventory not found for product ${productId}`, 404);
  }

  const row = rows[0];
  const physical = Number(row.physical_quantity);
  const reserved = Number(row.reserved_quantity);
  const available = physical - reserved;

  if (available < quantity) {
    throw new AppError(
      `Insufficient stock. Available: ${available}, Requested: ${quantity}`,
      400
    );
  }

  await tx.inventory.update({
    where: { productId },
    data: { reservedQuantity: reserved + quantity },
  });

  return { physical, reserved, availableAfter: available - quantity };
}

/**
 * Lock inventory row and dispatch stock within a transaction.
 */
async function lockAndDispatchStock(tx, productId, quantity) {
  const rows = await tx.$queryRaw`
    SELECT id, product_id, physical_quantity, reserved_quantity
    FROM inventory
    WHERE product_id = ${productId}
    FOR UPDATE
  `;

  if (!rows.length) {
    throw new AppError(`Inventory not found for product ${productId}`, 404);
  }

  const row = rows[0];
  const physical = Number(row.physical_quantity);
  const reserved = Number(row.reserved_quantity);

  if (reserved < quantity) {
    throw new AppError(
      `Cannot dispatch more than reserved. Reserved: ${reserved}, Requested: ${quantity}`,
      400
    );
  }

  if (physical < quantity) {
    throw new AppError(
      `Physical stock insufficient. Physical: ${physical}, Requested: ${quantity}`,
      400
    );
  }

  await tx.inventory.update({
    where: { productId },
    data: {
      physicalQuantity: physical - quantity,
      reservedQuantity: reserved - quantity,
    },
  });
}

module.exports = {
  getAvailableQuantity,
  getInventoryWithAvailability,
  lockAndReserveStock,
  lockAndDispatchStock,
};
