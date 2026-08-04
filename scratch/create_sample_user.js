const path = require('path');
const mongoose = require(path.resolve('node_modules', 'mongoose'));

async function createSampleData() {
  const mongoUri = 'mongodb://127.0.0.1:27017/stockmetapro';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  // Create Package if missing
  let pkg = await mongoose.connection.db.collection('packages').findOne({ name: 'Pro Plan' });
  if (!pkg) {
    const pkgId = new mongoose.Types.ObjectId();
    await mongoose.connection.db.collection('packages').insertOne({
      _id: pkgId,
      name: 'Pro Plan',
      price_tk: 2500,
      credit_limit: 1000,
      duration_days: 30,
      is_popular: true,
      createdAt: new Date()
    });
    pkg = { _id: pkgId };
  }

  // Create or Update User: Md Golam Rasul (01980126826)
  let user = await mongoose.connection.db.collection('users').findOne({ mobile: '01980126826' });
  if (!user) {
    const userId = new mongoose.Types.ObjectId();
    await mongoose.connection.db.collection('users').insertOne({
      _id: userId,
      name: 'Md Golam Rasul',
      email: 'rasul@gmail.com',
      mobile: '01980126826',
      password: 'hashedpassword123', // Dummy hashed password
      role: 'user',
      createdAt: new Date()
    });
    user = { _id: userId };
  }

  // Create Active License for this User
  const licenseKey = 'SK-RASUL-777-TEST';
  await mongoose.connection.db.collection('licenses').deleteMany({ userId: user._id }); // Clean older tests
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30); // 30 Days expiry from now

  await mongoose.connection.db.collection('licenses').insertOne({
    api_key: licenseKey,
    licenseKey: licenseKey,
    credit_limit: 1000,
    credits_used: 0,
    currentCredits: 1000,
    duration_days: 30,
    activation_date: new Date(),
    expire_date: expiry,
    expiresAt: expiry,
    status: 'Active',
    userId: user._id,
    packageId: pkg._id,
    createdAt: new Date()
  });

  console.log('Sample Approved User Account & License created successfully:');
  console.log('Name: Md Golam Rasul');
  console.log('Mobile: 01980126826');
  console.log('License Key: SK-RASUL-777-TEST');
  console.log('Status: Active (Approved)');
  
  await mongoose.disconnect();
}

createSampleData().catch(console.error);
