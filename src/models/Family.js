import mongoose from 'mongoose';

const FamilySchema = new mongoose.Schema({
  familyId: {
    type: String, // Change from Number to String
    required: true,
    unique: true, // Ensure familyId is unique
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
