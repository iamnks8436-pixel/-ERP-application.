const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

async function loginAs(email, password) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.data.token;
}

async function getProducts(token) {
  const res = await request(app)
    .get('/api/products')
    .set('Authorization', `Bearer ${token}`);
  return res.body.data;
}

async function createCustomer(token, overrides = {}) {
  const res = await request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      companyName: 'Test Industries Pvt Ltd',
      contactPerson: 'John Doe',
      mobile: '9876543210',
      email: `test-${Date.now()}@example.com`,
      city: 'Mumbai',
      ...overrides,
    });
  return res.body.data;
}

async function createEnquiry(token, productId, quantity = 10) {
  const customer = await createCustomer(token);
  const res = await request(app)
    .post('/api/enquiries')
    .set('Authorization', `Bearer ${token}`)
    .send({
      customerId: customer.id,
      requiredDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      notes: 'Test enquiry',
      items: [{ productId, quantity }],
    });
  return res.body.data;
}

async function createQuotation(token, enquiryId, productId, options = {}) {
  const {
    quantity = 10,
    unitPrice = 1000,
    discountPct = 10,
    gstPct = 18,
    validDays = 30,
  } = options;

  const res = await request(app)
    .post('/api/quotations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      enquiryId,
      validUntil: new Date(Date.now() + validDays * 86400000).toISOString(),
      items: [{ productId, quantity, unitPrice, discountPct, gstPct }],
    });
  return res.body.data;
}

async function acceptQuotation(token, quotationId) {
  await request(app)
    .patch(`/api/quotations/${quotationId}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'ACCEPTED' });
}

async function convertToSalesOrder(token, quotationId) {
  const res = await request(app)
    .post(`/api/quotations/${quotationId}/convert`)
    .set('Authorization', `Bearer ${token}`);
  return res;
}

async function resetProductInventory(productId, physical, reserved = 0) {
  await prisma.inventory.update({
    where: { productId },
    data: { physicalQuantity: physical, reservedQuantity: reserved },
  });
}

module.exports = {
  request,
  app,
  prisma,
  loginAs,
  getProducts,
  createCustomer,
  createEnquiry,
  createQuotation,
  acceptQuotation,
  convertToSalesOrder,
  resetProductInventory,
};
