const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createOrder,
  getMyOrders,
  getMyOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderInvoiceHtml,
  addTrackingNumber,
} = require('../controllers/orderController');

/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Order endpoints
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create order
 *     description: Create order for current user.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, shippingAddress, paymentMethod]
 *             properties:
 *               items: { type: array, items: { type: object } }
 *               shippingAddress: { type: object }
 *               paymentMethod: { type: string }
 *               couponCode: { type: string }
 *               discountAmount: { type: number }
 *               shippingCharge: { type: number }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Get my orders
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/orders/my/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get my single order
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
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (admin)
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
 *           schema:
 *             type: object
 *             required: [orderStatus]
 *             properties:
 *               orderStatus: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/orders/{id}/tracking:
 *   put:
 *     tags: [Orders]
 *     summary: Add tracking number (admin)
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
 *           schema:
 *             type: object
 *             required: [trackingNumber]
 *             properties:
 *               trackingNumber: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 */

router.post('/', authMiddleware, createOrder);

router.get('/my', authMiddleware, getMyOrders);
router.get('/my/:id', authMiddleware, getMyOrder);

router.get('/', authMiddleware, adminMiddleware, getAllOrders);
router.get('/:id/invoice', authMiddleware, adminMiddleware, getOrderInvoiceHtml);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.put('/:id/tracking', authMiddleware, adminMiddleware, addTrackingNumber);

module.exports = router;
