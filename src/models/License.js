import mongoose from 'mongoose';
import './User.js';
import './Package.js';

const LicenseSchema = new mongoose.Schema({
  api_key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  licenseKey: {
    type: String,
    index: true,
  },
  credit_limit: {
    type: Number,
    required: true,
  },
  credits_used: {
    type: Number,
    default: 0,
  },
  currentCredits: {
    type: Number,
    default: 0,
  },
  duration_days: {
    type: Number,
    required: true,
  },
  activation_date: {
    type: Date,
    default: null,
  },
  expire_date: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  lastRenewedAt: {
    type: Date,
    default: Date.now,
  },
  pc_build_number: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Revoked', 'Disabled', 'active', 'expired', 'suspended'],
    default: 'Active',
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to ensure backward compatibility field sync
LicenseSchema.pre('save', function () {
  if (!this.licenseKey) {
    this.licenseKey = this.api_key;
  }
  if (!this.expiresAt && this.expire_date) {
    this.expiresAt = this.expire_date;
  }
  if (this.currentCredits === undefined || this.currentCredits === null) {
    this.currentCredits = Math.max(0, (this.credit_limit || 0) - (this.credits_used || 0));
  }
});

export default mongoose.models.License || mongoose.model('License', LicenseSchema);
