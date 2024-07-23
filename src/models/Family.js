import mongoose from 'mongoose';

const FamilySchema = new mongoose.Schema({
  familyId: {
    type: Number,
    required: true,
    unique: true,
    min: 1000,
    max: 9999,
  },
  familyName: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }],
  primaryMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Family || mongoose.model('Family', FamilySchema);
