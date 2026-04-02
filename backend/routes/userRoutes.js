const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  getUserByIdAdmin,
  deleteUser,
} = require('../controllers/userController');

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: User profile and user management
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user
 *     description: Return logged-in user profile.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/users/update:
 *   put:
 *     tags: [Users]
 *     summary: Update current user
 *     description: Update name and/or address array.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               address:
 *                 type: array
 *                 items: { type: object }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/users/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change password
 *     description: Verify current password and save new password.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Admin list users, optionally filter by search on name/email.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     description: Admin deletes user by id (cannot delete self).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 */

router.get('/me', authMiddleware, getMe);
router.put('/update', authMiddleware, updateMe);
router.put('/change-password', authMiddleware, changePassword);

router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.get('/:id', authMiddleware, adminMiddleware, getUserByIdAdmin);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
