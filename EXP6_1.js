const express = require('express');
const app = express();
const port = 3000;

// The secret token required for protected routes
const SECRET_BEARER_TOKEN = 'mysecrettoken';

/
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  // Log the method, URL, and timestamp
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Call next() to pass the request to the next middleware or route handler
  next();
});


const authenticateToken = (req, res, next) => {
  // Get the 'Authorization' header from the request
  const authHeader = req.headers['authorization'];
  
  // Check if the header exists
  if (!authHeader) {
    // If no header, send 401 Unauthorized
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }

  // The header format is expected to be "Bearer <token>"
  // Split the header string to get the token part
  const parts = authHeader.split(' ');

 
  if (parts.length !== 2 || parts[0] !== 'Bearer' || parts[1] !== SECRET_BEARER_TOKEN) {
    // If format is wrong or token is incorrect, send 401
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }

  // If the header is present, the format is correct, and the token matches...
  // ...the user is authenticated. Call next() to proceed to the route handler.
  console.log('Authentication successful.');
  next();
};

/
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});


app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).send('You have accessed a protected route with a valid Bearer token!');
});

// =T================================================================
// 4. Start the Server
// =================================================================
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Try visiting:');
  console.log(`  http://localhost:${port}/public (should work)`);
  console.log(`  http://localhost:${port}/protected (should fail with 401)`);
});