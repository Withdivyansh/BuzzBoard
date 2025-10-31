const RSVP = require('../models/RSVP');

async function createOrUpdateRSVP(req, res) {
  try {
    const { eventId, status } = req.body; // status: 'going' | 'cancelled'
    const rsvp = await RSVP.findOneAndUpdate(
      { user: req.userId, event: eventId },
      { $set: { status: status || 'going' } },
      { upsert: true, new: true }
    );
    res.status(201).json(rsvp);
  } catch (err) {
    res.status(400).json({ message: 'Could not RSVP' });
  }
}

async function listMyRSVPs(req, res) {
  const items = await RSVP.find({ user: req.userId }).populate('event');
  res.json(items);
}

async function cancelRSVP(req, res) {
  const { eventId } = req.params;
  await RSVP.findOneAndUpdate({ user: req.userId, event: eventId }, { $set: { status: 'cancelled' } });
  res.json({ ok: true });
}

module.exports = { createOrUpdateRSVP, listMyRSVPs, cancelRSVP };


