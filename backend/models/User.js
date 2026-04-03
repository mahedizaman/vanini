const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$/;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: [
      {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        district: String,
        postalCode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  // If the password already looks like a bcrypt hash, don't hash again.
  // This prevents double-hashing during legacy password migrations.
  if (typeof this.password === 'string' && bcryptHashPattern.test(this.password)) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (typeof this.password !== 'string') return false;

  // Normal path: stored value is a bcrypt hash.
  if (bcryptHashPattern.test(this.password)) {
    return bcrypt.compare(enteredPassword, this.password);
  }

  // Legacy path: stored password is plaintext (or an unexpected format).
  // If it matches, migrate it to a bcrypt hash on the fly.
  if (this.password !== enteredPassword) return false;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(enteredPassword, salt);
  await this.save();
  return true;
};

module.exports = mongoose.model('User', userSchema);
