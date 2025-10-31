const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');

async function applyVolunteer(req, res) {
  try {
    const { eventId, role } = req.body;
    const item = await Volunteer.findOneAndUpdate(
      { user: req.userId, event: eventId },
      { $set: { role, status: 'pending' } },
      { upsert: true, new: true }
    );
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Could not apply to volunteer' });
  }
}

async function listVolunteers(req, res) {
  const { eventId } = req.query;
  const q = eventId ? { event: eventId } : {};
  const items = await Volunteer.find(q).populate('user', 'name email');
  res.json(items);
}

async function updateVolunteerStatus(req, res) {
  const { id } = req.params; // volunteer id
  const { status } = req.body; // 'approved' | 'rejected' | 'pending'
  const item = await Volunteer.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  res.json(item);
}

module.exports = { applyVolunteer, listVolunteers, updateVolunteerStatus };


