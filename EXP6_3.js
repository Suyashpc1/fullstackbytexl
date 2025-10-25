const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(express.json());

const MONGO_URI = 'mongodb://127.0.0.1:27017/bank-db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true, min: 0 }
});

const User = mongoose.model('User', userSchema);

app.post('/create-users', async (req, res) => {
  try {
    await User.deleteMany({});
    
    const users = await User.create([
      { name: 'Alice', balance: 1000 },
      { name: 'Bob', balance: 500 }
    ]);
    
    res.status(201).json({
      message: "Users created",
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating users', error: error.message });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    const { fromId, toId, amount } = req.body;

    if (!fromId || !toId || !amount) {
      return res.status(400).json({ message: 'Missing required fields: fromId, toId, amount' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    
    if (fromId === toId) {
      return res.status(400).json({ message: 'Cannot transfer to the same account' });
    }

    const fromUser = await User.findById(fromId);
    const toUser = await User.findById(toId);

    if (!fromUser) {
      return res.status(404).json({ message: 'Sender account not found' });
    }
    if (!toUser) {
      return res.status(404).json({ message: 'Receiver account not found' });
    }

    if (fromUser.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    fromUser.balance -= amount;
    toUser.balance += amount;

    await fromUser.save();
    await toUser.save();

    res.status(200).json({
      message: `Transferred $${amount} from ${fromUser.name} to ${toUser.name}`,
      senderBalance: fromUser.balance,
      receiverBalance: toUser.balance
    });

  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Run POST /create-users (with no body) to initialize data.');
});