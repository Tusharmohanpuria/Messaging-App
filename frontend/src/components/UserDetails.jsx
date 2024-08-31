import React, { useEffect, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/Api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/UserDetails.css';

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { currentUser } = useAuth();
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
      setSuccess('User updated successfully.');
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
    return <Alert variant="danger" className="user-details-alert">{error}</Alert>;
  }

  if (!user) {
    return <Alert variant="info" className="user-details-alert">Loading...</Alert>;
  }

  return (
    <div className="user-details-container">
      <div className="user-details-card">
        {success && <Alert variant="success" className="user-details-alert">{success}</Alert>}
        <h2>{currentUser === user.email ? 'Edit Your Profile Details' : 'User Details'}</h2>
        <Form onSubmit={handleUpdate}>
          <Form.Group controlId="formName" className="form-group">
            <Form.Label className="form-label">Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              readOnly={currentUser !== user.email}
            />
          </Form.Group>
          <Form.Group controlId="formEmail" className="form-group">
            <Form.Label className="form-label">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              readOnly={currentUser !== user.email}
            />
          </Form.Group>
          <Form.Group controlId="formPhone" className="form-group">
            <Form.Label className="form-label">Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              readOnly={currentUser !== user.email}
            />
          </Form.Group>
          <Form.Group controlId="formRole" className="form-group">
            <Form.Label className="form-label">Role</Form.Label>
            <Form.Control
              as="select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
              disabled={currentUser !== user.email}
            >
              <option>Student</option>
              <option>Teacher</option>
              <option>Institute</option>
            </Form.Control>
          </Form.Group>
          {currentUser === user.email && (
            <Button variant="primary" type="submit" className="update-button">Update</Button>
          )}
        </Form>
      </div>
    </div>
  );
}

export default UserDetails;
