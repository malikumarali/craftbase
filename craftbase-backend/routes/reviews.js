const router  = require('express').Router();
const Review  = require('../models/Review');
const Company = require('../models/Company');
const { protect, requireRole } = require('../middleware/auth');

// Helper: recalculate avgRating + badges for a company
async function refreshCompanyStats(companyId) {
  const reviews = await Review.find({ company: companyId });
  if (!reviews.length) return;

  const avg = (field) => reviews.reduce((s, r) => s + r[field], 0) / reviews.length;
  const avgRating = parseFloat(((avg('ratingQuality') + avg('ratingTimeliness') + avg('ratingComm') + avg('ratingValue')) / 4).toFixed(2));

  const badges = [];
  if (avgRating >= 4.5) badges.push('top_rated');
  if (reviews.length >= 10) badges.push('most_reviewed');
  badges.push('verified'); // stays always once set by admin

  await Company.findByIdAndUpdate(companyId, { avgRating, totalReviews: reviews.length, badges });
}

// GET /api/reviews?company=<id>
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.company) filter.company = req.query.company;
    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews  — USER only
router.post('/', protect, requireRole('USER', 'ADMIN'), async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, user: req.user._id });
    await refreshCompanyStats(review.company);
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You already reviewed this company' });
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id  — owner or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const companyId = review.company;
    await review.deleteOne();
    await refreshCompanyStats(companyId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
