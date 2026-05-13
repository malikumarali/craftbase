const router  = require('express').Router();
const Quote   = require('../models/Quote');
const Company = require('../models/Company');
const { protect, requireRole } = require('../middleware/auth');

// GET /api/quotes  — public list
router.get('/', async (req, res) => {
  try {
    const { status, projectType, location } = req.query;
    const filter = {};
    if (status)      filter.status = status;
    if (projectType) filter.projectType = projectType;
    if (location)    filter.location = location;
    const quotes = await Quote.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/quotes/:id
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('user', 'name')
      .populate('responses.company', 'name area logo avgRating');
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/quotes  — USER only
router.post('/', protect, requireRole('USER', 'ADMIN'), async (req, res) => {
  try {
    const quote = await Quote.create({ ...req.body, user: req.user._id });
    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/quotes/:id/respond  — COMPANY only
router.post('/:id/respond', protect, requireRole('COMPANY', 'ADMIN'), async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    if (quote.status !== 'OPEN') return res.status(400).json({ message: 'Quote is not open' });

    const company = await Company.findOne({ user: req.user._id });
    if (!company) return res.status(400).json({ message: 'No company profile found' });

    // Prevent duplicate responses
    const alreadyResponded = quote.responses.some(r => r.company.toString() === company._id.toString());
    if (alreadyResponded) return res.status(400).json({ message: 'Already responded to this quote' });

    quote.responses.push({ company: company._id, ...req.body });
    await quote.save();
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/quotes/:id/accept/:responseId  — quote owner only
router.post('/:id/accept/:responseId', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    if (quote.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const response = quote.responses.id(req.params.responseId);
    if (!response) return res.status(404).json({ message: 'Response not found' });

    // Mark accepted and close quote
    quote.responses.forEach(r => { r.accepted = false; });
    response.accepted = true;
    quote.status = 'HIRED';
    await quote.save();
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/quotes/:id  — owner or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Not found' });
    if (quote.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await quote.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
