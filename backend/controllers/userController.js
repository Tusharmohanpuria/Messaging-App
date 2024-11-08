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
    const userId = req.params.id;
    try {
        await pool.query('DELETE FROM messages WHERE sender_id = ?', [userId]);
        await pool.query('DELETE FROM messages WHERE recipient_id = ?', [userId]);

        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) return res.status(404).send('User Not Found');
        res.status(200).send('User and related messages deleted');
    } catch (err) {
        console.error('Error in deleteUser:', err);
        res.status(500).send('Server Error');
    }
};
