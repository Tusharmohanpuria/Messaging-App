import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Form, Button, ListGroup, Alert } from 'react-bootstrap';
import api from '../services/Api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Messages.css';

function Messages() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allMessages, setAllMessages] = useState({});
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const { currentUser, logout, socket, onlineUsers, initializeSocket } = useAuth();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const manualScrollTimeout = useRef(null);

  useEffect(() => {
    initializeSocket();
    if (!currentUser) {
      logout();
    }
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

  const updateCurrentMessages = useCallback(() => {
    setCurrentMessages(selectedUser ? allMessages[selectedUser.id] || [] : []);
    scrollToBottom();
  }, [allMessages, selectedUser]);

  const handleNewMessage = useCallback((message) => {
    setAllMessages((prevMessages) => {
      const otherUserId = message.sender_id === currentUser ? message.recipient_id : message.sender_id;
      const updatedMessages = {
        ...prevMessages,
        [otherUserId]: [
          ...(prevMessages[otherUserId] || []),
          message
        ].filter((msg, index, self) => 
          index === self.findIndex((t) => t.id === msg.id)
        )
      };
      return updatedMessages;
    });
    updateCurrentMessages();
  }, [currentUser, updateCurrentMessages]);

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
      updateCurrentMessages();
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      handleError(error);
    }
  }, [updateCurrentMessages]);

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

      setAllMessages((prevMessages) => ({
        ...prevMessages,
        [selectedUser.id]: [
          ...(prevMessages[selectedUser.id] || []),
          newMessage
        ]
      }));
      updateCurrentMessages();

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

  const scrollToBottom = (force = false) => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current;
      const scrollElement = messagesEndRef.current;
      
      const newMessageCount = currentMessages.length - previousMessageCountRef.current;
      previousMessageCountRef.current = currentMessages.length;
  
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if ((force || isNearBottom || newMessageCount > 5) && !isManualScrolling) {
        scrollElement.scrollIntoView({ behavior: 'auto' });
        setIsScrolledToBottom(true);
      } else if (newMessageCount > 0 && isScrolledToBottom && !isManualScrolling) {
        scrollElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (!isManualScrolling) {
      scrollToBottom();
    }
  }, [currentMessages, isManualScrolling]);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 1;
      setIsScrolledToBottom(isAtBottom);
    }
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleManualScroll = () => {
    setIsManualScrolling(true);
    clearTimeout(manualScrollTimeout.current);
    manualScrollTimeout.current = setTimeout(() => {
      setIsManualScrolling(false);
    });
  };

  useEffect(() => {
    if (selectedUser) {
      previousMessageCountRef.current = 0;
      scrollToBottom(true);
    }
  }, [selectedUser]);

  const formatMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
  
    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
  
    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };  

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupMessagesByDate = (messages) => {
    return messages.reduce((groups, message) => {
      const date = formatMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(currentMessages);

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
            <div 
              className="messages-container" 
              ref={messagesContainerRef} 
              style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}
              onScroll={handleManualScroll}
            >
              {Object.keys(groupedMessages).map((date, index) => (
                <React.Fragment key={index}>
                  <div className="text-center text-muted my-3">
                    <small>{date}</small>
                  </div>
                  {groupedMessages[date].map((message) => (
                    <div
                      key={message.id}
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
                      <div><small className="text-muted">{formatMessageTime(message.timestamp)}</small></div>
                    </div>
                  ))}
                </React.Fragment>
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
          <Alert variant="info" className="m-3">Select a user to start chatting.</Alert>
        )}
      </div>
    </div>
  );
}

export default Messages;