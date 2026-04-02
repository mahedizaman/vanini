const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  applyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

/**
 * @openapi
 * tags:
 *   - name: Coupons
 *     description: Coupon and discount endpoints
 * /api/coupons/apply:
 *   post:
 *     tags: [Coupons]
 *     summary: Apply coupon
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, orderTotal]
 *             properties:
 *               code: { type: string }
 *               orderTotal: { type: number }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: Get all coupons (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   post:
 *     tags: [Coupons]
 *     summary: Create coupon (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/coupons/{id}:
 *   put:
 *     tags: [Coupons]
 *     summary: Update coupon (admin)
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
 *     tags: [Coupons]
 *     summary: Delete coupon (admin)
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

router.post('/apply', authMiddleware, applyCoupon);

router.get('/', authMiddleware, adminMiddleware, getAllCoupons);
router.post('/', authMiddleware, adminMiddleware, createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon);

module.exports = router;
