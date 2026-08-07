import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  licenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'License',
    required: false,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: false,
    default: null,
  },
  type: {
    type: String,
    enum: ['NEW_PURCHASE', 'RENEWAL', 'TOPUP', 'MANUAL_OVERRIDE'],
    required: true,
    default: 'NEW_PURCHASE',
  },
  amountPaid: {
    type: Number,
    required: true,
    default: 0,
  },
  creditsAdded: {
    type: Number,
    required: true,
    default: 0,
  },
  creditsRolledOver: {
    type: Number,
    required: true,
    default: 0,
  },
  totalCreditsAfter: {
    type: Number,
    required: false,
    default: 0,
  },
  previousExpiry: {
    type: Date,
    default: null,
  },
  newExpiry: {
    type: Date,
    required: false,
    default: null,
  },
  paymentProvider: {
    type: String,
    default: 'bkash',
  },
  trxId: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['Unused', 'Matched', 'AmountMismatch'],
    default: 'Unused',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

delete mongoose.models.Transaction;
export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
