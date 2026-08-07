const mongoose = require('mongoose');

async function syncAndAddLocalTx() {
  const uri = "mongodb://localhost:27017/stockmetapro";
  try {
    await mongoose.connect(uri);
    console.log("Connected to stockmetapro DB successfully!");

    let Transaction;
    try {
      Transaction = mongoose.model('Transaction');
    } catch {
      Transaction = mongoose.model('Transaction', new mongoose.Schema({
        trxId: String,
        amountPaid: Number,
        status: String,
        createdAt: Date,
        paymentProvider: String
      }));
    }

    // Insert golamisking as Unused with 300 Tk
    await Transaction.deleteOne({ trxId: 'golamisking' });
    const tx1 = await Transaction.create({
      trxId: 'golamisking',
      amountPaid: 300,
      status: 'Unused',
      paymentProvider: 'bkash',
      createdAt: new Date()
    });
    console.log(`Successfully added: ${tx1.trxId} (Status: ${tx1.status})`);

    // Insert TESTTRX88888 as Unused with 100 Tk
    await Transaction.deleteOne({ trxId: 'TESTTRX88888' });
    const tx2 = await Transaction.create({
      trxId: 'TESTTRX88888',
      amountPaid: 100,
      status: 'Unused',
      paymentProvider: 'bkash',
      createdAt: new Date()
    });
    console.log(`Successfully added: ${tx2.trxId} (Status: ${tx2.status})`);

  } catch (err) {
    console.error("DB Sync Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

syncAndAddLocalTx();
