const mongoose = require('mongoose');

// User Schema - stores student/admin profiles
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // Unique Register Number for each student
  registerNumber: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Academic department
  department: {
    type: String,
    required: true,
  },
  // Technical domain (e.g., Web Development, AI, etc.)
  domain: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
