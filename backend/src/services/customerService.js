const prisma = require('../config/database');

async function createCustomer(data) {
  return prisma.customer.create({ data });
}

async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { companyName: 'asc' },
  });
}

async function getCustomerById(id) {
  return prisma.customer.findUnique({ where: { id } });
}

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
};
