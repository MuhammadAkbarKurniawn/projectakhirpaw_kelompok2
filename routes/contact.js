const express = require('express');
const router = express.Router();
const db = require('../database/db'); 

// Endpoint untuk mendapatkan semua kontak
router.get('/contacts', (req, res) => {
    db.query('SELECT * FROM contact', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({
            message: 'Contacts fetched successfully',
            data: results,
        });
    });
});

// Endpoint untuk mendapatkan kontak berdasarkan ID
router.get('/contacts/:id', (req, res) => {
    const contactId = req.params.id;

    db.query('SELECT * FROM contact WHERE id = ?', [contactId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json(results[0]);  // Mengirimkan data kontak yang ditemukan
    });
});

// Endpoint untuk menambahkan kontak baru
router.post('/contacts', (req, res) => {
    const { name, address, phone, message } = req.body;

    db.query(
        'INSERT INTO contact (name, address, phone, message) VALUES (?, ?, ?, ?)', 
        [name, address, phone, message],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(201).json({
                message: 'Contact created successfully',
                data: {
                    id: results.insertId,
                    name,
                    address,
                    phone,
                    message
                },
            });
        }
    );
});

// Endpoint untuk mengedit data kontak berdasarkan ID
router.put('/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    const { name, address, phone, message } = req.body;

    db.query(
        'UPDATE contact SET name = ?, address = ?, phone = ?, message = ? WHERE id = ?', 
        [name, address, phone, message, contactId],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Contact not found' });
            }
            res.json({
                message: 'Contact updated successfully',
                data: { id: contactId, name, address, phone, message }
            });
        }
    );
});

// Endpoint untuk menghapus kontak berdasarkan ID
router.delete('/contacts/:id', async (req, res) => {
    const contactId = req.params.id;

    try {
        const [results] = await db.promise().query('DELETE FROM contact WHERE id = ?', [contactId]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




module.exports = router;
