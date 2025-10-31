const Gallery = require('../models/Gallery');

async function addGallery(req, res) {
  try {
    const { eventId, images } = req.body; // images: [{url, caption}]
    const gallery = await Gallery.findOneAndUpdate(
      { event: eventId },
      { $push: { images: { $each: images || [] } }, $setOnInsert: { uploadedBy: req.userId, event: eventId } },
      { upsert: true, new: true }
    );
    res.status(201).json(gallery);
  } catch (err) {
    res.status(400).json({ message: 'Could not upload gallery' });
  }
}

async function getGallery(req, res) {
  const { eventId } = req.query;
  const q = eventId ? { event: eventId } : {};
  const items = await Gallery.find(q).sort({ createdAt: -1 });
  res.json(items);
}

module.exports = { addGallery, getGallery };


