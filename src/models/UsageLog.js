import mongoose from 'mongoose';

const UsageLogSchema = new mongoose.Schema({
  licenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'License', required: true },
  credits_deducted: { type: Number, required: true },
  action_description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.UsageLog || mongoose.model('UsageLog', UsageLogSchema);
