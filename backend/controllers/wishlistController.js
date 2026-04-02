const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product');

const populateWishlist = (userDoc) => {
  return User.findById(userDoc._id).populate({
    path: 'wishlist',
    select: 'title images price discountPrice slug ratings numReviews',
  });
};

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'title images price discountPrice slug ratings numReviews',
  });

  res.json({ success: true, wishlist: user?.wishlist || [] });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    res.status(400);
    throw new Error('ProductId is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);
  const exists = user.wishlist.some((id) => String(id) === String(productId));
  if (!exists) {
    user.wishlist.push(productId);
    await user.save();
  }

  const updated = await User.findById(user._id).populate({
    path: 'wishlist',
    select: 'title images price discountPrice slug ratings numReviews',
  });

  res.json({ success: true, wishlist: updated.wishlist });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((id) => String(id) !== String(productId));
  await user.save();

  const updated = await User.findById(user._id).populate({
    path: 'wishlist',
    select: 'title images price discountPrice slug ratings numReviews',
  });

  res.json({ success: true, wishlist: updated.wishlist });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
