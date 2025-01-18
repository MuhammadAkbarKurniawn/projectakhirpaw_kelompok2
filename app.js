const express = require('express');
const app = express();
const produkRoutes = require('./routes/produkdb.js');
const contactRoutes = require('./routes/contact.js'); 
require('dotenv').config();
const port = process.env.PORT;
const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');
const userRoutes = require('./routes/users');
const produkDetailRoutes = require('./routes/detailproduk.js');



app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.json());
app.use('/uploads', express.static('uploads'));


app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


app.use('/', authRoutes);

app.use('/api', userRoutes);

app.use('/api', contactRoutes);

app.use('/produk', produkRoutes); 

app.use('/produk', produkDetailRoutes);

app.set('view engine', 'ejs');




app.get('/',isAuthenticated, (req, res) => {
    db.query('SELECT * FROM produk', (err, produk) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('user', {
            layout: 'layouts/user-main-layout',
            produk: produk
        });
    });
});
app.get('/tentang-view', (req, res) => {
    res.render('about', {
        layout: 'layouts/main-layout'
    }); 
});
  
app.get('/index', isAuthenticated, (req, res) => {
    res.render('index', {
        layout: 'layouts/main-layout'
    });
});
app.get('/produk-view', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM produk', (err, produk) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('produk', {
            layout: 'layouts/main-layout',
            produk: produk
        });
    });
});

// Rute untuk user.ejs
app.get('/user-view', (req, res) => {
    db.query('SELECT * FROM produk', (err, produk) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('user', {
            layout: 'layouts/user-main-layout',
            produk: produk
        });
    });
});

// route report
app.get('/report', (req, res) => {
    db.query('SELECT * FROM contact', (err, reports) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Terjadi kesalahan saat mengambil data');
        }
        res.render('report', {
            layout: 'layouts/main-layout',
             reports: reports });
    });
});
// Export the app for testing
module.exports = app;

// Start the server only if this file is run directly
// if (require.main === module) {
//   const port = process.env.PORT || 3002;
//   app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}/`);
//   });
// }
app.post('/api/contact', (req, res) => {
    const { name, address, phone, message } = req.body;
    if (!name || !address || !phone || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Masukkan data ke dalam database (sesuaikan dengan model atau query Anda)
    const sql = 'INSERT INTO contact (name, address, phone, message) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, address, phone, message], (err, result) => {
        if (err) {
            console.error('Error saving contact message:', err);
            return res.status(500).json({ error: 'Failed to save message' });
        }
        res.status(200).json({ message: 'Message saved successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
