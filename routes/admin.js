const express = require('express');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Admin Registration
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Registration request received:', { username }); // Debugging

    // Check if the username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log('Username already exists'); // Debugging
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new admin
    const newAdmin = new Admin({ username, password });
    console.log('Saving new admin:', newAdmin); // Debugging
    await newAdmin.save();
    console.log('Admin registered successfully:', newAdmin); // Debugging
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error in /register endpoint:', error.message); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login request received:', { username }); // Debugging

    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('Admin not found'); // Debugging
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Invalid credentials'); // Debugging
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful, token generated'); // Debugging
    res.json({ token });
  } catch (error) {
    console.error('Error in /login endpoint:', error.message); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
