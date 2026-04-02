const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  addReview,
  editReview,
  deleteReview,
  adminDeleteReview,
} = require('../controllers/reviewController');

/**
 * @openapi
 * tags:
 *   - name: Reviews
 *     description: Product review endpoints
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Add review
 *     description: Add review to a product for current user.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, rating]
 *             properties:
 *               productId: { type: string }
 *               rating: { type: number }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/reviews/{reviewId}:
 *   put:
 *     tags: [Reviews]
 *     summary: Edit review
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: number }
 *               comment: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete own review
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/reviews/admin/{reviewId}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete any review (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 */

router.post('/', authMiddleware, addReview);
router.put('/:reviewId', authMiddleware, editReview);
router.delete('/admin/:reviewId', authMiddleware, adminMiddleware, adminDeleteReview);
router.delete('/:reviewId', authMiddleware, deleteReview);

module.exports = router;
