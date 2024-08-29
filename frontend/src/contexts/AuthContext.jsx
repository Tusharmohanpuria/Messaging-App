import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import createSocket from '../services/Socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('email') || null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const initializeSocket = useCallback(() => {
    if (token && currentUser && !socket) {
      const newSocket = createSocket(currentUser);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to the socket server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from the socket server');
      });

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });
    }
  }, [token, currentUser, socket]);

  useEffect(() => {
    if (token && currentUser) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', currentUser);
      initializeSocket();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]);
    }
  }, [token, currentUser, initializeSocket, socket]);

  const login = (newToken, email) => {
    setToken(newToken);
    setCurrentUser(email);
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setOnlineUsers([]);
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout, socket, onlineUsers, initializeSocket }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}