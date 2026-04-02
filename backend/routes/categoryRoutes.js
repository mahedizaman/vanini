const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAll,
  getOne,
  create,
  update,
  remove,
} = require('../controllers/categoryController');

/**
 * @openapi
 * tags:
 *   - name: Categories
 *     description: Category endpoints
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories
 *     description: Get all categories.
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     description: Admin creates category.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               image: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by id
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
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
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

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authMiddleware, adminMiddleware, create);
router.put('/:id', authMiddleware, adminMiddleware, update);
router.delete('/:id', authMiddleware, adminMiddleware, remove);

module.exports = router;
