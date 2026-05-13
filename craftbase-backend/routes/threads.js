const router = require('express').Router();
const Thread = require('../models/Thread');
const { protect } = require('../middleware/auth');

// GET /api/threads  — list with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category, sort } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;

    const sortMap = { newest: { createdAt: -1 }, top: { upvotes: -1 }, replies: { 'replies.length': -1 } };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const threads = await Thread.find(filter)
      .populate('user', 'name role')
      .sort(sortBy);
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/threads/:id
router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('user', 'name role')
      .populate('replies.user', 'name role');
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/threads  — logged-in users
router.post('/', protect, async (req, res) => {
  try {
    const thread = await Thread.create({ ...req.body, user: req.user._id });
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/threads/:id/reply
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    thread.replies.push({ user: req.user._id, body: req.body.body });
    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/threads/:id/upvote
router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const thread = await Thread.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } }, { new: true });
    res.json({ upvotes: thread.upvotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/threads/:id  — owner or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Not found' });
    if (thread.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await thread.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
