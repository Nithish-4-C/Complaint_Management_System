const mongoose = require('mongoose');

// Complaint Schema - tracks issues submitted by users
const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Hostel', 'Lab', 'Classroom', 'Others'],
    required: true,
  },
  // Priority level for the complaint
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt automatically

module.exports = mongoose.model('Complaint', complaintSchema);
