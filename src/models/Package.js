import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credit_limit: { type: Number, required: true },
  price_tk: { type: Number, required: true },
  duration_days: { type: Number, default: 30 },
  is_popular: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
