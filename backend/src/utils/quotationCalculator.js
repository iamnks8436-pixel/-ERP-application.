/**
 * Calculate quotation line amounts server-side.
 * Never trust totals from the client.
 */
function calculateLineItem({ quantity, unitPrice, discountPct = 0, gstPct = 18 }) {
  const qty = Number(quantity);
  const price = Number(unitPrice);
  const discount = Number(discountPct);
  const gst = Number(gstPct);

  if (qty <= 0) throw new Error('Quantity must be greater than zero');
  if (price < 0) throw new Error('Unit price cannot be negative');
  if (discount < 0 || discount > 100) throw new Error('Discount must be between 0 and 100');
  if (gst < 0 || gst > 100) throw new Error('GST must be between 0 and 100');

  const baseAmount = round2(qty * price);
  const discountAmount = round2((baseAmount * discount) / 100);
  const afterDiscount = round2(baseAmount - discountAmount);
  const gstAmount = round2((afterDiscount * gst) / 100);
  const finalAmount = round2(afterDiscount + gstAmount);

  return {
    baseAmount,
    discountAmount,
    afterDiscount,
    gstAmount,
    finalAmount,
  };
}

function calculateGrandTotal(items) {
  return round2(items.reduce((sum, item) => sum + item.finalAmount, 0));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

module.exports = {
  calculateLineItem,
  calculateGrandTotal,
  round2,
};
