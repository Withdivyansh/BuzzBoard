const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    bio: { type: String },
  avatarUrl: { type: String },
  logoUrl: { type: String },
  vendorDocuments: [{ type: String }],
    
    // Detailed profile fields
    phone: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    college: { type: String },
    course: { type: String },
    year: { type: String },
    interests: [{ type: String }],
    resumeUrl: { type: String },
    address: { type: String }, // For simplicity, can be expanded later

    // Onboarding and role status
    profileStatus: { type: String, enum: ['INCOMPLETE', 'COMPLETE'], default: 'INCOMPLETE' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number],
        required: false
      }
    },
    joinedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' }, { sparse: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);


