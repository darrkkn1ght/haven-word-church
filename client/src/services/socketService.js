import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return;
    }

    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    // Handle real-time notifications
    this.socket.on('notification', (notification) => {
      this.emit('notification', notification);
    });

    // Handle prayer request updates
    this.socket.on('prayer_request_update', (data) => {
      this.emit('prayer_request_update', data);
    });

    // Handle event updates
    this.socket.on('event_update', (data) => {
      this.emit('event_update', data);
    });

    // Handle sermon updates
    this.socket.on('sermon_update', (data) => {
      this.emit('sermon_update', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  // Send notification to server
  sendNotification(notification) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_notification', notification);
    }
  }

  // Join a room (for specific notifications)
  joinRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', room);
    }
  }

  // Leave a room
  leaveRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', room);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

const socketService = new SocketService();
export default socketService; 