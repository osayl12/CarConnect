const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false — excluded from every query by default (including
    // populate('customer', 'name email ...') elsewhere in the app), not
    // just from the JSON response. Login explicitly opts back in with
    // .select('+password') where the hash is actually needed.
    password: { type: String, required: true, minlength: 6, select: false },
    // Section 2.1: user type selection + role-based access control.
    role: { type: String, enum: ['customer', 'mechanic'], required: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Belt-and-suspenders: strip the hash on both serialization paths, in case
// some query ever opts back in with .select('+password'). toJSON() covers
// res.json(user); toObject() covers helpers elsewhere that call
// doc.toObject() directly (e.g. fault.controller's presentReport).
const stripPassword = (_doc, ret) => {
  delete ret.password;
  return ret;
};
userSchema.set('toJSON', { transform: stripPassword });
userSchema.set('toObject', { transform: stripPassword });

module.exports = mongoose.model('User', userSchema);
