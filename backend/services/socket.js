const { Server } = require('socket.io');
const pool = require('../config/db');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  const userSockets = new Map();

  io.on('connection', async (socket) => {
    const userEmail = socket.handshake.query.email;

    if (userEmail) {
      userSockets.set(userEmail, socket);

      try {
        await pool.query('UPDATE users SET status = ? WHERE email = ?', ['Online', userEmail]);

        const [onlineUsers] = await pool.query('SELECT email FROM users WHERE status = ?', ['Online']);
        io.emit('onlineUsers', onlineUsers.map(user => user.email));
      } catch (error) {
        console.error('Error updating user status to Online:', error);
      }
    }

    socket.on('sendMessage', async (message) => {
      try {
        const [newMessage] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
        
        const recipientSocket = userSockets.get(message.recipient_email);
        if (recipientSocket) {
          recipientSocket.emit('message', newMessage[0]);
        }
        socket.emit('message', newMessage[0]);
      } catch (error) {
        console.error('Error saving and broadcasting message:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected');

      if (userEmail) {
        userSockets.delete(userEmail);

        try {
          await pool.query('UPDATE users SET status = ? WHERE email = ?', ['Offline', userEmail]);
          
          const [onlineUsers] = await pool.query('SELECT email FROM users WHERE status = ?', ['Online']);
          io.emit('onlineUsers', onlineUsers.map(user => user.email));
        } catch (error) {
          console.error('Error updating user status to Offline:', error);
        }
      }
    });
  });

  return io;
};

module.exports = initializeSocket;