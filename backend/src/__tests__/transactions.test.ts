import request from 'supertest';
import app from '../app';
import Transaction from '../models/Transaction';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';

describe('Transaction Endpoints', () => {
  let userToken: string;
  let userId: string;
  let otherUserToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret123';
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create first user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    userToken = userRes.body.token;
    userId = userRes.body._id;

    // Create second user for isolation tests
    const otherUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
      });
    otherUserToken = otherUserRes.body.token;
  });

  describe('POST /api/transactions', () => {
    it('should create an income transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'income',
          amount: 1000,
          category: 'Gehalt',
          description: 'Monatsgehalt',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('type', 'income');
      expect(res.body).toHaveProperty('amount', 1000);
      expect(res.body).toHaveProperty('category', 'Gehalt');
      expect(res.body).toHaveProperty('description', 'Monatsgehalt');
      expect(res.body).toHaveProperty('user', userId);
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should create an expense transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'expense',
          amount: 50.5,
          category: 'Lebensmittel',
          description: 'Wocheneinkauf',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('type', 'expense');
      expect(res.body).toHaveProperty('amount', 50.5);
      expect(res.body).toHaveProperty('category', 'Lebensmittel');
    });

    it('should create transaction without description', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'income',
          amount: 100,
          category: 'Sonstiges',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('description', '');
    });

    it('should fail with invalid type', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'invalid',
          amount: 100,
          category: 'Test',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with negative amount', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'income',
          amount: -100,
          category: 'Test',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with zero amount', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'income',
          amount: 0,
          category: 'Test',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with missing type', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 100,
          category: 'Test',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with missing amount', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'income',
          category: 'Test',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with missing category', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'income',
          amount: 100,
        });

      expect(res.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          type: 'income',
          amount: 100,
          category: 'Test',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      // Create some transactions for the user
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'income',
          amount: 1000,
          category: 'Gehalt',
        });

      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'expense',
          amount: 50,
          category: 'Lebensmittel',
        });

      // Create transaction for other user
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          type: 'income',
          amount: 500,
          category: 'Bonus',
        });
    });

    it('should get all transactions for authenticated user', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should only get own transactions (not other users)', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('category', 'Bonus');
    });

    it('should return transactions sorted by createdAt descending', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      // Latest transaction should come first (expense: Lebensmittel)
      expect(res.body[0].category).toBe('Lebensmittel');
      expect(res.body[1].category).toBe('Gehalt');
    });

    it('should return empty array for user with no transactions', async () => {
      // Create new user
      const newUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${newUserRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/transactions');

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let transactionId: string;

    beforeEach(async () => {
      // Create a transaction
      const createRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'expense',
          amount: 100,
          category: 'Test',
        });
      transactionId = createRes.body._id;
    });

    it('should delete own transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Transaktion gelöscht');

      // Verify transaction is deleted
      const getRes = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.body.length).toBe(0);
    });

    it('should fail to delete other users transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Nicht autorisiert');
    });

    it('should fail with non-existent transaction id', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Transaktion nicht gefunden');
    });

    it('should fail with invalid transaction id format', async () => {
      const res = await request(app)
        .delete('/api/transactions/invalidid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(500);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`);

      expect(res.status).toBe(401);
    });
  });
});
