const {
  loginAs,
  getProducts,
  createEnquiry,
  createQuotation,
  acceptQuotation,
  convertToSalesOrder,
  resetProductInventory,
  request,
  app,
  prisma,
} = require('./helpers');

describe('Inventory Reservation', () => {
  let salesToken;
  let adminToken;
  let product;

  beforeAll(async () => {
    salesToken = await loginAs('sales@erp.com', 'Sales@123');
    adminToken = await loginAs('admin@erp.com', 'Admin@123');
    const products = await getProducts(salesToken);
    product = products[3];
  });

  async function createConfirmedOrder(quantity) {
    await resetProductInventory(product.id, 100, 0);

    const enquiry = await createEnquiry(salesToken, product.id, quantity);
    const quotation = await createQuotation(salesToken, enquiry.id, product.id, { quantity });
    await acceptQuotation(salesToken, quotation.id);
    const convertRes = await convertToSalesOrder(salesToken, quotation.id);
    const orderId = convertRes.body.data.id;

    const confirmRes = await request(app)
      .post(`/api/sales-orders/${orderId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    return { orderId, confirmRes };
  }

  test('Cannot reserve more stock than available', async () => {
    await resetProductInventory(product.id, 50, 40);

    const enquiry = await createEnquiry(salesToken, product.id, 20);
    const quotation = await createQuotation(salesToken, enquiry.id, product.id, { quantity: 20 });
    await acceptQuotation(salesToken, quotation.id);
    const convertRes = await convertToSalesOrder(salesToken, quotation.id);
    const orderId = convertRes.body.data.id;

    const confirmRes = await request(app)
      .post(`/api/sales-orders/${orderId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.message).toMatch(/Insufficient stock/i);

    const inventory = await prisma.inventory.findUnique({ where: { productId: product.id } });
    expect(inventory.reservedQuantity).toBe(40);
  });

  test('Unauthorized user cannot perform ADMIN confirm operation', async () => {
    await resetProductInventory(product.id, 100, 0);

    const enquiry = await createEnquiry(salesToken, product.id, 5);
    const quotation = await createQuotation(salesToken, enquiry.id, product.id, { quantity: 5 });
    await acceptQuotation(salesToken, quotation.id);
    const convertRes = await convertToSalesOrder(salesToken, quotation.id);
    const orderId = convertRes.body.data.id;

    const confirmRes = await request(app)
      .post(`/api/sales-orders/${orderId}/confirm`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(confirmRes.status).toBe(403);
    expect(confirmRes.body.message).toMatch(/Insufficient permissions/i);
  });

  test('Simultaneous inventory reservation - only one succeeds when stock insufficient', async () => {
    await resetProductInventory(product.id, 100, 0);

    const enquiry1 = await createEnquiry(salesToken, product.id, 80);
    const q1 = await createQuotation(salesToken, enquiry1.id, product.id, { quantity: 80 });
    await acceptQuotation(salesToken, q1.id);
    const order1 = (await convertToSalesOrder(salesToken, q1.id)).body.data;

    const enquiry2 = await createEnquiry(salesToken, product.id, 50);
    const q2 = await createQuotation(salesToken, enquiry2.id, product.id, { quantity: 50 });
    await acceptQuotation(salesToken, q2.id);
    const order2 = (await convertToSalesOrder(salesToken, q2.id)).body.data;

    const [res1, res2] = await Promise.all([
      request(app)
        .post(`/api/sales-orders/${order1.id}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`),
      request(app)
        .post(`/api/sales-orders/${order2.id}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`),
    ]);

    const successCount = [res1, res2].filter((r) => r.status === 200).length;
    const failCount = [res1, res2].filter((r) => r.status === 400).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(1);

    const inventory = await prisma.inventory.findUnique({ where: { productId: product.id } });
    expect(inventory.reservedQuantity).toBeLessThanOrEqual(100);
    expect(inventory.physicalQuantity - inventory.reservedQuantity).toBeGreaterThanOrEqual(0);
  });

  test('Successful reservation updates reserved quantity correctly', async () => {
    const { confirmRes } = await createConfirmedOrder(60);
    expect(confirmRes.status).toBe(200);

    const inventory = await prisma.inventory.findUnique({ where: { productId: product.id } });
    expect(inventory.physicalQuantity).toBe(100);
    expect(inventory.reservedQuantity).toBe(60);
  });
});
