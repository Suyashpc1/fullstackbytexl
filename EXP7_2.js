import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

const productsData = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 45 },
];

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addProduct: (state, action) => {
      const itemInCart = state.items.find((item) => item.id === action.payload.id);
      if (itemInCart) {
        itemInCart.quantity++;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const itemInCart = state.items.find((item) => item.id === action.payload.id);
      if (itemInCart) {
        const newQuantity = Number(action.payload.quantity);
        if (newQuantity >= 1) {
          itemInCart.quantity = newQuantity;
        }
      }
    },
  },
});

const { addProduct, removeProduct, updateQuantity } = cartSlice.actions;

const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});

const styles = {
  container: { fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '20px' },
  section: { marginTop: '30px' },
  grid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    width: '200px',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#e0e0e0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  input: { width: '40px', textAlign: 'center' },
};

function ProductList() {
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(addProduct(product));
  };

  return (
    <div style={styles.section}>
      <h2>Products</h2>
      <div style={styles.grid}>
        {productsData.map((product) => (
          <div key={product.id} style={styles.card}>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button style={styles.button} onClick={() => handleAddToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShoppingCart() {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const handleRemove = (id) => {
    dispatch(removeProduct(id));
  };

  const handleQuantityChange = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  return (
    <div style={styles.section}>
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.id} style={styles.cartItem}>
              <span>{item.name} (${item.price})</span>
              <input
                type="number"
                min="1"
                style={styles.input}
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
              />
              <button style={styles.button} onClick={() => handleRemove(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <div style={styles.container}>
        <h1>My Shop</h1>
        <ProductList />
        <ShoppingCart />
      </div>
    </Provider>
  );
}

export default App;