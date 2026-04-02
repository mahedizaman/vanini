const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Order = require('../models/Order');

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('wishlist');

  res.json(user);
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, address } = req.body || {};

  const update = {};
  if (typeof name === 'string') update.name = name;
  if (Array.isArray(address)) update.address = address;

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  })
    .select('-password')
    .populate('wishlist');

  res.json(user);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }

  const user = await User.findById(req.user._id);
  const ok = await user.matchPassword(currentPassword);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  user.password = newPassword;
  await user.save();

  const safeUser = await User.findById(user._id).select('-password').populate('wishlist');
  res.json(safeUser);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { search } = req.query || {};

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: String(search), $options: 'i' } },
      { email: { $regex: String(search), $options: 'i' } },
    ];
  }

  const users = await User.find(filter).select('-password');
  const ids = users.map((u) => u._id);
  const counts = await Order.aggregate([
    { $match: { user: { $in: ids } } },
    { $group: { _id: '$user', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const data = users.map((u) => ({
    ...u.toObject(),
    ordersCount: countMap.get(String(u._id)) || 0,
  }));
  res.json(data);
});

const getUserByIdAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const orders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('finalPrice orderStatus paymentStatus createdAt items');
  res.json({ user, orders });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (String(req.user._id) === String(id)) {
    return res.status(400).json({ success: false, message: 'Cannot delete self' });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, message: 'User deleted' });
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  getUserByIdAdmin,
  deleteUser,
};
