import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Form, Button, ListGroup, Alert } from 'react-bootstrap';
import api from '../services/Api';
import { useAuth } from '../contexts/AuthContext';

function Messages() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allMessages, setAllMessages] = useState({});
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const { currentUser, socket, onlineUsers, initializeSocket } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.filter(user => user.email !== currentUser));
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      handleError(error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleNewMessage = useCallback((message) => {
    setAllMessages((prevMessages) => {
      const otherUserId = message.sender_id === currentUser ? message.recipient_id : message.sender_id;
      const updatedMessages = { ...prevMessages };
      if (!updatedMessages[otherUserId]) {
        updatedMessages[otherUserId] = [];
      }

      const messageExists = updatedMessages[otherUserId].some(msg => msg.id === message.id);
      if (!messageExists) {
        updatedMessages[otherUserId] = [...updatedMessages[otherUserId], message];
      }

      return updatedMessages;
    });
  }, [currentUser]);

  useEffect(() => {
    if (socket) {
      socket.on('message', handleNewMessage);
      return () => socket.off('message', handleNewMessage);
    }
  }, [socket, handleNewMessage]);

  const fetchMessages = useCallback(async (userId) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setAllMessages(prevMessages => ({
        ...prevMessages,
        [userId]: response.data
      }));
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      handleError(error);
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser, fetchMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !socket || !content.trim()) return;

    try {
      const response = await api.post('/messages', { recipient_id: selectedUser.id, content });
      const newMessage = response.data;

      socket.emit('sendMessage', newMessage);

      setContent('');
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      handleError(error);
    }
  };

  const handleError = (error) => {
    console.error('Error details:', error);
    if (error.response) {
      setError(`Server error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      setError('No response received from the server. Please check your connection.');
    } else {
      setError(`Error: ${error.message}`);
    }
  };

  const isUserOnline = (email) => onlineUsers.includes(email);

  const currentMessages = useMemo(() => {
    return selectedUser ? allMessages[selectedUser.id] || [] : [];
  }, [selectedUser, allMessages, handleSend, handleNewMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  return (
    <div className="d-flex h-100">
      <div className="user-list" style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px', overflowY: 'auto' }}>
        <h5>Contacts</h5>
        <ListGroup>
          {users.map((user) => (
            <ListGroup.Item
              key={user.id}
              onClick={() => setSelectedUser(user)}
              active={selectedUser && selectedUser.id === user.id}
              style={{ cursor: 'pointer' }}
            >
              {user.name} {isUserOnline(user.email) ? '🟢' : '🔴'}
              {allMessages[user.id] && allMessages[user.id].length > 0 && (
                <span className="badge bg-primary rounded-pill float-end">
                  {allMessages[user.id].length}
                </span>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      <div className="message-area" style={{ width: '70%', display: 'flex', flexDirection: 'column', height: '80vh' }}>
        {selectedUser ? (
          <>
            <h5 className="p-2 border-bottom">Chat with {selectedUser.name}</h5>
            <div className="messages-container" style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
              {currentMessages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`mb-2 ${message.sender_id === selectedUser.id ? 'text-left' : 'text-right'}`}
                >
                  <div
                    className={`d-inline-block p-2 rounded ${
                      message.sender_id === selectedUser.id ? 'bg-light' : 'bg-primary text-white'
                    }`}
                    style={{ maxWidth: '70%', wordBreak: 'break-word' }}
                  >
                    {message.content}
                  </div>
                  <div><small>{new Date(message.timestamp).toLocaleString()}</small></div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <Form onSubmit={handleSend} className="mt-auto p-2">
              <Form.Group controlId="formContent" className="d-flex">
                <Form.Control
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type a message..."
                  required
                />
                <Button variant="primary" type="submit" className="ml-2">Send</Button>
              </Form.Group>
            </Form>
          </>
        ) : (
          <Alert variant="info" className="m-3">Select a user to start messaging</Alert>
        )}
      </div>
      {error && (
        <Alert variant="danger" className="mt-3 position-fixed" style={{ bottom: 20, right: 20, maxWidth: '300px', zIndex: 1000 }}>
          {error}
        </Alert>
      )}
    </div>
  );
}

export default Messages;
