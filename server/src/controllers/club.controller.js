const Club = require('../models/Club');
const User = require('../models/User');
const Notification = require('../models/Notification');

const jwt = require('jsonwebtoken');

async function listClubs(req, res) {
  const { q, city, owner, joined } = req.query;
  const find = {};

  // Text search across multiple fields
  if (q && String(q).trim()) {
    const rx = new RegExp(String(q).trim(), 'i');
    find.$or = [{ name: rx }, { description: rx }, { collegeName: rx }, { address: rx }];
  }

  // City filter (address contains city keyword)
  if (city && String(city).trim()) {
    find.address = { $regex: new RegExp(String(city).trim(), 'i') };
  }

  // Try to read userId from bearer token if present to support owner/me and joined=me without requiring auth middleware
  let userId;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      userId = payload.userId;
    } catch {}
  }

  // Owner filter
  if (owner === 'me' && userId) {
    find.owner = userId;
  } else if (owner) {
    find.owner = owner;
  }

  // Joined filter
  if (joined === 'me' && userId) {
    find.members = userId;
  }

  // Return raw owner id (not populated) so frontend equality checks work
  const clubs = await Club.find(find)
    .populate('members', '_id')
    .populate('joinRequests.user', '_id');
  res.json(clubs);
}

async function createClub(req, res) {
  try {
    const { name, description, collegeName, address, logoUrl } = req.body;

    // Create the club
    const club = await Club.create({
      name,
      description,
      collegeName,
      address,
      owner: req.userId,
      members: [req.userId],
      logoUrl
    });

    // Update user's role to admin and mark their profile as complete
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { joinedClubs: club._id },
      $set: { role: 'admin', profileStatus: 'COMPLETE' }
    });

    res.status(201).json(club);
  } catch (err) {
    console.error("CREATE CLUB ERROR:", err);
    res.status(400).json({ message: 'Could not create club' });
  }
}

async function joinClub(req, res) {
  const { id } = req.params;
  const club = await Club.findById(id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  // Prevent duplicate requests
  if (club.joinRequests.some(r => r.user.toString() === req.userId && r.status === 'pending')) {
    return res.status(400).json({ message: 'Request already pending' });
  }
  // Prevent joining multiple times
  if (club.members.includes(req.userId)) {
    return res.status(400).json({ message: 'Already a member' });
  }
  club.joinRequests.push({ user: req.userId });
  await club.save();
  // Notify the club owner about the join request
  try {
    await Notification.create({
      user: club.owner,
      type: 'join_request',
      message: 'New join request received',
      meta: { clubId: club._id, requesterId: req.userId }
    });
  } catch {}
  res.json({ message: 'Join request sent' });
}

async function approveJoinRequest(req, res) {
  const { id, reqId } = req.params;
  const club = await Club.findById(id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  // Only club owner (admin) can approve
  if (club.owner.toString() !== req.userId) return res.status(403).json({ message: 'Only the club admin can approve joins' });
  const request = club.joinRequests.id(reqId);
  if (!request || request.status !== 'pending') {
    return res.status(404).json({ message: 'Join request not found' });
  }
  request.status = 'approved';
  club.members.push(request.user);
  await club.save();
  await User.findByIdAndUpdate(request.user, { $addToSet: { joinedClubs: club._id } });
  // Notify the user that they were approved
  try {
    await Notification.create({
      user: request.user,
      type: 'join_approved',
      message: `Your request to join ${club.name} was approved`,
      meta: { clubId: club._id }
    });
  } catch {}
  res.json({ message: 'User approved and added to club' });
}

async function listMembers(req, res) {
  const { id } = req.params;
  const club = await Club.findById(id).populate('members', 'name email college year gender phone');
  if (!club) return res.status(404).json({ message: 'Club not found' });
  // Only club owner/admin can view full details
  if (club.owner.toString() !== req.userId) return res.status(403).json({ message: 'Only admin can view members' });
  res.json(club.members);
}

async function listJoinRequests(req, res) {
  const { id } = req.params;
  const club = await Club.findById(id).populate('joinRequests.user', 'name email college');
  if (!club) return res.status(404).json({ message: 'Club not found' });
  // Only club owner can view
  if (club.owner.toString() !== req.userId) return res.status(403).json({ message: 'Only admin can view requests' });
  res.json(club.joinRequests);
}

// Extra: user can query their join requests status across clubs
async function myJoinRequests(req, res) {
  const clubs = await Club.find({ 'joinRequests.user': req.userId }, { name: 1, joinRequests: 1 });
  const out = [];
  clubs.forEach(c => {
    c.joinRequests.forEach(r => {
      if (String(r.user) === String(req.userId)) out.push({ clubId: c._id, clubName: c.name, status: r.status, requestedAt: r.requestedAt, requestId: r._id });
    });
  });
  res.json(out);
}

module.exports = { listClubs, createClub, joinClub, approveJoinRequest, listMembers, listJoinRequests, myJoinRequests };


