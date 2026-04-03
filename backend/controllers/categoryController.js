const asyncHandler = require('../middleware/asyncHandler');
const Category = require('../models/Category');
const { cloudinary } = require('../utils/cloudinary');

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const toCloudinaryUrl = (value) => {
  if (!value) return value;
  const s = String(value).trim();
  if (!s) return s;

  // If it's already a full URL, return as-is.
  if (/^https?:\/\//i.test(s)) return s;
  if (s.includes('res.cloudinary.com')) {
    // Next/Image remotePatterns in this project allow `https` only.
    // Some stored values may be `http://...`; normalize to https.
    return s.replace(/^http:\/\//i, "https://");
  }

  // If it's a path/public_id with an extension, remove the extension.
  // Example stored value: `ecommerce/category-name.jpg` -> `ecommerce/category-name`
  const normalizedPublicId = s.replace(/\.(jpe?g|png|webp)$/i, '');

  return cloudinary.url(normalizedPublicId, {
    width: 800,
    crop: 'limit',
    quality: 'auto',
  });
};

const getAll = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  const transformed = categories.map((c) => ({
    ...c,
    image: toCloudinaryUrl(c.image),
  }));
  res.json(transformed);
});

const getOne = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({
    ...category.toObject(),
    image: toCloudinaryUrl(category.image),
  });
});

const create = asyncHandler(async (req, res) => {
  const { name, image } = req.body || {};
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }

  const category = await Category.create({
    name,
    slug: slugify(name),
    image,
  });

  res.status(201).json({
    ...category.toObject(),
    image: toCloudinaryUrl(category.image),
  });
});

const update = asyncHandler(async (req, res) => {
  const { name, slug, image } = req.body || {};

  const updateData = {};
  if (typeof name === 'string') {
    updateData.name = name;
    updateData.slug = slugify(name);
  }
  if (typeof slug === 'string') updateData.slug = slugify(slug);
  if (typeof image === 'string') updateData.image = image;

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({
    ...category.toObject(),
    image: toCloudinaryUrl(category.image),
  });
});

const remove = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
};
