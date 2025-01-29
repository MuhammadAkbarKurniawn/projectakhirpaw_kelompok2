const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const router = require('../routes/authRoutes'); // Adjust the path as necessary


// Create a mock express app and use the router
const app = express();
app.use(express.json()); // Middleware for parsing JSON bodies
app.use(router);

jest.mock('../database/db'); // Mock db module



describe('POST /login', () => {
    
    it('should return 400 if the user is not found', async () => {
        db.query.mockImplementationOnce((query, params, callback) => callback(null, []));

        const nonExistentUser = { username: 'nonexistentuser', password: 'password123' };

        const res = await request(app)
            .post('/login')
            .send(nonExistentUser);

        expect(res.status).toBe(400);
        expect(res.text).toBe('User not found');
    });

    it('should return 401 if the password is incorrect', async () => {
        const fakeUser = { id: 1, username: 'testuser', password: bcrypt.hashSync('password123', 10) };

        db.query.mockImplementationOnce((query, params, callback) => callback(null, [fakeUser]));

        const invalidPassword = { username: 'testuser', password: 'wrongpassword' };

        const res = await request(app)
            .post('/login')
            .send(invalidPassword);

        expect(res.status).toBe(401);
        expect(res.text).toBe('Incorrect password');
    });

    it('should return 500 if a database error occurs', async () => {
        db.query.mockImplementationOnce((query, params, callback) => {
            callback(new Error('Database error'), null);
        });

        const validCredentials = { username: 'testuser', password: 'password123' };

        const res = await request(app)
            .post('/login')
            .send(validCredentials);

        expect(res.status).toBe(500);
        expect(res.text).toBe('Error fetching user');
    });

    it('should return 500 if bcrypt comparison fails', async () => {
        const fakeUser = { id: 1, username: 'testuser', password: bcrypt.hashSync('password123', 10) };

        db.query.mockImplementationOnce((query, params, callback) => callback(null, [fakeUser]));

        jest.spyOn(bcrypt, 'compare').mockImplementationOnce((_, __, callback) => callback(new Error('Bcrypt error'), null));

        const validCredentials = { username: 'testuser', password: 'password123' };

        const res = await request(app)
            .post('/login')
            .send(validCredentials);

        expect(res.status).toBe(500);
        expect(res.text).toBe('Error checking password');
    });
});