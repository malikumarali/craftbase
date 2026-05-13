const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  company:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  message:   { type: String, required: true },
  bidAmount: { type: Number },
  accepted:  { type: Boolean, default: false },
}, { timestamps: true });

const quoteSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  projectType: { type: String, enum: ['residential', 'commercial', 'industrial', 'other'], default: 'residential' },
  budgetMin:   { type: Number },
  budgetMax:   { type: Number },
  location:    { type: String, required: true },
  timeline:    { type: String },
  status:      { type: String, enum: ['OPEN', 'HIRED', 'CLOSED'], default: 'OPEN' },
  responses:   [responseSchema],
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);
