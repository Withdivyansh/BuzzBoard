const Event = require('../models/Event');
const Club = require('../models/Club');

async function listEvents(req, res) {
  const { lat, lng, radiusKm, city, state } = req.query;
  const now = new Date();
  const query = { startAt: { $gte: now } };

  if (lat && lng && radiusKm) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radiusKm) * 1000,
      },
    };
  }

  // Add city and state filters if provided
  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' }; // Case-insensitive search
  }
  if (state) {
    query['location.state'] = { $regex: state, $options: 'i' }; // Case-insensitive search
  }

  const events = await Event.find(query)
    .sort({ startAt: 1 })
    .limit(100)
    .populate('club', 'name logoUrl');
  res.json(events);
}

async function createEvent(req, res) {
  try {
  const { clubId, title, description, startAt, endAt, location, capacity, volunteersNeeded, imageUrl } = req.body;
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
  // Only the owner of the club can create events for that club
  if (String(club.owner) !== String(req.userId)) {
    return res.status(403).json({ message: 'Only the club owner can create events for this club' });
  }

    // Validate that new location fields are present
    if (!location || !location.address || !location.city || !location.state || !location.coordinates) {
      return res.status(400).json({ message: 'Location requires address, city, state, and coordinates.' });
    }

    const event = await Event.create({
      club: clubId,
      title,
      description,
      startAt,
      endAt,
      location,
      capacity,
      volunteersNeeded,
    imageUrl,
      createdBy: req.userId,
    });
    res.status(201).json(event);
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);
    res.status(400).json({ message: 'Could not create event' });
  }
}

async function updateEvent(req, res) {
  const { id } = req.params;
  const existing = await Event.findById(id).populate('club');
  if (!existing) return res.status(404).json({ message: 'Event not found' });
  if (
    String(existing.createdBy) !== String(req.userId) &&
    String(existing.club.owner) !== String(req.userId)
  )
    return res.status(403).json({ message: 'Forbidden' });

  const updated = await Event.findByIdAndUpdate(id, { $set: req.body }, { new: true });
  res.json(updated);
}

async function deleteEvent(req, res) {
  const { id } = req.params;
  const existing = await Event.findById(id).populate('club');
  if (!existing) return res.status(404).json({ message: 'Event not found' });
  if (
    String(existing.createdBy) !== String(req.userId) &&
    String(existing.club.owner) !== String(req.userId)
  )
    return res.status(403).json({ message: 'Forbidden' });

  await Event.findByIdAndDelete(id);
  res.json({ ok: true });
}

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };


