const express = require('express');
const router = express.Router();
const db = require('../database/db'); 
// Endpoint untuk mendapatkan semua pengguna (username dan ID saja)
router.get('/users', (req, res) => {
    db.query('SELECT id, username FROM users', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({
            message: 'Users fetched successfully',
            data: results,
        });
    });
});

// Endpoint untuk mendapatkan pengguna berdasarkan ID
router.get('/users/:id', (req, res) => {
    const userId = req.params.id;

    db.query('SELECT id, username FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

module.exports = router;
