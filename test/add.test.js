const request = require('supertest');
const express = require('express');
const productRoutes = require('../routes/produkdb'); // Sesuaikan dengan lokasi file router Anda
const db = require('../database/db'); // Mock database connection

// Mock database query
jest.mock('../database/db', () => ({
    query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Membersihkan mock setelah setiap test
    });

    describe('GET /products', () => {
        it('should return all products', async () => {
            const mockProducts = [
                { id_produk: 1, nama_produk: 'Product 1', deskripsi: 'Description 1', harga: 100, image_url: '/uploads/image1.jpg' },
                { id_produk: 2, nama_produk: 'Product 2', deskripsi: 'Description 2', harga: 200, image_url: '/uploads/image2.jpg' },
            ];
            db.query.mockImplementation((query, callback) => callback(null, mockProducts));

            const response = await request(app).get('/products');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProducts);
        });

        it('should return 500 on database error', async () => {
            db.query.mockImplementation((query, callback) => callback(new Error('Database error'), null));

            const response = await request(app).get('/products');
            expect(response.status).toBe(500);
            expect(response.text).toBe('Internal Server Error');
        });
    });

    describe('GET /products/:id_produk', () => {
        // it('should return a product by ID', async () => {
        //     const mockProduct = { id_produk: 1, nama_produk: 'Product 1', deskripsi: 'Description 1', harga: 100, image_url: '/uploads/image1.jpg' };
        //     db.query.mockImplementation((query, values, callback) => {
        //         if (values[0] === 1) callback(null, [mockProduct]);
        //         else callback(null, []);
        //     });

        //     const response = await request(app).get('/products/1');
        //     expect(response.status).toBe(200);
        //     expect(response.body).toEqual(mockProduct);
        // });

        it('should return 404 if product is not found', async () => {
            db.query.mockImplementation((query, values, callback) => callback(null, []));

            const response = await request(app).get('/products/999');
            expect(response.status).toBe(404);
            expect(response.text).toBe('Product not found');
        });

        it('should return 500 on database error', async () => {
            db.query.mockImplementation((query, values, callback) => callback(new Error('Database error'), null));

            const response = await request(app).get('/products/1');
            expect(response.status).toBe(500);
            expect(response.text).toBe('Internal Server Error');
        });
    });
});