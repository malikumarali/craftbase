require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

// Environment variables with defaults
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/craftbase';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey123';
process.env.PORT = process.env.PORT || '5000';

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/quotes',    require('./routes/quotes'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/threads',   require('./routes/threads'));

// Health check
app.get('/', (req, res) => res.json({ message: 'CraftBase API running ✓' }));

// ── MongoDB + Start ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });
