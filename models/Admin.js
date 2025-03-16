const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    console.log('Hashing password for:', this.username); // Debugging
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    console.error('Error hashing password:', error.message); // Debugging
    next(error);
  }
});

module.exports = mongoose.model('Admin', adminSchema);
