const { calculateLineItem, calculateGrandTotal } = require('../src/utils/quotationCalculator');
const {
  loginAs,
  getProducts,
  createEnquiry,
  createQuotation,
  acceptQuotation,
  convertToSalesOrder,
  request,
  app,
} = require('./helpers');

describe('Quotation Module', () => {
  let salesToken;

  beforeAll(async () => {
    salesToken = await loginAs('sales@erp.com', 'Sales@123');
  });

  test('Quotation total calculation is correct', () => {
    const line = calculateLineItem({
      quantity: 10,
      unitPrice: 1000,
      discountPct: 10,
      gstPct: 18,
    });

    expect(line.baseAmount).toBe(10000);
    expect(line.discountAmount).toBe(1000);
    expect(line.afterDiscount).toBe(9000);
    expect(line.gstAmount).toBe(1620);
    expect(line.finalAmount).toBe(10620);

    const grandTotal = calculateGrandTotal([line]);
    expect(grandTotal).toBe(10620);
  });

  test('Backend stores correctly calculated quotation totals', async () => {
    const products = await getProducts(salesToken);
    const product = products[0];
    const enquiry = await createEnquiry(salesToken, product.id, 5);

    const quotation = await createQuotation(salesToken, enquiry.id, product.id, {
      quantity: 5,
      unitPrice: 2000,
      discountPct: 5,
      gstPct: 18,
    });

    const item = quotation.items[0];
    expect(Number(item.baseAmount)).toBe(10000);
    expect(Number(item.discountAmount)).toBe(500);
    expect(Number(item.afterDiscount)).toBe(9500);
    expect(Number(item.gstAmount)).toBe(1710);
    expect(Number(item.finalAmount)).toBe(11210);
    expect(Number(quotation.grandTotal)).toBe(11210);
  });

  test('Draft quotation cannot create sales order', async () => {
    const products = await getProducts(salesToken);
    const enquiry = await createEnquiry(salesToken, products[0].id, 2);
    const quotation = await createQuotation(salesToken, enquiry.id, products[0].id, {
      quantity: 2,
    });

    expect(quotation.status).toBe('DRAFT');

    const res = await convertToSalesOrder(salesToken, quotation.id);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/ACCEPTED/i);
  });

  test('Rejected quotation cannot create sales order', async () => {
    const products = await getProducts(salesToken);
    const enquiry = await createEnquiry(salesToken, products[1].id, 2);
    const quotation = await createQuotation(salesToken, enquiry.id, products[1].id, {
      quantity: 2,
    });

    await request(app)
      .patch(`/api/quotations/${quotation.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'REJECTED' });

    const res = await convertToSalesOrder(salesToken, quotation.id);
    expect(res.status).toBe(400);
  });

  test('Same quotation cannot create duplicate sales orders', async () => {
    const products = await getProducts(salesToken);
    const enquiry = await createEnquiry(salesToken, products[2].id, 3);
    const quotation = await createQuotation(salesToken, enquiry.id, products[2].id, {
      quantity: 3,
    });

    await acceptQuotation(salesToken, quotation.id);

    const first = await convertToSalesOrder(salesToken, quotation.id);
    expect(first.status).toBe(201);

    const second = await convertToSalesOrder(salesToken, quotation.id);
    expect(second.status).toBe(409);
  });
});
