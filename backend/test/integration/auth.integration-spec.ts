import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createIntegrationApp } from './helpers/test-app';
import { resetDatabase } from './helpers/test-db';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('Auth integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const testApp = await createIntegrationApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await app.close();
  });

  it('registers, logs in, and returns the authenticated user', async () => {
    const email = `auth-${Date.now()}@example.com`;
    const password = 'password123';

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, role: UserRole.ADMIN })
      .expect(201);

    expect(registerResponse.body).toMatchObject({
      email,
      role: UserRole.ADMIN,
    });
    expect(registerResponse.body).not.toHaveProperty('password');

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    expect(loginResponse.body.access_token).toEqual(expect.any(String));

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
      .expect(200);

    expect(meResponse.body).toMatchObject({
      email,
      role: UserRole.ADMIN,
    });
  });

  it('rejects duplicate registration', async () => {
    const payload = {
      email: 'duplicate@example.com',
      password: 'password123',
    };

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(409);

    expect(response.body.message).toBe('Email already exists');
  });
});
