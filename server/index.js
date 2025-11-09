



  // ...existing code...
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { connectToDatabase } = require('./src/config/db');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const clubRoutes = require('./src/routes/club.routes');
const eventRoutes = require('./src/routes/event.routes');
const rsvpRoutes = require('./src/routes/rsvp.routes');
const volunteerRoutes = require('./src/routes/volunteer.routes');
const galleryRoutes = require('./src/routes/gallery.routes');
const commentRoutes = require('./src/routes/comment.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const path = require('path');

const app = express();

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser or same-origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'buzzboard-api' });
});

// Friendly root endpoint so hitting / doesn't show 404 in logs
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'buzzboard-api',
    endpoints: ['/health', '/auth', '/clubs', '/events', '/rsvp', '/volunteers', '/gallery', '/comments', '/notifications']
  });
});

// Register routes
app.use('/auth', authRoutes);
app.use('/clubs', clubRoutes);
app.use('/events', eventRoutes);
app.use('/rsvp', rsvpRoutes);
// Support both singular and plural for compatibility with client
app.use('/volunteer', volunteerRoutes);
app.use('/volunteers', volunteerRoutes);
app.use('/gallery', galleryRoutes);
app.use('/comments', commentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/upload', uploadRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err && (err.stack || err));
  const payload = { error: err && err.message ? err.message : 'Internal Server Error' };
  if (process.env.NODE_ENV === 'development') payload.stack = err && err.stack;
  res.status(err && err.status ? err.status : 500).json(payload);
});

const PORT = process.env.PORT || 5000;
if (!process.env.MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.error('MONGODB_URI is missing in .env — set it and restart the server.');
  process.exit(1);
}

// Process-level handlers
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', reason);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server after DB connects
connectToDatabase()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to database', err);
    process.exit(1);
  });

module.exports = app;
// ...existing code...

