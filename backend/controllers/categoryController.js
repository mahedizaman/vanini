const asyncHandler = require('../middleware/asyncHandler');
const Category = require('../models/Category');

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getAll = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
});

const getOne = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
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

  res.status(201).json(category);
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

  res.json(category);
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
