const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role, profileStatus: user.profileStatus },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
}

async function register(req, res) {
  try {
    const { name, email, password, bio, avatarUrl, logoUrl, vendorDocuments } = req.body;
    let { location } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    // REMOVE invalid or partial location entirely:
    if (
      !location ||
      location.type !== 'Point' ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      typeof location.coordinates[0] !== 'number' ||
      typeof location.coordinates[1] !== 'number'
    ) {
      location = undefined;
    }

    let userObj = { name, email, password, bio };
    if (avatarUrl) userObj.avatarUrl = avatarUrl;
    if (logoUrl) userObj.logoUrl = logoUrl;
    if (Array.isArray(vendorDocuments) && vendorDocuments.length) userObj.vendorDocuments = vendorDocuments;
    if (location) userObj.location = location;

    const user = await User.create(userObj);
    const token = signToken(user);
    // Return the full user object so frontend knows onboarding status
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    // Return the full user object so frontend knows onboarding status
    const userProfile = await User.findById(user._id);
    res.json({ token, user: userProfile });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
}

async function me(req, res) {
  const user = await User.findById(req.userId);
  res.json(user);
}

async function updateProfile(req, res) {
  try {
    // Whitelist fields to prevent unwanted updates
    const {
      name, bio, location, phone, gender, college, course, year, interests, resumeUrl, address, profileStatus, role, avatarUrl, logoUrl, vendorDocuments
    } = req.body;
    
    const updateData = {
      name, bio, location, phone, gender, college, course, year, interests, resumeUrl, address, profileStatus, avatarUrl, logoUrl, vendorDocuments
    };
    // Only allow role update if onboarding (incomplete profile)
    if (typeof role !== 'undefined' && profileStatus === 'INCOMPLETE') {
      updateData.role = role;
    }

    // Remove undefined fields so they don't overwrite existing data
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: 'Update failed' });
  }
}

module.exports = { register, login, me, updateProfile };


