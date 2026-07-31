import mongoose from 'mongoose';

const ApiLogSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  request_payload: { type: Object, default: {} },
  response_payload: { type: Object, default: {} },
  status_code: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create index for efficient pagination sorting
ApiLogSchema.index({ createdAt: -1 });

export default mongoose.models.ApiLog || mongoose.model('ApiLog', ApiLogSchema);
