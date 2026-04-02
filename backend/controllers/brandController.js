const asyncHandler = require('../middleware/asyncHandler');
const Brand = require('../models/Brand');

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getAll = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ createdAt: -1 });
  res.json(brands);
});

const getOne = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  res.json(brand);
});

const create = asyncHandler(async (req, res) => {
  const { name, logo } = req.body || {};
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }

  const brand = await Brand.create({
    name,
    slug: slugify(name),
    logo,
  });

  res.status(201).json(brand);
});

const update = asyncHandler(async (req, res) => {
  const { name, slug, logo } = req.body || {};

  const updateData = {};
  if (typeof name === 'string') {
    updateData.name = name;
    updateData.slug = slugify(name);
  }
  if (typeof slug === 'string') updateData.slug = slugify(slug);
  if (typeof logo === 'string') updateData.logo = logo;

  const brand = await Brand.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }

  res.json(brand);
});

const remove = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    res.status(404);
    throw new Error('Brand not found');
  }
  res.json({ success: true, message: 'Brand deleted' });
});

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
};
