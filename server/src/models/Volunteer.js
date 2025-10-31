const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    role: { type: String },
  },
  { timestamps: true }
);

volunteerSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);


