const mongoose = require('mongoose');

const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/Product');
const Category = require('../models/Category');

const makeSlugFromTitle = (title) =>
  String(title || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const getAll = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    size,
    color,
    isFeatured,
    sort,
  } = req.query || {};

  const query = { isActive: true };

  if (search) {
    const re = new RegExp(String(search), 'i');
    query.$or = [{ title: re }, { tags: re }];
  }

  if (category) {
    const categoryValue = String(category);
    if (mongoose.isValidObjectId(categoryValue)) {
      query.category = categoryValue;
    } else {
      const cat = await Category.findOne({ slug: categoryValue.toLowerCase() }).select('_id');
      query.category = cat ? cat._id : '__no_category__';
    }
  }

  if (brand) {
    const brandValue = String(brand);
    query.brand = mongoose.isValidObjectId(brandValue) ? brandValue : '__no_brand__';
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  if (size) query.sizes = String(size);
  if (color) query.colors = String(color);

  if (isFeatured !== undefined) {
    if (String(isFeatured) === 'true') query.isFeatured = true;
    if (String(isFeatured) === 'false') query.isFeatured = false;
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    popular: { ratings: -1 },
  };
  const sortOption = sortMap[String(sort)] || { createdAt: -1 };

  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '12', 10), 1);
  const skip = (page - 1) * limit;

  const total = await Product.countDocuments(query);
  const pages = Math.ceil(total / limit) || 0;

  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('category', 'name slug')
    .populate('brand', 'name slug');

  res.json({
    success: true,
    data: products,
    pagination: { total, page, pages, limit },
  });
});

/** Admin catalog: all products including inactive; optional isActive filter */
const getAllAdmin = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    size,
    color,
    isFeatured,
    isActive,
    sort,
  } = req.query || {};

  const query = {};

  if (String(isActive) === 'true') query.isActive = true;
  if (String(isActive) === 'false') query.isActive = false;

  if (search) {
    const re = new RegExp(String(search), 'i');
    query.$or = [{ title: re }, { tags: re }];
  }

  if (category) {
    const categoryValue = String(category);
    if (mongoose.isValidObjectId(categoryValue)) {
      query.category = categoryValue;
    } else {
      const cat = await Category.findOne({ slug: categoryValue.toLowerCase() }).select('_id');
      query.category = cat ? cat._id : '__no_category__';
    }
  }

  if (brand) {
    const brandValue = String(brand);
    query.brand = mongoose.isValidObjectId(brandValue) ? brandValue : '__no_brand__';
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  if (size) query.sizes = String(size);
  if (color) query.colors = String(color);

  if (isFeatured !== undefined) {
    if (String(isFeatured) === 'true') query.isFeatured = true;
    if (String(isFeatured) === 'false') query.isFeatured = false;
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    popular: { ratings: -1 },
  };
  const sortOption = sortMap[String(sort)] || { createdAt: -1 };

  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
  const skip = (page - 1) * limit;

  const total = await Product.countDocuments(query);
  const pages = Math.ceil(total / limit) || 0;

  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('category', 'name slug')
    .populate('brand', 'name slug');

  res.json({
    success: true,
    data: products,
    pagination: { total, page, pages, limit },
  });
});

const getOneAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('brand', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .populate('reviews.user', 'name');

  if (!product || product.isActive === false) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: product });
});

const getBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: String(req.params.slug).toLowerCase() })
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .populate('reviews.user', 'name');

  if (!product || product.isActive === false) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  res.json({ success: true, data: product });
});

const create = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    discountPrice,
    category,
    brand,
    tags,
    images,
    sizes,
    colors,
    inventory,
    stock,
    sku,
    isFeatured,
    isActive,
  } = req.body || {};

  const slug = makeSlugFromTitle(title);

  const product = await Product.create({
    title,
    slug,
    description,
    price,
    discountPrice,
    category,
    brand,
    tags,
    images,
    sizes,
    colors,
    inventory,
    stock,
    sku,
    isFeatured,
    isActive,
  });

  res.status(201).json({ success: true, data: product });
});

const update = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (updateData.title) {
    updateData.slug = makeSlugFromTitle(updateData.title);
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('category', 'name slug')
    .populate('brand', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

const softDelete = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, message: 'Product deactivated' });
});

module.exports = {
  getAll,
  getAllAdmin,
  getOneAdmin,
  getOne,
  getBySlug,
  create,
  update,
  softDelete,
};
