const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_secret_key_here'; // Use a strong, secret key

app.use(express.json());

const hardcodedUser = {
  id: 1,
  username: 'testuser',
  password: 'password123'
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === hardcodedUser.username && password === hardcodedUser.password) {
    const userPayload = {
      id: hardcodedUser.id,
      username: hardcodedUser.username
    };

    const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ token: token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    message: "You have accessed a protected route!",
    user: req.user
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});