const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [revenueAgg, totalOrders, totalUsers, totalProducts, pendingOrders] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$finalPrice' } } },
    ]),
    Order.countDocuments({}),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({ orderStatus: 'pending' }),
  ]);

  const totalRevenue = revenueAgg?.[0]?.totalRevenue || 0;

  res.json({
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    pendingOrders,
  });
});

const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'name email');

  res.json({ success: true, data: orders });
});

const getTopProducts = asyncHandler(async (req, res) => {
  const top = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        quantity: { $sum: '$items.quantity' },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        quantity: 1,
        title: '$product.title',
        image: { $arrayElemAt: ['$product.images', 0] },
      },
    },
  ]);

  res.json({ success: true, data: top });
});

const getSalesChart = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const agg = await Order.aggregate([
    { $match: { createdAt: { $gte: start }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$finalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const byKey = new Map();
  for (const row of agg) {
    const key = `${row._id.year}-${row._id.month}`;
    byKey.set(key, { revenue: row.revenue || 0, orders: row.orders || 0 });
  }

  const result = [];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;
    const data = byKey.get(key) || { revenue: 0, orders: 0 };
    result.push({ month: monthNames[d.getMonth()], revenue: data.revenue, orders: data.orders });
  }

  res.json({ success: true, data: result });
});

module.exports = {
  getDashboardStats,
  getRecentOrders,
  getTopProducts,
  getSalesChart,
};
