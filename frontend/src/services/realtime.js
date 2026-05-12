// Real-time service for live order updates
const API_BASE_URL = 'https://roelog.pythonanywhere.com';

class RealtimeService {
  constructor() {
    this.subscribers = new Map();
    this.pollingInterval = null;
    this.lastOrderCheck = Date.now();
  }

  // Subscribe to order updates
  subscribeToOrders(callback) {
    const id = Date.now().toString();
    this.subscribers.set(id, callback);
    
    // Start polling if not already running
    if (!this.pollingInterval) {
      this.startPolling();
    }
    
    return () => {
      this.subscribers.delete(id);
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    };
  }

  // Start polling for new orders
  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.checkForNewOrders();
    }, 3000); // Check every 3 seconds
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Check for new orders
  async checkForNewOrders() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Check if user is admin and use appropriate endpoint
      const userType = localStorage.getItem('user_type');
      const isAdmin = userType === 'admin';
      const endpoint = isAdmin ? `${API_BASE_URL}/api/orders/admin_orders/` : `${API_BASE_URL}/api/orders/`;

      console.log('Realtime Debug:', {
        userType,
        isAdmin,
        endpoint,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const orders = await response.json();
        console.log('Orders fetched:', orders.length, 'orders');
        
        // Notify all subscribers
        this.subscribers.forEach(callback => {
          callback(orders);
        });
      } else {
        console.error('Failed to fetch orders:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  }

  // Trigger immediate check (called when order is placed)
  triggerOrderCheck() {
    this.checkForNewOrders();
  }

  // Send real-time notification
  sendNotification(message, type = 'info') {
    // Create a custom event for order notifications
    const event = new CustomEvent('orderNotification', {
      detail: { message, type, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
