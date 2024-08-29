import React, { useEffect, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/Api';

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data);
        setFormData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error.response && error.response.status === 401) {
          setError('Unauthorized. Please log in again.');
          navigate('/login');
        } else {
          setError('An error occurred while fetching user details. Please try again later.');
        }
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${id}`, formData);
      setSuccess('User Updated Successfully');
      setError(null);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response && error.response.status === 401) {
        setError('Unauthorized. Please log in again.');
        navigate('/login');
      } else {
        setError('An error occurred while updating the user. Please try again.');
      }
    }
  };

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!user) {
    return <Alert variant="info">Loading...</Alert>;
  }

  return (
    <>
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleUpdate}>
        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formPhone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formRole">
          <Form.Label>Role</Form.Label>
          <Form.Control
            as="select"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option>Student</option>
            <option>Teacher</option>
            <option>Institute</option>
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit">Update</Button>
      </Form>
    </>
  );
}

export default UserDetails;

