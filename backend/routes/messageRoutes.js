const express = require('express');
const { sendMessage, getMessagesByUser } = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, sendMessage);
router.get('/:userId', authMiddleware, getMessagesByUser);

module.exports = router;