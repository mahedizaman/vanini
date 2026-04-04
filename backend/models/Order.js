const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        image: String,
        quantity: Number,
        price: Number,
        size: String,
        color: String,
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      district: String,
      postalCode: String,
    },
    paymentMethod: { type: String, enum: ['SSLCommerz', 'COD', 'DirectPay'] },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    totalPrice: Number,
    shippingCharge: { type: Number, default: 0 },
    couponCode: String,
    discountAmount: { type: Number, default: 0 },
    finalPrice: Number,
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
    transactionId: String,
    paidAt: Date,
    deliveredAt: Date,
    invoiceNumber: { type: String, trim: true, sparse: true },
    invoiceGeneratedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
