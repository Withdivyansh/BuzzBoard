const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);
commentSchema.index({ event: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);

