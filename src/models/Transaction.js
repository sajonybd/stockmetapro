import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  licenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'License',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true,
  },
  type: {
    type: String,
    enum: ['NEW_PURCHASE', 'RENEWAL', 'TOPUP', 'MANUAL_OVERRIDE'],
    required: true,
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
    required: true,
  },
  previousExpiry: {
    type: Date,
    default: null,
  },
  newExpiry: {
    type: Date,
    required: true,
  },
  paymentProvider: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'stripe', 'manual'],
    default: 'bkash',
  },
  trxId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
