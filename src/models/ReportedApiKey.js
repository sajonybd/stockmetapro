import mongoose from 'mongoose';

const ReportedApiKeySchema = new mongoose.Schema({
  license_key: { type: String, required: true },
  pc_build_number: { type: String, required: true },
  api_key: { type: String, required: true },
  status: { type: String, default: 'Active' },
  reported_at: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ReportedApiKey || mongoose.model('ReportedApiKey', ReportedApiKeySchema);
