const SSLCommerzPayment = require('sslcommerz-lts');

const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');
const { assignInvoiceIfMissing } = require('../utils/orderInvoice');

const getSslcz = () =>
  new SSLCommerzPayment(
    process.env.SSLCOMMERZ_STORE_ID,
    process.env.SSLCOMMERZ_STORE_PASS,
    String(process.env.SSLCOMMERZ_IS_LIVE) === 'true'
  );

const initPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) {
    res.status(400);
    throw new Error('orderId is required');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (String(order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const BACKEND_URL = process.env.BACKEND_URL;
  if (!BACKEND_URL) {
    res.status(500);
    throw new Error('BACKEND_URL is not configured');
  }

  const data = {
    total_amount: order.finalPrice,
    currency: 'BDT',
    tran_id: order._id.toString(),
    success_url: `${BACKEND_URL}/api/payment/success`,
    fail_url: `${BACKEND_URL}/api/payment/fail`,
    cancel_url: `${BACKEND_URL}/api/payment/cancel`,
    ipn_url: `${BACKEND_URL}/api/payment/ipn`,
    cus_name: order.shippingAddress?.fullName || 'Customer',
    cus_email: req.user.email,
    cus_phone: order.shippingAddress?.phone || '',
    cus_add1: order.shippingAddress?.street || '',
    cus_city: order.shippingAddress?.city || '',
    product_name: `Order #${order._id}`,
    product_category: 'E-commerce',
    product_profile: 'general',
    shipping_method: 'Courier',
    num_of_item: Array.isArray(order.items) ? order.items.length : 0,
  };

  const sslcz = getSslcz();
  const apiResponse = await sslcz.init(data);

  return res.json({ success: true, GatewayPageURL: apiResponse?.GatewayPageURL });
});

const handlePaidOrder = async (tranId) => {
  const order = await Order.findById(tranId).populate('user', 'name email');
  if (!order) return null;

  order.paymentStatus = 'paid';
  order.orderStatus = 'processing';
  order.paidAt = new Date();
  order.transactionId = tranId;
  assignInvoiceIfMissing(order);
  await order.save();

  const email = order.user?.email;
  if (email) {
    await sendEmail({
      to: email,
      subject: 'Order Confirmation',
      html: `<p>Your payment was successful.</p><p>Order ID: ${order._id}</p>`,
    });
  }

  return order;
};

const paymentSuccess = asyncHandler(async (req, res) => {
  const src = req.body || req.query || {};
  const { val_id, tran_id } = src;
  if (!val_id || !tran_id) {
    res.status(400);
    throw new Error('val_id and tran_id are required');
  }

  const sslcz = getSslcz();
  const validation = await sslcz.validate({ val_id });

  const isValid =
    validation &&
    (validation.status === 'VALID' || validation.status === 'VALIDATED') &&
    String(validation.tran_id) === String(tran_id);

  if (!isValid) {
    res.status(400);
    throw new Error('Payment validation failed');
  }

  const order = await handlePaidOrder(tran_id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
  return res.redirect(`${CLIENT_URL}/orders/${order._id}?status=success`);
});

const paymentFail = asyncHandler(async (req, res) => {
  const src = req.body || req.query || {};
  const { tran_id } = src;
  if (tran_id) {
    await Order.findByIdAndUpdate(tran_id, { paymentStatus: 'failed' });
  }

  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
  return res.redirect(`${CLIENT_URL}/checkout?status=failed`);
});

const paymentCancel = asyncHandler(async (req, res) => {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
  return res.redirect(`${CLIENT_URL}/checkout?status=cancelled`);
});

const paymentIPN = asyncHandler(async (req, res) => {
  const src = req.body || req.query || {};
  const { val_id, tran_id } = src;
  if (!val_id || !tran_id) {
    return res.status(400).json({ success: false, message: 'val_id and tran_id are required' });
  }

  const sslcz = getSslcz();
  const validation = await sslcz.validate({ val_id });

  const isValid =
    validation &&
    (validation.status === 'VALID' || validation.status === 'VALIDATED') &&
    String(validation.tran_id) === String(tran_id);

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment validation failed' });
  }

  const order = await handlePaidOrder(tran_id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  return res.json({ success: true });
});

/**
 * Demo / sandbox: completes "online" payment without charging real money.
 */
const simulateDirectPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) {
    res.status(400);
    throw new Error('orderId is required');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (String(order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (order.paymentMethod !== 'DirectPay') {
    res.status(400);
    throw new Error('This order is not using demo online payment');
  }

  if (order.paymentStatus === 'paid') {
    return res.json({ success: true, data: order, message: 'Already paid' });
  }

  order.paymentStatus = 'paid';
  order.orderStatus = 'processing';
  order.paidAt = new Date();
  order.transactionId = `DEMO-${Date.now()}`;
  assignInvoiceIfMissing(order);
  await order.save();

  return res.json({ success: true, data: order });
});

module.exports = {
  initPayment,
  simulateDirectPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
};
