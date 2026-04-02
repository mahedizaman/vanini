const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', brandSchema);
