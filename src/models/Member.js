import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Family from '../models/Family';
const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'], // Optional: restrict gender to specific values
  },
  deleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Password hashing middleware
MemberSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
MemberSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


export default mongoose.models.Member || mongoose.model('Member', MemberSchema);
