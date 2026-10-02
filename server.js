require('dotenv').config();
require('dns').setServers(['8.8.8.8','1.1.1.1']);
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ['https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'blob:']
    }
  }
}));
app.use(express.json({ limit: '10kb' }));

const Message = mongoose.model('Message', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  type: { type: String, default: 'Other' },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  ip: String,
  createdAt: { type: Date, default: Date.now }
}));

const Project = mongoose.model('Project', new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Web' },
  year: String,
  tagline: String,
  overview: String,
  problem: String,
  solution: String,
  features: [String],
  stack: [String],
  challenges: String,
  result: String,
  github: String,
  demo: String,
  image: String,
  poster: String,
  video: String,
  gallery: [new mongoose.Schema({ src: String, caption: String }, { _id: false })],
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true }
}));

const dbReady = (req, res, next) =>
  mongoose.connection.readyState === 1 ? next() : res.status(503).json({ ok: false, error: 'Database unavailable' });

const contactLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TYPES = ['Website', 'Software', 'Application', 'Other'];
// Sends you a WhatsApp alert through CallMeBot. Best effort: the message is already saved in MongoDB.
async function notifyWhatsApp(text) {
  const { WHATSAPP_PHONE, CALLMEBOT_APIKEY } = process.env;
  if (!WHATSAPP_PHONE || !CALLMEBOT_APIKEY) return;
  try {
    const url = 'https://api.callmebot.com/whatsapp.php?' +
      new URLSearchParams({ phone: WHATSAPP_PHONE, text, apikey: CALLMEBOT_APIKEY });
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) console.error('WhatsApp alert failed:', r.status);
  } catch (err) {
    console.error('WhatsApp alert error:', err.message);
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));

app.get('/api/projects', dbReady, async (req, res) => {
  try {
    const items = await Project.find({ published: true }).sort({ order: 1, _id: 1 })
      .select('-_id title category year tagline overview problem solution features stack challenges result github demo image poster video gallery').lean();
    res.set('Cache-Control', 'public, max-age=60').json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

app.post('/api/contact', contactLimit, async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.status(201).json({ ok: true }); // honeypot: bots fill this hidden field
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim();
  const message = String(b.message || '').trim();
  const type = TYPES.includes(b.type) ? b.type : 'Other';
  if (!name || name.length > 100 || !EMAIL.test(email) || email.length > 200 || !message || message.length > 3000) {
    return res.status(400).json({ ok: false, error: 'Please fill in every field correctly.' });
  }
  let saved = false;
  if (mongoose.connection.readyState === 1) {
    try { await Message.create({ name, email, type, message, ip: req.ip }); saved = true; } catch (err) { console.error(err); }
  }
  notifyWhatsApp(`New ${type} enquiry\nName: ${name}\nEmail: ${email}\nMessage: ${message.slice(0, 600)}`);
  res.status(201).json({ ok: true, saved });
});

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI is not set. Copy .env.example to .env and add your connection string.');
} else {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection failed:', err.message));
}
