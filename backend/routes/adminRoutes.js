const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getRecentOrders,
  getTopProducts,
  getSalesChart,
} = require('../controllers/adminController');

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin dashboard analytics
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard stats
 *     description: Returns revenue, order, user, product and pending-order counts.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/admin/recent-orders:
 *   get:
 *     tags: [Admin]
 *     summary: Recent orders
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/admin/top-products:
 *   get:
 *     tags: [Admin]
 *     summary: Top products
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/admin/sales-chart:
 *   get:
 *     tags: [Admin]
 *     summary: Sales chart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 */

router.get('/stats', authMiddleware, adminMiddleware, getDashboardStats);
router.get('/recent-orders', authMiddleware, adminMiddleware, getRecentOrders);
router.get('/top-products', authMiddleware, adminMiddleware, getTopProducts);
router.get('/sales-chart', authMiddleware, adminMiddleware, getSalesChart);

module.exports = router;
