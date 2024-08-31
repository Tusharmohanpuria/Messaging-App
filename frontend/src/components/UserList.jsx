import React, { useEffect, useState } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/Api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);

        if (error.response) {
          switch (error.response.status) {
            case 400:
              setError('Bad request. Please check your input.');
              break;
            case 401:
              setError('Unauthorized. Please log in again.');
              navigate('/login');
              break;
            case 403:
              setError('Forbidden. You do not have permission to access this resource.');
              break;
            default:
              setError(`An error occurred: ${error.response.data}`);
          }
        } else if (error.request) {
          setError('No response received from the server. Please try again later.');
        } else {
          setError(`Error: ${error.message}`);
        }
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(user => user.id !== id));
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.response?.status === 401) {
        setError('You are not authorized to delete users. Please log in again.');
        navigate('/login');
      } else {
        setError('An error occurred while deleting the user. Please try again.');
      }
    }
  };

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <h2>User List</h2>
      <div className="table-responsive custom-scrollbar"> {/* Added custom-scrollbar class */}
        <Table striped bordered hover className="user-list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td>
                  <div className="d-flex justify-content-center">
                    <Link to={`/users/${user.id}`} className="btn btn-info btn-sm me-2">View</Link>
                    {currentUser === user.email && (
                      <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>Delete</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default UserList;
