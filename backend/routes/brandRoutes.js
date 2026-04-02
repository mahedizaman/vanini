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
} = require('../controllers/brandController');

/**
 * @openapi
 * tags:
 *   - name: Brands
 *     description: Brand endpoints
 * /api/brands:
 *   get:
 *     tags: [Brands]
 *     summary: List brands
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   post:
 *     tags: [Brands]
 *     summary: Create brand
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
 *               logo: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/brands/{id}:
 *   get:
 *     tags: [Brands]
 *     summary: Get brand by id
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
 *     tags: [Brands]
 *     summary: Update brand
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
 *     tags: [Brands]
 *     summary: Delete brand
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
