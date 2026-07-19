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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.License || mongoose.model('License', LicenseSchema);
