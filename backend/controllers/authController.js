const crypto = require('crypto');

const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already exists' });
  }

  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (process.env.DEBUG_AUTH === 'true') {
    console.log('[auth/login] called', {
      hasEmail: Boolean(email),
      normalizedEmail,
      hasPassword: Boolean(password),
    });
  }

  if (!normalizedEmail || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  let decoded;
  try {
    const jwt = require('jsonwebtoken');
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const accessToken = generateAccessToken(user._id);
  return res.status(200).json({ success: true, accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({ success: true, message: 'Logged out' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const rawToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset',
    html: `<p>You requested a password reset.</p><p>Reset your password here: <a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return res.status(200).json({ success: true, message: 'Email sent' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const rawToken = req.params.token;
  const { password } = req.body || {};

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  return res.status(200).json({ success: true, message: 'Password reset successful' });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
