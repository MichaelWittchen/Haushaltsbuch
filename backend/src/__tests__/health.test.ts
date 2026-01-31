import request from 'supertest';
import app from '../app';

describe('Health Endpoint', () => {
  describe('GET /api/health', () => {
    it('should return OK status', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('message', 'Server läuft');
    });

    it('should return JSON content type', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
