import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('App Endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  describe('Products', () => {
    it('/api/products (POST & GET)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'Laptop', price: 999 })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(Number),
        name: 'Laptop',
        price: 999,
      });

      const listRes = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      expect(listRes.body).toHaveLength(1);
    });

    it('/api/products/:id (GET, PUT, DELETE)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'Mouse', price: 25 })
        .expect(201);

      const id = createRes.body.id;

      await request(app.getHttpServer())
        .get(`/api/products/${id}`)
        .expect(200);

      const updateRes = await request(app.getHttpServer())
        .put(`/api/products/${id}`)
        .send({ price: 30 })
        .expect(200);

      expect(updateRes.body.price).toBe(30);

      await request(app.getHttpServer())
        .delete(`/api/products/${id}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/products/${id}`)
        .expect(404);
    });
  });

  describe('Users', () => {
    it('/api/users (POST & GET)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' })
        .expect(201);

      expect(res.body.email).toBe('alice@example.com');

      const listRes = await request(app.getHttpServer())
        .get('/api/users')
        .expect(200);

      expect(listRes.body).toHaveLength(1);
    });
  });

  describe('Reviews', () => {
    it('/api/reviews (POST & GET)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/reviews')
        .send({ rating: 5, comment: 'Great!', productId: 1 })
        .expect(201);

      expect(res.body.rating).toBe(5);

      const listRes = await request(app.getHttpServer())
        .get('/api/reviews')
        .expect(200);

      expect(listRes.body).toHaveLength(1);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
