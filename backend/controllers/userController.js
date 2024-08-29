const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getUserById = async (req, res) => {
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (user.length === 0) return res.status(404).send('User Not Found');
        res.status(200).json(user[0]);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateUser = async (req, res) => {
    const { name, email, phone, role } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
            [name, email, phone, role, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).send('User Not Found');
        res.status(200).send('User Updated');
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).send('User Not Found');
        res.status(200).send('User Deleted');
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getCurrUser = async (req, res) => {
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (user.length === 0) return res.status(404).send('User Not Found');
        res.status(200).json(user[0]);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};



