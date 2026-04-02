const asyncHandler = require('../middleware/asyncHandler');
const Coupon = require('../models/Coupon');

const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body || {};

  if (!code || orderTotal === undefined) {
    res.status(400);
    throw new Error('code and orderTotal are required');
  }

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
  if (!coupon || !coupon.isActive || !coupon.expiryDate || coupon.expiryDate <= new Date()) {
    res.status(400);
    throw new Error('Invalid or expired coupon');
  }

  const total = Number(orderTotal);
  if (Number.isNaN(total)) {
    res.status(400);
    throw new Error('Invalid orderTotal');
  }

  if (total < Number(coupon.minOrderAmount || 0)) {
    res.status(400);
    throw new Error('Order does not meet coupon requirements');
  }

  if (typeof coupon.usageLimit === 'number' && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (total * coupon.discount) / 100;
  } else if (coupon.type === 'fixed') {
    discount = coupon.discount;
  }

  const finalPrice = total - discount;

  res.json({ success: true, discount, finalPrice });
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.code) payload.code = String(payload.code).toUpperCase();

  const coupon = await Coupon.create(payload);
  res.status(201).json({ success: true, data: coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  if (payload.code) payload.code = String(payload.code).toUpperCase();

  const coupon = await Coupon.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.json({ success: true, data: coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = {
  applyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
