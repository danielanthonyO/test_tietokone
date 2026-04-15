import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EstimateStatus, RepairStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { EstimatesService } from './estimates.service';

describe('EstimatesService', () => {
  let service: EstimatesService;

  const prismaMock = {
    repairTicket: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    costEstimate: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    ticketHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const emailServiceMock = {
    sendEstimateEmail: jest.fn(),
    sendEstimateDecisionEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.FRONTEND_BASE_URL = 'http://localhost:5173';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstimatesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<EstimatesService>(EstimatesService);
  });

  it('creates an estimate and sends an email when the customer has an email address', async () => {
    const ticket = {
      id: 1,
      estimate: null,
      customer: { email: 'customer@example.com', name: 'Jane Customer' },
    };

    const createdEstimate = {
      id: 10,
      ticketId: 1,
      totalCost: 188.25,
      status: EstimateStatus.PENDING,
    };

    prismaMock.repairTicket.findUnique.mockResolvedValue(ticket);
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback({
        costEstimate: { create: jest.fn().mockResolvedValue(createdEstimate) },
        repairTicket: { update: jest.fn() },
        ticketHistory: { create: jest.fn() },
      }),
    );

    const result = await service.create({
      ticketId: 1,
      laborCost: 100,
      partsCost: 50,
      note: 'Replace screen',
    });

    expect(prismaMock.repairTicket.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { estimate: true, customer: true },
    });
    expect(emailServiceMock.sendEstimateEmail).toHaveBeenCalled();
    expect(result.message).toBe('Estimate created successfully');
    expect(result.estimate).toEqual(createdEstimate);
    expect(result.estimate.totalCost).toBe(188.25);
  });

  it('throws when an estimate already exists for the ticket', async () => {
    prismaMock.repairTicket.findUnique.mockResolvedValue({
      id: 1,
      estimate: { id: 5 },
      customer: { email: 'customer@example.com', name: 'Jane Customer' },
    });

    await expect(
      service.create({ ticketId: 1, laborCost: 10, partsCost: 5 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('approves a pending estimate and advances the repair ticket', async () => {
    const estimate = {
      id: 10,
      ticketId: 1,
      status: EstimateStatus.PENDING,
      expiresAt: new Date(Date.now() + 60_000),
      ticket: {
        customer: {
          email: 'customer@example.com',
          name: 'Jane Customer',
        },
      },
    };

    prismaMock.costEstimate.findUnique.mockResolvedValue(estimate);
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback({
        costEstimate: { update: jest.fn().mockResolvedValue({ id: 10, status: EstimateStatus.APPROVED }) },
        repairTicket: { update: jest.fn() },
        ticketHistory: { create: jest.fn() },
      }),
    );

    const result = await service.approve('approval-token');

    expect(prismaMock.costEstimate.findUnique).toHaveBeenCalled();
    expect(emailServiceMock.sendEstimateDecisionEmail).toHaveBeenCalledWith({
      customerEmail: 'customer@example.com',
      customerName: 'Jane Customer',
      decision: 'APPROVED',
    });
    expect(result.message).toBe('Estimate approved successfully');
  });

  it('rejects expired approval tokens', async () => {
    prismaMock.costEstimate.findUnique.mockResolvedValue({
      id: 10,
      ticketId: 1,
      status: EstimateStatus.PENDING,
      expiresAt: new Date(Date.now() - 60_000),
      ticket: { customer: { email: null, name: 'Jane Customer' } },
    });
    prismaMock.costEstimate.update.mockResolvedValue({});

    await expect(service.reject('expired-token')).rejects.toThrow(BadRequestException);
    expect(prismaMock.costEstimate.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { status: 'EXPIRED', approvalToken: null },
    });
  });

  it('expires pending estimates in bulk', async () => {
    prismaMock.costEstimate.updateMany.mockResolvedValue({ count: 3 });

    const result = await service.expirePendingEstimates();

    expect(prismaMock.costEstimate.updateMany).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Expired pending estimates updated successfully',
      count: 3,
    });
  });

  it('returns the ticket with estimate data when finding by ticket id', async () => {
    const ticket = {
      id: 1,
      status: RepairStatus.WAITING_APPROVAL,
      estimate: { id: 99 },
      customer: { id: 1 },
      device: { id: 2 },
      history: [],
    };

    prismaMock.repairTicket.findUnique.mockResolvedValue(ticket);

    await expect(service.findByTicket(1)).resolves.toEqual(ticket);
    expect(prismaMock.repairTicket.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { estimate: true, customer: true, device: true, history: true },
    });
  });

  it('throws when a ticket cannot be found by ticket id', async () => {
    prismaMock.repairTicket.findUnique.mockResolvedValue(null);

    await expect(service.findByTicket(1)).rejects.toThrow(NotFoundException);
  });
});
