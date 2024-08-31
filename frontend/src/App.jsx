import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import UserList from './components/UserList';
import UserDetails from './components/UserDetails';
import Messages from './components/Messages';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function PrivateRoute({ element: Element }) {
  const { currentUser } = useAuth();
  return currentUser ? <Element /> : <Navigate to="/login" />;
}

function PublicRoute({ element: Element }) {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/messages" /> : <Element />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/register" element={<PublicRoute element={Register} />} />
            <Route path="/login" element={<PublicRoute element={Login} />} />
            <Route path="/users" element={<PrivateRoute element={UserList} />} />
            <Route path="/users/:id" element={<PrivateRoute element={UserDetails} />} />
            <Route path="/messages" element={<PrivateRoute element={Messages} />} />
            <Route path="/" element={<Navigate to="/messages" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;