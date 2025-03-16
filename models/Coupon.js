const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isClaimed: { type: Boolean, default: false },
  claimedBy: { type: String, default: null }, // IP or session ID
  claimedAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  lastDistributed: { type: Boolean, default: false }, // Field to track the last distributed coupon
});

module.exports = mongoose.model('Coupon', couponSchema);
