import mongoose from 'mongoose';

const LicenseSchema = new mongoose.Schema({
  api_key: {
    type: String,
    required: true,
    unique: true,
  },
  credit_limit: {
    type: Number,
    required: true,
  },
  credits_used: {
    type: Number,
    default: 0,
  },
  expire_date: {
    type: Date,
    required: true,
  },
  pc_build_number: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Revoked'],
    default: 'Active',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null for admin-generated keys without a user
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.License || mongoose.model('License', LicenseSchema);
