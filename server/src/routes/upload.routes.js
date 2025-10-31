const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { authRequired } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Accepts base64 data URL in JSON: { dataUrl: 'data:image/png;base64,...' }
router.post('/image', authRequired, async (req, res) => {
  try {
    const { dataUrl } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ message: 'Provide dataUrl as data:image/...;base64,<data>' });
    }
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) return res.status(400).json({ message: 'Invalid dataUrl' });
    const mime = match[1] || 'application/octet-stream';
    const buf = Buffer.from(match[2], 'base64');
    const ext = mime.includes('png') ? '.png' : mime.includes('jpeg') ? '.jpg' : mime.includes('jpg') ? '.jpg' : mime.includes('gif') ? '.gif' : '.bin';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const abs = path.join(uploadDir, filename);
    await fs.promises.writeFile(abs, buf);
    const rel = `/uploads/${filename}`;
    res.json({ url: rel });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('UPLOAD ERROR:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;


