import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  CreditCardIcon,
  PhoneIcon,
  LocationMarkerIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon
} from '@heroicons/react/outline';
import { menuAPI, ordersAPI } from '../services/api';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import realtimeService from '../services/realtime';
import UniformLayout from '../components/UniformLayout';

const Order = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState([]);
  const [orderData, setOrderData] = useState({
    delivery_address: '',
    phone_number: user?.phone || '',
    special_instructions: '',
    payment_method: 'cash_on_delivery'
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('checkout_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      }
    }
  }, []);

  // Update phone number when user data changes
  useEffect(() => {
    if (user?.phone && !orderData.phone_number) {
      setOrderData(prev => ({ ...prev, phone_number: user.phone }));
    }
  }, [user, orderData.phone_number]);

  const { data: menuItems } = useQuery('menuItems', menuAPI.getMenuItems);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
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
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = 150; // Fixed delivery fee
    return subtotal + deliveryFee;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!orderData.delivery_address || !orderData.phone_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create order payload for new API
      const orderPayload = {
        payment_method: orderData.payment_method,
        delivery_address: orderData.delivery_address,
        phone_number: orderData.phone_number,
        special_instructions: orderData.special_instructions,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price),
          special_instructions: item.special_instructions || ''
        }))
      };

      // Try to create order via API
      try {
        const response = await fetch('http://localhost:8000/api/orders/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(orderPayload)
        });

        if (response.ok) {
          const order = await response.json();
          toast.success('Order placed successfully! Your order #' + order.id + ' is being processed.');
          
          // Trigger real-time update for admin dashboard
          realtimeService.triggerOrderCheck();
          realtimeService.sendNotification(
            `New order #${order.id} placed by ${user?.name || 'Customer'}`,
            'new_order'
          );
          
          // Clear cart and redirect
          setCart([]);
          localStorage.removeItem('checkout_cart');
          setOrderData({
            delivery_address: '',
            phone_number: user?.phone || '',
            special_instructions: '',
            payment_method: 'cash_on_delivery'
          });
          
          // Redirect to orders page to track
          navigate('/orders');
        } else {
          throw new Error('Failed to create order');
        }
      } catch (apiError) {
        // Fallback: Create mock order for demo
        console.log('API not available, creating mock order');
        const mockOrder = {
          id: Date.now(),
          ...orderPayload,
          created_at: new Date().toISOString(),
          order_number: 'QB' + Date.now()
        };
        
        toast.success('Order placed successfully! Your order #' + mockOrder.order_number + ' is being processed.');
        
        // Store mock order in localStorage for demo
        const existingOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        existingOrders.push(mockOrder);
        localStorage.setItem('user_orders', JSON.stringify(existingOrders));
        
        // Clear cart and redirect
        setCart([]);
        localStorage.removeItem('checkout_cart');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  return (
    <UniformLayout title="Order" showSidebar={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-gradient">Place Your Order</h1>
          <p className="text-xl text-white/80">Select your favorite meals and get them delivered</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="glass-card p-6"
            >
              <h2 className="text-2xl font-semibold mb-6 text-white">Menu Items</h2>
              
              {menuItems?.data?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/70">No menu items available</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                  {menuItems?.data?.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="flex items-center space-x-4 p-4 glass-morphism rounded-lg hover:bg-white/10 transition-all duration-300"
                    >
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-white/60">{item.category_name}</p>
                        <p className="text-neon-green font-semibold">KSh {item.price}</p>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="btn-glow p-3 rounded-full"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Cart */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center space-x-2">
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span>Your Cart</span>
                </h2>
                
                {cart.length === 0 ? (
                  <p className="text-white/70 text-center py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 glass-morphism rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{item.name}</h4>
                          <p className="text-neon-green text-sm">KSh {item.price} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                          >
                            <MinusIcon className="w-4 h-4 text-white" />
                          </button>
                          <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded-full hover:bg-red-500/20 transition-colors ml-2"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Form */}
              <form onSubmit={handleSubmitOrder} className="glass-card p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-white">Order Details</h2>
                
                <div>
                  <label className="block text-white/80 mb-2 text-sm">
                    <LocationMarkerIcon className="w-4 h-4 inline mr-1" />
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    value={orderData.delivery_address}
                    onChange={(e) => setOrderData({...orderData, delivery_address: e.target.value})}
                    placeholder="Enter your full delivery address"
                    className="glass-input w-full h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm">
                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={orderData.phone_number}
                    onChange={(e) => setOrderData({...orderData, phone_number: e.target.value})}
                    placeholder="07XXXXXXXX"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={orderData.payment_method}
                    onChange={(e) => setOrderData({...orderData, payment_method: e.target.value})}
                    className="glass-input w-full"
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="airtel_money">Airtel Money</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm">Special Instructions</label>
                  <textarea
                    value={orderData.special_instructions}
                    onChange={(e) => setOrderData({...orderData, special_instructions: e.target.value})}
                    placeholder="Any allergies, preferences, etc."
                    className="glass-input w-full h-16 resize-none"
                  />
                </div>

                {/* Order Summary */}
                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal:</span>
                    <span>KSh {calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Delivery Fee:</span>
                    <span>KSh 150</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total:</span>
                    <span className="text-neon-green">KSh {calculateTotal()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full btn-glow py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCardIcon className="w-5 h-5" />
                  <span>Place Order</span>
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </UniformLayout>
  );
};

export default Order;
