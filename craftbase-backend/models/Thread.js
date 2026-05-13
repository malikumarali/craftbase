const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body:      { type: String, required: true },
  upvotes:   { type: Number, default: 0 },
}, { timestamps: true });

const threadSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  body:     { type: String, required: true },
  category: { type: String, enum: ['general', 'legal', 'roofing', 'budget', 'other'], default: 'general' },
  upvotes:  { type: Number, default: 0 },
  replies:  [replySchema],
}, { timestamps: true });

module.exports = mongoose.model('Thread', threadSchema);
