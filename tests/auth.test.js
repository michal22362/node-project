// const { test, expect, describe } = require('@jest/globals');
// const request = require('supertest');
// const app = require('../app');

// describe('Auth API', () => {
//     // בדיקה לרישום משתמש חדש
//     test('should register a new user', async () => {
//         // שליחת בקשת POST לרישום משתמש חדש
//         const res = await request(app)
//             .post('/users/signup')
//             .send({ username: 'mytestuser', password: '123', email: 'testuser@example.com', role: 'user' });

//         // ציפיה לקבלת סטטוס 201
//         expect(res.status).toBe(201);
//         // ציפיה להחזרת הודעת הצלחה
//         expect(res.body).toHaveProperty('message', 'User created');
//     });

//     // בדיקה להתחברות משתמש קיים
//     test('should login an existing user', async () => {
//         const res = await request(app)
//             .post('/users/signin')
//             .send({ username: 'mytestuser', password: '123' });

//         expect(res.status).toBe(200);
//         expect(res.body).toHaveProperty('token');
//     });

//     // בדיקה למקרה של התחברות עם פרטים לא תקינים
//     test('should not login with invalid credentials', async () => {
//         const res = await request(app)
//             .post('/users/signin')
//             .send({ username: 'mytestuser', password: 'wrongpassword' });

//         expect(res.status).toBe(401);
//         expect(res.body).toHaveProperty('message', 'Invalid credentials');
//     });
// });


const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const sinonMongoose = require('sinon-mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/usersModel');
const { createUser, getUsers, authenticateUser, generateToken } = require('../path/to/your/code');

describe('User Service', () => {

    describe('createUser', () => {
        it('should create a new user', async () => {
            const data = { username: 'test', password: 'test123' };
            const mockUser = new user(data);
            sinon.stub(mockUser, 'save').resolves(mockUser);

            const result = await createUser(data);
            expect(result).to.eql(mockUser);
        });
    });

    describe('getUsers', () => {
        it('should return all users', async () => {
            const mockUsers = [{ username: 'user1' }, { username: 'user2' }];
            sinon.stub(user, 'find').resolves(mockUsers);

            const result = await getUsers();
            expect(result).to.eql(mockUsers);
        });
    });

    describe('authenticateUser', () => {
        it('should authenticate a user with valid credentials', async () => {
            const username = 'test';
            const password = 'test123';
            const hashedPassword = await bcrypt.hash(password, 10);
            const mockUser = { username, password: hashedPassword };
            
            sinon.stub(user, 'findOne').resolves(mockUser);
            sinon.stub(bcrypt, 'compare').resolves(true);

            const result = await authenticateUser(username, password);
            expect(result).to.eql(mockUser);
        });

        it('should throw an error for invalid username', async () => {
            sinon.stub(user, 'findOne').resolves(null);

            try {
                await authenticateUser('invalidUser', 'test123');
            } catch (err) {
                expect(err.message).to.equal('Invalid username or password');
            }
        });

        it('should throw an error for invalid password', async () => {
            const username = 'test';
            const password = 'test123';
            const hashedPassword = await bcrypt.hash('wrongPassword', 10);
            const mockUser = { username, password: hashedPassword };

            sinon.stub(user, 'findOne').resolves(mockUser);
            sinon.stub(bcrypt, 'compare').resolves(false);

            try {
                await authenticateUser(username, password);
            } catch (err) {
                expect(err.message).to.equal('Invalid username or password');
            }
        });
    });

    describe('generateToken', () => {
        it('should generate a JWT token', () => {
            const mockUser = { _id: '123', username: 'test' };
            const token = generateToken(mockUser);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded).to.include({ id: '123', username: 'test' });
        });
    });

    afterEach(() => {
        sinon.restore();
    });
});
