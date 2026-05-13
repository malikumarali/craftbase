const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  company:          { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quote:            { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' }, // optional link
  ratingQuality:    { type: Number, min: 1, max: 5, required: true },
  ratingTimeliness: { type: Number, min: 1, max: 5, required: true },
  ratingComm:       { type: Number, min: 1, max: 5, required: true },
  ratingValue:      { type: Number, min: 1, max: 5, required: true },
  comment:          { type: String },
  verifiedHire:     { type: Boolean, default: false },
}, { timestamps: true });

// One review per user per company
reviewSchema.index({ company: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
