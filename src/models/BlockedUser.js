import mongoose from 'mongoose';

const BlockedUserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  mobile: { type: String, default: '' },
  reason: { type: String, default: 'Account Blocked by Admin' },
  blockedAt: { type: Date, default: Date.now },
});

export default mongoose.models.BlockedUser || mongoose.model('BlockedUser', BlockedUserSchema);
