const express = require('express');
const cors = require('cors');
const http = require('http');
const initializeSocket = require('./services/socket');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);

const io = initializeSocket(server);

server.listen(5000, () => {
    console.log('Server running on port 5000');
});
