import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../services/Api';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Student',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert('User Registered Successfully');
    } catch (error) {
      console.error(error);
      alert('Error Registering User');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formName">
        <Form.Label>Name</Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
      </Form.Group>
      <Form.Group controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
      </Form.Group>
      <Form.Group controlId="formPhone">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
      </Form.Group>
      <Form.Group controlId="formRole">
        <Form.Label>Role</Form.Label>
        <Form.Control as="select" name="role" value={formData.role} onChange={handleChange}>
          <option>Student</option>
          <option>Teacher</option>
          <option>Institute</option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
      </Form.Group>
      <Button variant="primary" type="submit">Register</Button>
    </Form>
  );
}

export default Register;
