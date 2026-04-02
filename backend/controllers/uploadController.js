const asyncHandler = require('../middleware/asyncHandler');
const { cloudinary } = require('../utils/cloudinary');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image uploaded');
  }

  return res.status(200).json({
    success: true,
    url: req.file.path,
    public_id: req.file.filename,
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  const { public_id } = req.body || {};

  if (!public_id) {
    res.status(400);
    throw new Error('public_id is required');
  }

  await cloudinary.uploader.destroy(public_id);
  return res.json({ success: true, message: 'Image deleted' });
});

module.exports = {
  uploadImage,
  deleteImage,
};
