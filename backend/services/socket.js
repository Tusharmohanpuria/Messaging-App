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

    socket.on('sendMessage', (message) => {
      try {
        const recipientSocket = userSockets.get(message.recipient_email);
        if (recipientSocket) {
          recipientSocket.emit('message', message);
        }

        socket.emit('message', message);
      } catch (error) {
        console.error('Error broadcasting message:', error);
      }
    });

    socket.on('disconnect', async () => {
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
