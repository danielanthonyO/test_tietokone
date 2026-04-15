import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { RepairStatus } from '@prisma/client';
import { createIntegrationApp } from './helpers/test-app';
import { resetDatabase } from './helpers/test-db';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createCustomer, createDevice } from './helpers/factories';

describe('Orders integration', () => {
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

  it('creates an order and records status history', async () => {
    const customer = await createCustomer(prisma);
    const device = await createDevice(prisma, customer.id);

    const createResponse = await request(app.getHttpServer())
      .post('/orders')
      .send({
        customerId: customer.id,
        deviceId: device.id,
        problemDescription: 'Phone does not boot',
      })
      .expect(201);

    expect(createResponse.body.repairCode).toMatch(/^TIC-/);
    expect(createResponse.body.status).toBe(RepairStatus.RECEIVED);
    expect(createResponse.body.history).toHaveLength(1);

    const ticketId = createResponse.body.id;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/orders/${ticketId}/status`)
      .send({ status: RepairStatus.DIAGNOSTICS, note: 'Running diagnostics' })
      .expect(200);

    expect(updateResponse.body.status).toBe(RepairStatus.DIAGNOSTICS);
    expect(updateResponse.body.history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: RepairStatus.RECEIVED }),
        expect.objectContaining({ status: RepairStatus.DIAGNOSTICS, note: 'Running diagnostics' }),
      ]),
    );
  });

  it('rejects order creation when the device does not belong to the customer', async () => {
    const customer = await createCustomer(prisma, { email: 'first@example.com' });
    const otherCustomer = await createCustomer(prisma, { email: 'second@example.com' });
    const device = await createDevice(prisma, otherCustomer.id);

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send({
        customerId: customer.id,
        deviceId: device.id,
        problemDescription: 'Speaker issue',
      })
      .expect(404);

    expect(response.body.message).toBe('Device not found for this customer');
  });
});
