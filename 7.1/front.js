import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    backgroundColor: '#1a1a1a',
    color: 'white',
    minHeight: '100vh',
    padding: '20px',
  },
  productList: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    marginTop: '20px',
  },
  productCard: {
    backgroundColor: '#2c2c2c',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '20px',
    width: '200px',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products. Is the backend server running?');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div style={styles.app}><p>Loading...</p></div>;
  }

  if (error) {
    return <div style={styles.app}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div style={styles.app}>
      <h1>Product List</h1>
      <div style={styles.productList}>
        {products.map(product => (
          <div key={product.id} style={styles.productCard}>
            <h2>{product.name}</h2>
            <p>Price: ${product.price}</p>
            <button style={styles.button}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
