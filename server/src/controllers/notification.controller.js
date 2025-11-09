const Notification = require('../models/Notification');

async function listMyNotifications(req, res) {
  const items = await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
  res.json(items);
}

async function markRead(req, res) {
  const { id } = req.params;
  const n = await Notification.findOne({ _id: id, user: req.userId });
  if (!n) return res.status(404).json({ message: 'Not found' });
  n.read = true;
  await n.save();
  res.json(n);
}

module.exports = { listMyNotifications, markRead };




