const pool = require('../config/db');

exports.sendMessage = async (req, res) => {
    const { recipient_id, content } = req.body;
    try {
        console.log('message opt');
        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)',
            [req.user.id, recipient_id, content]
        );
        res.status(201).send('Message Sent');
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getMessagesByUser = async (req, res) => {
    try {
        console.log('message opt');
        const [messages] = await pool.query(
            'SELECT * FROM messages WHERE recipient_id = ? OR sender_id = ?',
            [req.user.id, req.user.id]
        );
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
