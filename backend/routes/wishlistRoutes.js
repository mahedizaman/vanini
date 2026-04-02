const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');

/**
 * @openapi
 * tags:
 *   - name: Wishlist
 *     description: User wishlist endpoints
 * /api/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get wishlist
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/wishlist/{productId}:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add to wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove from wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 */

router.get('/', authMiddleware, getWishlist);
router.post('/:productId', authMiddleware, addToWishlist);
router.delete('/:productId', authMiddleware, removeFromWishlist);

module.exports = router;
