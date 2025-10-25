const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const SECRET_KEY = 'your-very-secret-key-for-jwt';

app.use(express.json());

const mockUser = {
  id: 1,
  username: 'user1',
  password: 'password123'
};

let account = {
  balance: 1000
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  jwt.verify(token, SECRET_KEY, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = userPayload;
    next();
  });
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username === mockUser.username && password === mockUser.password) {
    const userPayload = { username: mockUser.username, id: mockUser.id };
    const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({
      username: mockUser.username,
      token: token
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

app.get('/balance', authenticateToken, (req, res) => {
  res.status(200).json({
    balance: account.balance
  });
});

app.post('/deposit', authenticateToken, (req, res) => {
  const { amount } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount. Must be a positive number.' });
  }

  account.balance += amount;

  res.status(200).json({
    message: `Deposited $${amount}`,
    newBalance: account.balance
  });
});

app.post('/withdraw', authenticateToken, (req, res) => {
  const { amount } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount. Must be a positive number.' });
  }

  if (amount > account.balance) {
    return res.status(400).json({ message: 'Insufficient funds.' });
  }

  account.balance -= amount;

  res.status(200).json({
    message: `Withdrew $${amount}`,
    newBalance: account.balance
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Initial Balance: ${account.balance}`);
  console.log(`Test User: ${mockUser.username} / ${mockUser.password}`);
});