import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { EstimateStatus, RepairStatus, UserRole } from '@prisma/client';
import { createIntegrationApp } from './helpers/test-app';
import { resetDatabase } from './helpers/test-db';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createCustomer, createDevice, createRepairTicket } from './helpers/factories';
import { registerAndLogin } from './helpers/auth';

describe('Estimates integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.FRONTEND_BASE_URL = 'http://localhost:5173';
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

  it('creates and approves an estimate for a ticket', async () => {
    const { token } = await registerAndLogin(app, `admin-${Date.now()}@example.com`, UserRole.ADMIN);
    const customer = await createCustomer(prisma);
    const device = await createDevice(prisma, customer.id);
    const ticket = await createRepairTicket(prisma, customer.id, device.id);

    const createResponse = await request(app.getHttpServer())
      .post('/estimates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ticketId: ticket.id,
        laborCost: 100,
        partsCost: 50,
        note: 'Replace display assembly',
      })
      .expect(201);

    expect(createResponse.body.message).toBe('Estimate created successfully');
    expect(createResponse.body.estimate.totalCost).toBe(188.25);

    const approvalToken = createResponse.body.approvalToken as string;

    const approveResponse = await request(app.getHttpServer())
      .patch(`/estimates/${approvalToken}/approve`)
      .expect(200);

    expect(approveResponse.body.message).toBe('Estimate approved successfully');
    expect(approveResponse.body.estimate.status).toBe(EstimateStatus.APPROVED);

    const persistedTicket = await prisma.repairTicket.findUnique({ where: { id: ticket.id } });
    expect(persistedTicket?.status).toBe(RepairStatus.IN_REPAIR);
  });

  it('returns estimates by ticket and expires pending estimates for admins', async () => {
    const { token } = await registerAndLogin(app, `admin-two-${Date.now()}@example.com`, UserRole.ADMIN);
    const customer = await createCustomer(prisma);
    const device = await createDevice(prisma, customer.id);
    const ticket = await createRepairTicket(prisma, customer.id, device.id);

    const estimate = await prisma.costEstimate.create({
      data: {
        estimateCode: `EST-${Date.now()}`,
        ticketId: ticket.id,
        laborCost: 10,
        partsCost: 5,
        subtotal: 15,
        vatRate: 0.255,
        vatAmount: 3.83,
        totalCost: 18.83,
        status: EstimateStatus.PENDING,
        approvalToken: `token-${Date.now()}`,
        expiresAt: new Date(Date.now() - 60_000),
        currency: 'EUR',
      },
    });

    const byTicketResponse = await request(app.getHttpServer())
      .get(`/estimates/ticket/${ticket.id}`)
      .expect(200);

    expect(byTicketResponse.body.id).toBe(ticket.id);
    expect(byTicketResponse.body.estimate.id).toBe(estimate.id);

    const expireResponse = await request(app.getHttpServer())
      .patch('/estimates/expire-pending')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(expireResponse.body.message).toMatch(/expired/i);

    const expiredEstimate = await prisma.costEstimate.findUnique({ where: { id: estimate.id } });
    expect(expiredEstimate?.status).toBe(EstimateStatus.EXPIRED);
  });
});
