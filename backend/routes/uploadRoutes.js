const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { upload } = require('../utils/cloudinary');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

/**
 * @openapi
 * tags:
 *   - name: Upload
 *     description: Cloudinary image upload endpoints
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload image
 *     description: Admin uploads one image file with multipart/form-data key `image`.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 *   delete:
 *     tags: [Upload]
 *     summary: Delete image
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [public_id]
 *             properties:
 *               public_id: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       500: { description: Server error }
 */

router.post('/', authMiddleware, adminMiddleware, upload.single('image'), uploadImage);
router.delete('/', authMiddleware, adminMiddleware, deleteImage);

module.exports = router;
