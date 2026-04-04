const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const { assignInvoiceIfMissing, renderInvoiceHtml } = require('../utils/orderInvoice');

const PAYMENT_METHODS = ['COD', 'DirectPay', 'SSLCommerz'];

const calcTotalPrice = (items) =>
  (items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    discountAmount = 0,
    shippingCharge = 0,
  } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Order items are required');
  }

  if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method');
  }

  const totalPrice = calcTotalPrice(items);
  const finalPrice = totalPrice - Number(discountAmount || 0) + Number(shippingCharge || 0);

  const orderStatus = paymentMethod === 'COD' ? 'processing' : 'pending';

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    discountAmount,
    shippingCharge,
    totalPrice,
    finalPrice,
    paymentStatus: 'pending',
    orderStatus,
  });

  // COD: issue invoice immediately (pay on delivery — admin fulfillment doc).
  if (paymentMethod === 'COD') {
    assignInvoiceIfMissing(order);
    await order.save();
  }

  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'title images');

  res.json({ success: true, data: orders });
});

const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (String(order.user?._id || order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, data: order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query || {};
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.orderStatus = String(status);

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(String(startDate));
    if (endDate) {
      const end = new Date(String(endDate));
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const total = await Order.countDocuments(filter);
  const pages = Math.ceil(total / limit) || 0;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');

  res.json({ success: true, data: orders, pagination: { total, page, pages, limit } });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body || {};
  if (!orderStatus) {
    res.status(400);
    throw new Error('orderStatus is required');
  }

  const update = { orderStatus };
  if (orderStatus === 'delivered') update.deliveredAt = new Date();

  const order = await Order.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({ success: true, data: order });
});

const getOrderInvoiceHtml = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const html = renderInvoiceHtml(order);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

const addTrackingNumber = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.body || {};
  if (trackingNumber === undefined || trackingNumber === null) {
    res.status(400);
    throw new Error('trackingNumber is required');
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { trackingNumber: String(trackingNumber) },
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({ success: true, data: order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderInvoiceHtml,
  addTrackingNumber,
};
