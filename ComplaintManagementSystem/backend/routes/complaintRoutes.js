const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/complaints
// Create a new complaint (User only)
router.post('/', protect, async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const complaint = new Complaint({
      title,
      description,
      category,
      priority: priority || 'Medium',
      user: req.user.id,
    });

    const createdComplaint = await complaint.save();
    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: createdComplaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/complaints
// Supports query params: ?search=keyword&status=Pending&category=Hostel&sort=oldest
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, category, priority, sort } = req.query;
    let query = {};

    // Role-based base filter
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    // Optional status filter
    if (status) {
      query.status = status;
    }

    // Optional category filter
    if (category) {
      query.category = category;
    }

    // Optional priority filter
    if (priority) {
      query.priority = priority;
    }

    // Optional search by title (case-insensitive partial match)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Sort order: default newest first
    let sortOrder = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOrder = { createdAt: 1 };
    } else if (sort === 'priority') {
      // Custom priority sort: High > Medium > Low
      sortOrder = { priority: -1, createdAt: -1 };
    }

    let complaints;
    if (req.user.role === 'admin') {
      complaints = await Complaint.find(query).sort(sortOrder).populate('user', 'name email');
    } else {
      complaints = await Complaint.find(query).sort(sortOrder);
    }
    
    res.json(complaints);
  } catch (error) {
    console.error('Fetch complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/complaints/stats
// Get complaint statistics (for dashboard summary cards)
router.get('/stats', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const total = await Complaint.countDocuments(query);
    const pending = await Complaint.countDocuments({ ...query, status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ ...query, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ ...query, status: 'Resolved' });

    res.json({ total, pending, inProgress, resolved });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/complaints/:id
// Update complaint status (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();

    res.json({
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/complaints/:id
// Delete a complaint (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await complaint.deleteOne();
    res.json({ message: 'Complaint removed successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
