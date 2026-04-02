const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication and password recovery
 */
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register user
 *     description: Create a new account and return access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Authenticate user and return access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Read refresh token from cookie and issue new access token.
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     description: Clear refresh token from cookie and database.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Forgot password
 *     description: Generate password reset token and send reset email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password
 *     description: Reset password with recovery token.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 */

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;

