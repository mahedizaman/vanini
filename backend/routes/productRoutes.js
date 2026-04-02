const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getAll,
  getAllAdmin,
  getOneAdmin,
  getOne,
  getBySlug,
  create,
  update,
  softDelete,
} = require('../controllers/productController');

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Product catalog endpoints
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     description: List active products with filtering, sorting, and pagination.
 *     parameters:
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: brand, schema: { type: string } }
 *       - { in: query, name: minPrice, schema: { type: number } }
 *       - { in: query, name: maxPrice, schema: { type: number } }
 *       - { in: query, name: size, schema: { type: string } }
 *       - { in: query, name: color, schema: { type: string } }
 *       - { in: query, name: isFeatured, schema: { type: boolean } }
 *       - { in: query, name: sort, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   post:
 *     tags: [Products]
 *     summary: Create product
 *     description: Admin creates a new product.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, price]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               category: { type: string }
 *               brand: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/products/slug/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by slug
 *     description: Fetch one active product by slug.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id
 *     description: Fetch one active product by id.
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
 *     tags: [Products]
 *     summary: Update product
 *     description: Admin updates product fields.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   delete:
 *     tags: [Products]
 *     summary: Soft-delete product
 *     description: Admin marks product as inactive.
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
router.get('/slug/:slug', getBySlug);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllAdmin);
router.get('/admin/:id', authMiddleware, adminMiddleware, getOneAdmin);
router.get('/:id', getOne);

router.post('/', authMiddleware, adminMiddleware, create);
router.put('/:id', authMiddleware, adminMiddleware, update);
router.delete('/:id', authMiddleware, adminMiddleware, softDelete);

module.exports = router;
