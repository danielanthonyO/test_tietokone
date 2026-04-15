import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createIntegrationApp } from './helpers/test-app';
import { resetDatabase } from './helpers/test-db';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Customers integration', () => {
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

  it('creates, lists, updates, and deletes a customer', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/customers')
      .send({
        type: 'INDIVIDUAL',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1234567',
      })
      .expect(201);

    expect(createResponse.body.customerCode).toMatch(/^CUS-/);
    const customerId = createResponse.body.id;

    const listResponse = await request(app.getHttpServer()).get('/customers').expect(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({ id: customerId, name: 'Jane Doe' });

    const updateResponse = await request(app.getHttpServer())
      .patch(`/customers/${customerId}`)
      .send({ phone: '7654321' })
      .expect(200);

    expect(updateResponse.body.phone).toBe('7654321');

    await request(app.getHttpServer()).delete(`/customers/${customerId}`).expect(200);

    await request(app.getHttpServer()).get(`/customers/${customerId}`).expect(404);
  });

  it('validates the payload on create', async () => {
    const response = await request(app.getHttpServer())
      .post('/customers')
      .send({ type: 'INVALID', name: 'A' })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/type must be one of the following values/i),
        expect.stringMatching(/name must be longer than or equal to 2 characters/i),
      ]),
    );
  });
});
