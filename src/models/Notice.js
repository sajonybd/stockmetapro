import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
  message: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
