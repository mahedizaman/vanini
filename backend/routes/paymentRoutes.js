const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} = require('../controllers/paymentController');

/**
 * @openapi
 * tags:
 *   - name: Payment
 *     description: SSLCommerz payment endpoints
 * /api/payment/init:
 *   post:
 *     tags: [Payment]
 *     summary: Initialize payment
 *     description: Starts SSLCommerz payment and returns gateway URL.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/payment/success:
 *   post:
 *     tags: [Payment]
 *     summary: Payment success callback
 *     description: Validates transaction and redirects to frontend success URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               val_id: { type: string }
 *               tran_id: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/payment/fail:
 *   post:
 *     tags: [Payment]
 *     summary: Payment fail callback
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tran_id: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/payment/cancel:
 *   post:
 *     tags: [Payment]
 *     summary: Payment cancel callback
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 * /api/payment/ipn:
 *   post:
 *     tags: [Payment]
 *     summary: Payment IPN callback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               val_id: { type: string }
 *               tran_id: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 */

router.post('/init', authMiddleware, initPayment);
router.post('/success', paymentSuccess);
router.get('/success', paymentSuccess);
router.post('/fail', paymentFail);
router.get('/fail', paymentFail);
router.post('/cancel', paymentCancel);
router.get('/cancel', paymentCancel);
router.post('/ipn', paymentIPN);
router.get('/ipn', paymentIPN);

module.exports = router;
