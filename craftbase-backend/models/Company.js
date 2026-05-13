const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:           { type: String, required: true, trim: true },
  area:           { type: String, required: true },   // e.g. Rawalpindi, Islamabad
  specialization: [{ type: String }],                  // full_construction, renovation, roofing, etc.
  description:    { type: String },
  phone:          { type: String },
  logo:           { type: String },                    // SVG string or URL
  verified:       { type: Boolean, default: false },
  badges:         [{ type: String }],                  // top_rated, most_hired, verified
  avgRating:      { type: Number, default: 0 },
  totalReviews:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
