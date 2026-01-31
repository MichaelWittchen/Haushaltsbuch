import request from 'supertest';
import app from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';

describe('User Endpoints', () => {
  let userToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret123';
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create user and get token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
      });
    userToken = userRes.body.token;
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', 'user@example.com');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Nicht autorisiert, kein Token');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Nicht autorisiert, Token ungültig');
    });

    it('should fail with malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'InvalidFormat token123');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Nicht autorisiert, kein Token');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user name', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Name');
      expect(res.body).toHaveProperty('email', 'user@example.com');
    });

    it('should update user email', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'newemail@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', 'newemail@example.com');
    });

    it('should update user password', async () => {
      // Update password
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'newpassword123',
        });

      // Login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'newpassword123',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
    });

    it('should update multiple fields', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Name',
          email: 'newemail@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'New Name');
      expect(res.body).toHaveProperty('email', 'newemail@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({
          name: 'Updated Name',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/users/profile', () => {
    it('should delete own account', async () => {
      const res = await request(app)
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');

      // Verify user can no longer access profile
      const profileRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(profileRes.status).toBe(401);
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .delete('/api/users/profile');

      expect(res.status).toBe(401);
    });
  });
});
