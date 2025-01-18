const request = require('supertest');
const app = require('../app');
const db = require('../database/db');

afterAll(() => {
  db.end(); // Close the database connection
});

describe('DELETE /produk/:id_produk', () => {
  it('should delete a product successfully', async () => {
    const mockId = 1;

    // Mock the database query
    db.query = jest.fn((sql, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const response = await request(app).delete(`/produk/${mockId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 if product is not found', async () => {
    const mockId = 999;

    db.query = jest.fn((sql, params, callback) => {
      callback(null, { affectedRows: 0 });
    });

    const response = await request(app).delete(`/produk/${mockId}`);
    expect(response.status).toBe(404);
    expect(response.text).toBe('Product not found');
  });

  it('should handle database errors', async () => {
    const mockId = 1;

    db.query = jest.fn((sql, params, callback) => {
      callback(new Error('Database error'), null);
    });

    const response = await request(app).delete(`/produk/${mockId}`);
    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });
});
