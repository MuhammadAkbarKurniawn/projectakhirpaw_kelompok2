const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Rute untuk mendapatkan detail produk berdasarkan ID
router.get('/:id', (req, res) => {
    const productId = req.params.id;

    // Validate if the productId is a valid number
    if (isNaN(productId)) {
        return res.status(400).send('Invalid product ID');
    }

    db.query('SELECT * FROM produk WHERE id = ?', [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(404).send('Product not found');
        }

        // Render the detail page
        res.render('produk-detail', { produk: results[0] });
    });
});


module.exports = router;
