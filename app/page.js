"use client"
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus,Sun,Moon, Trash2, Check, Search } from 'lucide-react';

const GroceryOrdering = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    fetchItems();
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/groceries');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Failed to load grocery items');
    }
  };

  const fetchOrdersByEmail = async () => {
    try {
      const response = await fetch(`/api/orders?email=${searchEmail}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
      setShowOrders(true);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 
            ? { ...item, quantity: newQuantity }
            : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const placeOrder = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart,
          email: email 
        }),
      });

      if (!response.ok) throw new Error('Failed to place order');
      
      setOrderSuccess(true);
      setCart([]);
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (err) {
      setError('Failed to place order');
    }
  };

  const OrdersList = () => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Order #{order.id}</span>
              <span className={`px-2 py-1 rounded text-sm ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Placed on: {new Date(order.created_at).toLocaleString()}
            </div>
            <div className="border-t pt-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <img 
                      src={item.url || '/api/placeholder/40/40'} 
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span>
                    {item.quantity} × ${item.price}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>${order.total_amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Rest of the fetch and state management functions remain the same

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white transform transition-transform hover:scale-105">
              Grocery Store
            </h1>
            <div className="flex items-center gap-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
              >
                {isDarkMode ? 
                  <Sun className="w-5 h-5 text-yellow-500" /> : 
                  <Moon className="w-5 h-5 text-gray-600" />
                }
              </button>
              
              {/* Order lookup section */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter email to find orders"
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-200"
                />
                <button
                  onClick={fetchOrdersByEmail}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              
              {/* Cart button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transform transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center animate-bounce">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded animate-fade-in">
              {error}
            </div>
          )}

          {orderSuccess && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded flex items-center animate-fade-in">
              <Check className="w-5 h-5 mr-2" />
              Order placed successfully!
            </div>
          )}
        </div>

        {/* Main content */}
        {showOrders ? (
          <div className="animate-fade-in">
            <button
              onClick={() => setShowOrders(false)}
              className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Back to Shopping
            </button>
            <OrdersList />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {items.map(item => (
              <div 
                key={item.id} 
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={item.url || '/api/placeholder/400/300'} 
                    alt={item.name}
                    className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <div className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{item.name}</div>
                  <div className="text-gray-600 dark:text-gray-300 mb-4">${item.price || '5.99'}</div>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Sidebar */}
        {isCartOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in"
            onClick={() => setIsCartOpen(false)}
          >
            <div 
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-lg p-6 overflow-y-auto transform transition-transform duration-300 translate-x-0 animate-slide-in"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Shopping Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded transform transition-all duration-200 hover:scale-102 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.url || '/api/placeholder/48/48'} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-semibold dark:text-white">{item.name}</div>
                            <div className="text-gray-600 dark:text-gray-300">${item.price || '5.99'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t dark:border-gray-700 pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-200"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold dark:text-white">Total:</span>
                      <span className="font-semibold dark:text-white">
                        ${cart.reduce((sum, item) => sum + (item.quantity * (item.price || 5.99)), 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={placeOrder}
                      disabled={email.length==0}
                      className="w-full py-3 bg-green-500 disabled:bg-green-200 dark:disabled:bg-green-800 text-white rounded hover:bg-green-600 transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:transform-none"
                    >
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add these styles to your global CSS file
const globalStyles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
`;

export default GroceryOrdering;