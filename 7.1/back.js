const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001; 

app.use(cors());
app.use(express.json());

const products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 45 }
];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
