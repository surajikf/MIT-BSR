import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      setIsConnected(false);
    });

    // Trading signals events
    newSocket.on('signals:update', (data) => {
      console.log('📊 Signals update received:', data);
      setLastMessage({ type: 'signals:update', data, timestamp: new Date() });
    });

    newSocket.on('signal:new', (data) => {
      console.log('🆕 New signal received:', data);
      setLastMessage({ type: 'signal:new', data, timestamp: new Date() });
    });

    newSocket.on('signal:statusUpdate', (data) => {
      console.log('🔄 Signal status update:', data);
      setLastMessage({ type: 'signal:statusUpdate', data, timestamp: new Date() });
    });

    // Price updates
    newSocket.on('price:update', (data) => {
      console.log('💰 Price update received:', data);
      setLastMessage({ type: 'price:update', data, timestamp: new Date() });
    });

    // Market summary
    newSocket.on('market:summary', (data) => {
      console.log('📈 Market summary received:', data);
      setLastMessage({ type: 'market:summary', data, timestamp: new Date() });
    });

    // Signal generation events
    newSocket.on('signals:generating', (data) => {
      console.log('🔄 Generating signals:', data);
      setLastMessage({ type: 'signals:generating', data, timestamp: new Date() });
    });

    newSocket.on('signals:generated', (data) => {
      console.log('✅ Signals generated:', data);
      setLastMessage({ type: 'signals:generated', data, timestamp: new Date() });
    });

    // Alert events
    newSocket.on('alert:stopLoss', (data) => {
      console.log('🚨 Stop loss alert:', data);
      setLastMessage({ type: 'alert:stopLoss', data, timestamp: new Date() });
    });

    newSocket.on('alert:takeProfit', (data) => {
      console.log('🎯 Take profit alert:', data);
      setLastMessage({ type: 'alert:takeProfit', data, timestamp: new Date() });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Emit events to server
  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  // Listen to specific events
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Remove event listener
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    isConnected,
    lastMessage,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
