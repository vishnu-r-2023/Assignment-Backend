const express = require('express');
const Coupon = require('../models/Coupon');
const abusePrevention = require('../middleware/abusePrevention');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// User: Claim a coupon
router.post('/claim', abusePrevention, async (req, res) => {
  try {
    console.log('Claim request received from IP:', req.ip); // Debugging

    // Find the last distributed coupon
    const lastDistributed = await Coupon.findOne({ lastDistributed: true });
    console.log('Last distributed coupon:', lastDistributed); // Debugging
    let coupon;

    if (lastDistributed) {
      // Find the next unclaimed and active coupon
      coupon = await Coupon.findOne({
        isClaimed: false,
        isActive: true,
        _id: { $gt: lastDistributed._id }, // Get the next coupon in sequence
      });
      console.log('Next coupon after last distributed:', coupon); // Debugging
    }

    // If no coupon is found, start from the beginning
    if (!coupon) {
      coupon = await Coupon.findOne({ isClaimed: false, isActive: true });
      console.log('First available coupon:', coupon); // Debugging
    }

    if (!coupon) {
      console.log('No available coupons'); // Debugging
      return res.status(404).json({ message: 'No coupons available at the moment. Please try again later.' });
    }

    // Mark the coupon as claimed
    coupon.isClaimed = true;
    coupon.claimedBy = req.ip; // Store the IP address of the user
    coupon.claimedAt = new Date();
    await coupon.save();

    // Update the last distributed coupon
    if (lastDistributed) {
      lastDistributed.lastDistributed = false;
      await lastDistributed.save();
    }
    coupon.lastDistributed = true;
    await coupon.save();

    console.log('Coupon claimed successfully:', coupon.code); // Debugging
    res.cookie('sessionClaimed', true, { maxAge: 60000, httpOnly: true }); // Set cookie for session tracking
    res.json({ message: 'Coupon claimed successfully', coupon: coupon.code });
  } catch (error) {
    console.error('Error in /claim endpoint:', error.message); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: View all coupons
router.get('/', adminAuth, async (req, res) => {
  try {
    console.log('Fetching all coupons'); // Debugging
    const coupons = await Coupon.find(); // Fetch all coupons
    console.log('Coupons fetched:', coupons); // Debugging
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error.message); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Add a new coupon
router.post('/', adminAuth, async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Add coupon request received:', { code }); // Debugging

    if (!code || code.trim() === '') {
      console.log('Coupon code is empty'); // Debugging
      return res.status(400).json({ message: 'Coupon code cannot be empty' });
    }

    const newCoupon = new Coupon({ code, isActive: true, isClaimed: false });
    await newCoupon.save(); // Save the new coupon to the database
    console.log('Coupon added successfully:', newCoupon); // Debugging
    res.json({ message: 'Coupon added successfully', coupon: newCoupon });
  } catch (error) {
    console.error('Error adding coupon:', error.message); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Toggle coupon availability
router.patch('/:id/toggle', adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ message: 'Coupon availability updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update a coupon's code
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Update request received for coupon ID:', req.params.id); // Debugging
    console.log('New coupon code:', code); // Debugging

    if (!code || code.trim() === '') {
      console.log('Coupon code is empty'); // Debugging
      return res.status(400).json({ message: 'Coupon code cannot be empty' });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      console.log('Coupon not found'); // Debugging
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.code = code; // Update the coupon code
    await coupon.save();
    console.log('Coupon updated successfully:', coupon); // Debugging
    res.json({ message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('Error updating coupon:', error.message); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
});

// Debugging: View all coupons
router.get('/debug', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Fetch user claim history
router.get('/history', adminAuth, async (req, res) => {
  try {
    console.log('Fetching user claim history'); // Debugging
    const history = await Coupon.find({ isClaimed: true }).select('code claimedBy claimedAt');
    if (!history.length) {
      console.log('No claimed coupons found'); // Debugging
    } else {
      console.log('Claim history fetched:', history); // Debugging
    }
    res.json(history);
  } catch (error) {
    console.error('Error fetching claim history:', error.message); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete a coupon
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    console.log('Delete request received for coupon ID:', req.params.id); // Debugging
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      console.log('Coupon not found'); // Debugging
      return res.status(404).json({ message: 'Coupon not found' });
    }
    console.log('Coupon deleted successfully:', coupon.code); // Debugging
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error.message); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
