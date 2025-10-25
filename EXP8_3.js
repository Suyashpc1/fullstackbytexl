const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_very_secret_key_for_rbac';

app.use(express.json());

app.post('/login', (req, res) => {
  const { id, username, password, role } = req.body;

  if (!id || !username || !password || !role) {
    return res.status(400).json({ message: 'id, username, password, and role are required' });
  }

  const userPayload = {
    id: id,
    username: username,
    role: role
  };

  const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: '1h' });
  res.status(200).json({ token: token });
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

const authorizeRole = (allowedRole) => {
  return (req, res, next) => {
    if (req.user.role !== allowedRole) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
};

app.get('/admin-dashboard', authenticateToken, authorizeRole('Admin'), (req, res) => {
  res.status(200).json({
    message: "Welcome to the Admin dashboard!",
    user: req.user
  });
});

app.get('/moderator-panel', authenticateToken, authorizeRole('Moderator'), (req, res) => {
  res.status(200).json({
    message: "Welcome to the Moderator panel!",
    user: req.user
  });
});

app.get('/user-profile', authenticateToken, (req, res) => {
  res.status(200).json({
    message: `Welcome to your profile, ${req.user.username}`,
    user: req.user
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});