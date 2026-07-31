import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  licenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'License', default: null }, // Null if new license
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  payment_method: { type: String, enum: ['bKash', 'Rocket', 'Nagad'], required: true },
  trx_id: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
