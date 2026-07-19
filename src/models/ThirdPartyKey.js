import mongoose from 'mongoose';

const ThirdPartyKeySchema = new mongoose.Schema({
  service_name: { type: String, required: true }, // e.g., "OpenAI", "ElevenLabs"
  api_key: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ThirdPartyKey || mongoose.model('ThirdPartyKey', ThirdPartyKeySchema);
