import React, { useEffect, useState } from 'react';
import { Form, Button, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/Api';
import socket from '../services/Socket';

function Messages() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        handleError(error);
      }
    };

    fetchUsers();

    socket.on('onlineUsers', (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    return () => socket.off('onlineUsers');
  }, [navigate]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/messages/${selectedUser.id}`);
          setMessages(response.data);
          setError(null);
        } catch (error) {
          console.error('Error fetching messages:', error);
          handleError(error);
        }
      };
      fetchMessages();

      socket.on('message', (message) => {
        if (message.sender_id === selectedUser.id || message.recipient_id === selectedUser.id) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      return () => socket.off('message');
    }
  }, [selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const messageData = { recipient_id: selectedUser.id, content };
      await api.post('/messages', messageData);
      socket.emit('sendMessage', messageData);
      setContent('');
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      handleError(error);
    }
  };

  const handleError = (error) => {
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
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className="d-flex">
      <div className="user-list">
        <ListGroup>
          {users.map((user) => (
            <ListGroup.Item
              key={user.id}
              onClick={() => setSelectedUser(user)}
              active={selectedUser && selectedUser.id === user.id}
              style={{ cursor: 'pointer' }}
            >
              {user.name} {isUserOnline(user.id) ? '🟢' : '🔴'}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      <div className="message-area">
        {selectedUser ? (
          <>
            <h4>Chat with {selectedUser.name}</h4>
            <ListGroup className="mt-4">
              {messages.map((message, index) => (
                <ListGroup.Item key={index}>
                  <strong>{message.sender_id === selectedUser.id ? selectedUser.name : 'You'}:</strong> {message.content}
                  <div><small>{new Date(message.timestamp).toLocaleString()}</small></div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Form onSubmit={handleSend}>
              <Form.Group controlId="formContent">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">Send</Button>
            </Form>
          </>
        ) : (
          <Alert variant="info">Select a user to start messaging</Alert>
        )}
      </div>
    </div>
  );
}

export default Messages;
