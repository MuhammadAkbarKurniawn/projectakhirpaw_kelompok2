const request = require('supertest');
const app = require('../app');
const db = require('../database/db');

afterAll(() => {
  db.end(); // Tutup koneksi database setelah semua test selesai
});

describe('POST /api/contact', () => {
  it('should create a new report', async () => {
    const newReport = { name: 'Alice', address: '789 Road', phone: '1112223333', message: 'Test message' };

    db.query = jest.fn((sql, params, callback) => {
      callback(null, { insertId: 1 });
    });

    const response = await request(app).post('/api/contact').send(newReport);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Message saved successfully');
  });

  it('should return an error if fields are missing', async () => {
    const newReport = { name: 'Alice', address: '', phone: '', message: '' };

    const response = await request(app).post('/api/contact').send(newReport);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('All fields are required');
  });

  it('should handle database errors', async () => {
    const newReport = { name: 'Alice', address: '789 Road', phone: '1112223333', message: 'Test message' };

    db.query = jest.fn((sql, params, callback) => {
      callback(new Error('Database error'), null);
    });

    const response = await request(app).post('/api/contact').send(newReport);
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to save message');
  });
});