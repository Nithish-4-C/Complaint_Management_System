const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
// Register a new user with full profile details
router.post('/register', async (req, res) => {
  const { name, registerNumber, phone, email, department, domain, password, role } = req.body;

  // Validate all required fields
  if (!name || !registerNumber || !phone || !email || !department || !domain || !password) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    // Check if email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Check if register number is unique
    let existingRegNum = await User.findOne({ registerNumber });
    if (existingRegNum) {
      return res.status(400).json({ message: 'This Register Number is already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with all fields
    user = new User({
      name,
      registerNumber,
      phone,
      email,
      department,
      domain,
      password: hashedPassword,
      role: role || 'user',
    });

    await user.save();

    // Create JWT
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        registerNumber: user.registerNumber,
        phone: user.phone,
        email: user.email,
        department: user.department,
        domain: user.domain,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Register Number or Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
// Login user/admin
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        registerNumber: user.registerNumber,
        phone: user.phone,
        email: user.email,
        department: user.department,
        domain: user.domain,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/profile
// Get current user's full profile (protected)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
