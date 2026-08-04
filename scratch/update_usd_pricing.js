const path = require('path');
const mongoose = require(path.resolve('node_modules', 'mongoose'));

async function updatePricing() {
  const mongoUri = 'mongodb://127.0.0.1:27017/stockmetapro';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  await mongoose.connection.db.collection('packages').updateOne(
    { name: 'Pro Plan' },
    { $set: { price_usd: 1.0 } }
  );
  await mongoose.connection.db.collection('packages').updateOne(
    { name: 'Pro' },
    { $set: { price_usd: 1.0 } }
  );

  await mongoose.connection.db.collection('packages').updateOne(
    { name: 'Premium Plan' },
    { $set: { price_usd: 2.0 } }
  );
  await mongoose.connection.db.collection('packages').updateOne(
    { name: 'Premium' },
    { $set: { price_usd: 2.0 } }
  );

  await mongoose.connection.db.collection('packages').updateOne(
    { name: 'Max Plan' },
    { $set: { price_usd: 3.0 } }
  );
  await mongoose.connection.db.collection('packages').updateOne(
    { name: 'Max' },
    { $set: { price_usd: 3.0 } }
  );

  console.log('USD Pricing update completed successfully.');
  await mongoose.disconnect();
}

updatePricing().catch(console.error);
