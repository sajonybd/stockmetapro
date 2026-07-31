import mongoose from 'mongoose';

const SoftwareErrorSchema = new mongoose.Schema({
  license_key: { type: String, required: true },
  pc_build_number: { type: String, required: true },
  error_type: { type: String, required: true },
  file_name: { type: String },
  message: { type: String },
  app_version: { type: String },
  occurred_at: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SoftwareError || mongoose.model('SoftwareError', SoftwareErrorSchema);
