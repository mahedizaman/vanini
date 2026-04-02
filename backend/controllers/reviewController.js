const mongoose = require('mongoose');

const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/Product');

const recalculateRatings = (product) => {
  const reviews = product.reviews || [];
  const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
  product.numReviews = reviews.length;
  product.ratings = reviews.length ? total / reviews.length : 0;
};

const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body || {};

  if (!productId || rating === undefined) {
    res.status(400);
    throw new Error('ProductId and rating are required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.some((r) => String(r.user) === String(req.user._id));
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  product.reviews.push({
    user: req.user._id,
    rating,
    comment,
    createdAt: Date.now(),
  });

  recalculateRatings(product);
  await product.save();

  res.status(201).json({ success: true, data: product });
});

const editReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body || {};

  if (!reviewId) {
    res.status(400);
    throw new Error('ReviewId is required');
  }

  const product = await Product.findOne({ 'reviews._id': reviewId });
  if (!product) {
    res.status(404);
    throw new Error('Review not found');
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (String(review.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  recalculateRatings(product);
  await product.save();

  res.json({ success: true, data: product });
});

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const product = await Product.findOne({ 'reviews._id': reviewId });
  if (!product) {
    res.status(404);
    throw new Error('Review not found');
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (String(review.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  review.remove();
  recalculateRatings(product);
  await product.save();

  res.json({ success: true, data: product });
});

const adminDeleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const product = await Product.findOne({ 'reviews._id': reviewId });
  if (!product) {
    res.status(404);
    throw new Error('Review not found');
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.remove();
  recalculateRatings(product);
  await product.save();

  res.json({ success: true, data: product });
});

module.exports = {
  addReview,
  editReview,
  deleteReview,
  adminDeleteReview,
};
