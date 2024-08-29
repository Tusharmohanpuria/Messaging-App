const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');
const router = express.Router();

router.post('/register', rateLimitMiddleware, register);
router.post('/login', rateLimitMiddleware, login);
router.post('/logout', logout);

module.exports = router;

