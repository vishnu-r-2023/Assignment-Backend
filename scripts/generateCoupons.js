const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('../models/Coupon');

dotenv.config();

const generateCoupons = async (count) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Generate and insert coupons
    const coupons = [];
    for (let i = 0; i < count; i++) {
      const code = `COUPON-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      coupons.push({ code, isActive: true, isClaimed: false });
    }

    await Coupon.insertMany(coupons);
    console.log(`${count} coupons generated successfully`);

    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error generating coupons:', error.message);
    process.exit(1);
  }
};

// Generate 50 coupons
generateCoupons(50);
