const request = require('supertest');
const path = require('path');
const app = require('../app');
const db = require('../database/db');

afterAll(() => {
  db.end(); // Close the database connection
});

describe('PUT /produk', () => {
//   it('should add a new product successfully with an image', async () => {
//     const mockProduct = {
//       nama_produk: 'Produk Baru',
//       deskripsi: 'Deskripsi produk baru',
//       harga: '100000',
//     };

//     // Mock database query for successful insertion
//     db.query = jest.fn((sql, params, callback) => {
//       callback(null, { insertId: 1 });
//     });

//     const response = await request(app)
//       .post('/produk')
//       .field('nama_produk', mockProduct.nama_produk)
//       .field('deskripsi', mockProduct.deskripsi)
//       .field('harga', mockProduct.harga)
//       .attach('image', path.join(__dirname, 'test_image.jpeg')); // Attach a test image

//     expect(response.status).toBe(201);
//     expect(response.body).toEqual({
//       id_produk: 1,
//       nama_produk: mockProduct.nama_produk,
//       deskripsi: mockProduct.deskripsi,
//       harga: mockProduct.harga,
//       image_url: expect.stringMatching(/^\/uploads\/\d+\..+$/), // URL pattern check
//     });
//   });

  it('should add a new product successfully without an image', async () => {
    const mockProduct = {
      nama_produk: 'Produk Tanpa Gambar',
      deskripsi: 'Deskripsi produk tanpa gambar',
      harga: '50000',
    };

    // Mock database query for successful insertion
    db.query = jest.fn((sql, params, callback) => {
      callback(null, { insertId: 2 });
    });

    const response = await request(app)
      .post('/produk')
      .field('nama_produk', mockProduct.nama_produk)
      .field('deskripsi', mockProduct.deskripsi)
      .field('harga', mockProduct.harga);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id_produk: 2,
      nama_produk: mockProduct.nama_produk,
      deskripsi: mockProduct.deskripsi,
      harga: mockProduct.harga,
      image_url: null,
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const mockProduct = { harga: '100000' }; // Missing nama_produk and deskripsi

    const response = await request(app)
      .post('/produk')
      .field('harga', mockProduct.harga);

    expect(response.status).toBe(400);
    expect(response.text).toBe('All fields are required.');
  });

  it('should handle database errors', async () => {
    const mockProduct = {
      nama_produk: 'Produk Error',
      deskripsi: 'Deskripsi produk error',
      harga: '30000',
    };

    // Mock database query to simulate an error
    db.query = jest.fn((sql, params, callback) => {
      callback(new Error('Database error'), null);
    });

    const response = await request(app)
      .post('/produk')
      .field('nama_produk', mockProduct.nama_produk)
      .field('deskripsi', mockProduct.deskripsi)
      .field('harga', mockProduct.harga);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });
});