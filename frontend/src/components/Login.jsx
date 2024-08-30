import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/Api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      
      const token = response.data.token;
      const email = formData.email;
  
      if (email) {
        login(token, email);
        alert('Login Successful');
        navigate('/messages');
      } else {
        throw new Error('User data is missing or invalid');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Error Logging In');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {error && <Alert variant="danger">{error}</Alert>}
        <h2>Login</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </Form.Group>
          <Button type="submit" className="login-button">Login</Button>
        </Form>
      </div>
    </div>
  );
}

export default Login;
