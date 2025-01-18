const request = require('supertest');
const app = require('../app');
const db = require('../database/db');

afterAll(() => {
  db.end(); // Tutup koneksi database setelah semua test selesai
});

describe('Report API Endpoints', () => {
  describe('GET /report', () => {
    it('should retrieve all reports', async () => {
      const mockReports = [
        { id: 1, name: 'John Doe', address: '123 Street', phone: '1234567890', message: 'Hello!', created_at: '2025-01-01' },
        { id: 2, name: 'Jane Doe', address: '456 Avenue', phone: '0987654321', message: 'Hi!', created_at: '2025-01-02' },
      ];

      db.query = jest.fn((sql, callback) => {
        callback(null, mockReports);
      });

      const response = await request(app).get('/report');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Laporan Data'); // Memastikan halaman report dirender
      expect(response.text).toContain('John Doe');
      expect(response.text).toContain('Jane Doe');
    });

    it('should handle database errors gracefully', async () => {
      db.query = jest.fn((sql, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/report');
      expect(response.status).toBe(500);
      expect(response.text).toBe('Terjadi kesalahan saat mengambil data');
    });
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

  describe('PUT /api/contacts/:id', () => {
    it('should update a report successfully', async () => {
      const updatedReport = { name: 'Bob', address: '101 Main St', phone: '1231231234', message: 'Updated message' };

      db.query = jest.fn((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app).put('/api/contacts/1').send(updatedReport);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Contact updated successfully');
    });

    it('should return 404 if the report is not found', async () => {
      db.query = jest.fn((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const response = await request(app).put('/api/contacts/999').send({});
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Contact not found');
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete a report successfully', async () => {
      db.query = jest.fn((sql, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app).delete('/api/contacts/1');
      expect(response.status).toBe(204);
    });

    it('should return 404 if the report is not found', async () => {
      db.query = jest.fn((sql, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const response = await request(app).delete('/api/contacts/999');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Contact not found');
    });
  });
});
