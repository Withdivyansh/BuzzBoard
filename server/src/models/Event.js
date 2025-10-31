const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    startAt: { type: Date, required: true },
    endAt: { type: Date },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
    },
    capacity: { type: Number },
    volunteersNeeded: { type: Number, default: 0 },
    imageUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ location: '2dsphere' });
eventSchema.index({ startAt: 1 });

module.exports = mongoose.model('Event', eventSchema);


