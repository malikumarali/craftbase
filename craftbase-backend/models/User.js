const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['USER', 'COMPANY', 'ADMIN'], default: 'USER' },
}, { timestamps: true });

// Hash password before save (only if not already hashed)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (this.password.startsWith('$2')) return; // Already hashed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
