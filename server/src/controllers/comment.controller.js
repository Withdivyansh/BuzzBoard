const Comment = require('../models/Comment');
const User = require('../models/User');

async function createComment(req, res) {
  try {
    const { eventId, content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Empty comment' });
    const comment = await Comment.create({ event: eventId, user: req.userId, content });
    await comment.populate('user', 'name');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
}
async function getComments(req, res) {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { event: eventId } : {};
    const comments = await Comment.find(filter).populate('user', 'name').sort({ createdAt: 1 });
    res.json(comments);
  } catch {
    res.status(500).json({ message: 'Failed to load comments' });
  }
}
async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Not found' });
    if (String(comment.user) !== req.userId && req.userRole !== 'admin')
      return res.status(403).json({ message: 'No permission' });
    await comment.deleteOne();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Failed to delete comment' });
  }
}

module.exports = { createComment, getComments, deleteComment };

