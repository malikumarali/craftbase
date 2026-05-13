const router  = require('express').Router();
const Company = require('../models/Company');
const Review  = require('../models/Review');
const { protect, requireRole } = require('../middleware/auth');

// GET /api/companies  — list with filters
router.get('/', async (req, res) => {
  try {
    const { area, specialization, badge, minRating, sort } = req.query;
    const filter = {};
    if (area)           filter.area = area;
    if (specialization) filter.specialization = { $in: specialization.split(',') };
    if (badge)          filter.badges = { $in: badge.split(',') };
    if (minRating)      filter.avgRating = { $gte: parseFloat(minRating) };

    const sortMap = { rating: { avgRating: -1 }, reviews: { totalReviews: -1 }, name: { name: 1 } };
    const sortBy = sortMap[sort] || { avgRating: -1 };

    const companies = await Company.find(filter).sort(sortBy);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/companies/:id
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('user', 'name email');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/companies  — COMPANY role only, one profile per user
router.post('/', protect, requireRole('COMPANY', 'ADMIN'), async (req, res) => {
  try {
    const exists = await Company.findOne({ user: req.user._id });
    if (exists) return res.status(400).json({ message: 'Company profile already exists' });
    const company = await Company.create({ ...req.body, user: req.user._id });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/companies/:id  — owner or admin
router.put('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Not found' });
    if (company.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/companies/:id  — owner or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Not found' });
    if (company.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await company.deleteOne();
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/companies/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ company: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
