/** Subtotal after line-item sum (same as cartStore total). */
export function subtotalFromItems(items) {
  return (items || []).reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
    0
  );
}

/** Amount after discount (non-negative). */
export function amountAfterDiscount(subtotal, discountAmount) {
  return Math.max(0, Number(subtotal || 0) - Number(discountAmount || 0));
}

/** Shipping: free when post-discount amount exceeds threshold. */
export function shippingCharge(subtotal, discountAmount, { freeAbove = 999, rate = 60 } = {}) {
  const after = amountAfterDiscount(subtotal, discountAmount);
  return after > freeAbove ? 0 : rate;
}

export function orderGrandTotal(subtotal, discountAmount, shipping) {
  return amountAfterDiscount(subtotal, discountAmount) + Number(shipping || 0);
}
