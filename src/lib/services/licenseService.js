import connectToDatabase from '../mongodb.js';
import License from '../../models/License.js';
import User from '../../models/User.js';
import Package from '../../models/Package.js';
import Transaction from '../../models/Transaction.js';

/**
 * Executes a license renewal or purchase with carry-forward credit rollover.
 */
export async function renewOrPurchaseLicense({
  identifier, // License Key, Email, or Phone
  packageId,
  paymentProvider = 'bkash',
  trxId = null,
  amountPaid = 0,
}) {
  await connectToDatabase();

  const selectedPackage = await Package.findById(packageId);
  if (!selectedPackage) {
    throw new Error('Selected package not found');
  }

  const cleanIdentifier = identifier ? identifier.trim() : '';

  // Search user by email or phone if provided
  let user = await User.findOne({
    $or: [
      { email: cleanIdentifier.toLowerCase() },
      { mobile: cleanIdentifier }
    ]
  });

  // Search existing license by licenseKey/api_key or by userId
  let license = null;

  if (cleanIdentifier) {
    license = await License.findOne({
      $or: [
        { licenseKey: cleanIdentifier },
        { api_key: cleanIdentifier }
      ]
    });
  }

  if (!license && user) {
    license = await License.findOne({ userId: user._id });
  }

  const now = new Date();

  if (license) {
    // Check if license is currently active and not expired
    const currentExpiry = license.expiresAt || license.expire_date || now;
    const isBeforeExpiry = (license.status === 'Active' || license.status === 'active') && new Date(currentExpiry) > now;

    // Rollover Logic
    const existingCredits = license.currentCredits !== undefined ? license.currentCredits : Math.max(0, license.credit_limit - license.credits_used);
    const rolledOverCredits = isBeforeExpiry ? existingCredits : 0;
    const totalNewCredits = rolledOverCredits + selectedPackage.credit_limit;

    // Expiry calculation
    const baseDate = isBeforeExpiry ? new Date(currentExpiry) : now;
    const newExpiry = new Date(baseDate.setDate(baseDate.getDate() + selectedPackage.duration_days));

    // Update License
    license.credit_limit = totalNewCredits;
    license.credits_used = 0; // Reset used count against new limit
    license.currentCredits = totalNewCredits;
    license.duration_days = selectedPackage.duration_days;
    license.expire_date = newExpiry;
    license.expiresAt = newExpiry;
    license.status = 'Active';
    license.lastRenewedAt = now;
    license.packageId = selectedPackage._id;

    if (!license.activation_date) {
      license.activation_date = now;
    }

    await license.save();

    // Record Transaction Audit Log
    const transaction = await Transaction.create({
      licenseId: license._id,
      userId: license.userId || (user ? user._id : null),
      packageId: selectedPackage._id,
      type: 'RENEWAL',
      amountPaid,
      creditsAdded: selectedPackage.credit_limit,
      creditsRolledOver: rolledOverCredits,
      totalCreditsAfter: totalNewCredits,
      previousExpiry: currentExpiry,
      newExpiry,
      paymentProvider,
      trxId,
    });

    return {
      success: true,
      message: isBeforeExpiry
        ? `License renewed successfully! ${rolledOverCredits} unused credits were carried forward.`
        : 'License renewed successfully!',
      license,
      transaction,
      rolledOverCredits,
    };
  } else {
    // If no existing license found, generate a new one
    const newLicenseKey = `SMP-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const expiryDate = new Date(now.setDate(now.getDate() + selectedPackage.duration_days));

    const newLicense = await License.create({
      api_key: newLicenseKey,
      licenseKey: newLicenseKey,
      credit_limit: selectedPackage.credit_limit,
      credits_used: 0,
      currentCredits: selectedPackage.credit_limit,
      duration_days: selectedPackage.duration_days,
      activation_date: now,
      expire_date: expiryDate,
      expiresAt: expiryDate,
      status: 'Active',
      lastRenewedAt: now,
      packageId: selectedPackage._id,
      userId: user ? user._id : null,
    });

    const transaction = await Transaction.create({
      licenseId: newLicense._id,
      userId: user ? user._id : null,
      packageId: selectedPackage._id,
      type: 'NEW_PURCHASE',
      amountPaid,
      creditsAdded: selectedPackage.credit_limit,
      creditsRolledOver: 0,
      totalCreditsAfter: selectedPackage.credit_limit,
      previousExpiry: null,
      newExpiry: expiryDate,
      paymentProvider,
      trxId,
    });

    return {
      success: true,
      message: 'New license created successfully!',
      license: newLicense,
      transaction,
      rolledOverCredits: 0,
    };
  }
}
