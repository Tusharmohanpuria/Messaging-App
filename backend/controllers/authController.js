const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

exports.register = async (req, res) => {
    const { name, email, phone, role, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, role, hashedPassword]
        );

        res.status(201).send('User Registered');
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) return res.status(400).send('Invalid Credentials');

        const validPass = await bcrypt.compare(password, user[0].password);
        if (!validPass) return res.status(400).send('Invalid Credentials');

        const token = jwt.sign({ id: user[0].id, role: user[0].role }, process.env.JWT_SECRET);
        res.header('Authorization', token).send({ token });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.logout = (req, res) => {
    res.send('User Logged Out');
};

