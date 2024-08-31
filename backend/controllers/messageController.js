const pool = require('../config/db');

exports.getMessagesByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const [messages] = await pool.query(
            'SELECT * FROM messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY timestamp ASC',
            [req.user.id, userId, userId, req.user.id]
        );
        res.status(200).json(messages);
    } catch (err) {
        console.error('Error in getMessagesByUser:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
  const { recipient_id, content } = req.body;
  try {
      const [sender] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
      const [recipient] = await pool.query('SELECT * FROM users WHERE id = ?', [recipient_id]);

      if (sender.length === 0) return res.status(400).json({ message: 'Sender not found' });
      if (recipient.length === 0) return res.status(400).json({ message: 'Recipient not found' });

      const [result] = await pool.query(
          'INSERT INTO messages (sender_id, recipient_id, content, timestamp) VALUES (?, ?, ?, ?)',
          [req.user.id, recipient_id, content, new Date()]
      );

      const [newMessage] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);

      res.status(201).json(newMessage[0]);
  } catch (err) {
      console.error('Error in sendMessage:', err);
      res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

