/**
 * Deterministic invoice number from order id + creation date (no extra DB sequence).
 */
function buildInvoiceNumber(order) {
  const d = order.createdAt || new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const tail = order._id.toString().slice(-6).toUpperCase();
  return `INV-${ymd}-${tail}`;
}

function assignInvoiceIfMissing(order) {
  if (order.invoiceNumber) return order;
  order.invoiceNumber = buildInvoiceNumber(order);
  order.invoiceGeneratedAt = new Date();
  return order;
}

function renderInvoiceHtml(order) {
  const user = order.user;
  const customerName = user && typeof user === 'object' ? user.name || '—' : '—';
  const customerEmail = user && typeof user === 'object' ? user.email || '' : '';
  const addr = order.shippingAddress || {};
  const addrLine = [addr.street, addr.city, addr.district, addr.postalCode].filter(Boolean).join(', ');
  const lines = (order.items || [])
    .map(
      (line) => `
    <tr>
      <td>${escapeHtml(line.title || 'Item')}</td>
      <td>${Number(line.quantity || 0)}</td>
      <td>৳${Number(line.price || 0).toFixed(0)}</td>
      <td>৳${(Number(line.price || 0) * Number(line.quantity || 0)).toFixed(0)}</td>
    </tr>`
    )
    .join('');

  const inv = order.invoiceNumber || '—';
  const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : '—';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(inv)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; max-width: 720px; margin: 0 auto; color: #111; }
    h1 { font-size: 1.35rem; margin-bottom: 0.25rem; }
    .muted { color: #555; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    th { background: #f4f4f4; }
    .totals { margin-top: 16px; text-align: right; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>Invoice</h1>
  <p class="muted">Vanini · ${escapeHtml(inv)}</p>
  <p><strong>Order ID:</strong> ${escapeHtml(String(order._id))}<br />
     <strong>Date:</strong> ${escapeHtml(created)}<br />
     <strong>Payment:</strong> ${escapeHtml(order.paymentMethod || '—')} · ${escapeHtml(order.paymentStatus || '—')}</p>
  <p><strong>Bill to</strong><br />
     ${escapeHtml(customerName)}${customerEmail ? `<br />${escapeHtml(customerEmail)}` : ''}<br />
     ${escapeHtml(addrLine || '—')}</p>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Line</th></tr></thead>
    <tbody>${lines || '<tr><td colspan="4">No lines</td></tr>'}</tbody>
  </table>
  <div class="totals">
    <p>Subtotal: ৳${Number(order.totalPrice || 0).toFixed(0)}</p>
    ${Number(order.discountAmount || 0) > 0 ? `<p>Discount: −৳${Number(order.discountAmount).toFixed(0)}</p>` : ''}
    <p>Shipping: ৳${Number(order.shippingCharge || 0).toFixed(0)}</p>
    <p><strong>Total: ৳${Number(order.finalPrice || 0).toFixed(0)}</strong></p>
  </div>
  <script>window.onload = function() { window.focus(); }</script>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  buildInvoiceNumber,
  assignInvoiceIfMissing,
  renderInvoiceHtml,
};
