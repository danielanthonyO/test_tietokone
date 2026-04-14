import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RepairStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RepairTicketsService } from './repair-tickets.service';

describe('RepairTicketsService', () => {
  let service: RepairTicketsService;

  const prismaMock = {
    customer: {
      findUnique: jest.fn(),
    },
    device: {
      findFirst: jest.fn(),
    },
    repairTicket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairTicketsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RepairTicketsService>(RepairTicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a repair ticket when customer and device are valid', async () => {
      const dto = {
        customerId: 1,
        deviceId: 2,
        problemDescription: 'Screen is broken',
      };

      const createdTicket = {
        id: 1,
        repairCode: 'TIC-123456',
        customerId: 1,
        deviceId: 2,
        problemDescription: 'Screen is broken',
        status: RepairStatus.RECEIVED,
      };

      prismaMock.customer.findUnique.mockResolvedValue({ id: 1 });
      prismaMock.device.findFirst.mockResolvedValue({ id: 2, customerId: 1 });
      prismaMock.repairTicket.create.mockResolvedValue(createdTicket);

      const result = await service.create(dto as any);

      expect(prismaMock.customer.findUnique).toHaveBeenCalledWith({
        where: { id: dto.customerId },
      });

      expect(prismaMock.device.findFirst).toHaveBeenCalledWith({
        where: { id: dto.deviceId, customerId: dto.customerId },
      });

      expect(prismaMock.repairTicket.create).toHaveBeenCalledWith({
        data: {
          repairCode: expect.any(String),
          customerId: dto.customerId,
          deviceId: dto.deviceId,
          problemDescription: dto.problemDescription,
          status: RepairStatus.RECEIVED,
          history: {
            create: {
              status: RepairStatus.RECEIVED,
              note: 'Ticket created',
            },
          },
        },
        include: {
          customer: true,
          device: true,
          history: { orderBy: { createdAt: 'asc' } },
          estimate: true,
        },
      });

      expect(result).toEqual(createdTicket);
    });

    it('throws NotFoundException when customer does not exist', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          customerId: 999,
          deviceId: 2,
          problemDescription: 'Screen is broken',
        } as any),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.device.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.repairTicket.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when device does not belong to customer', async () => {
      prismaMock.customer.findUnique.mockResolvedValue({ id: 1 });
      prismaMock.device.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          customerId: 1,
          deviceId: 999,
          problemDescription: 'Screen is broken',
        } as any),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.repairTicket.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all repair tickets with relations', async () => {
      const tickets = [
        {
          id: 1,
          status: RepairStatus.RECEIVED,
        },
      ];

      prismaMock.repairTicket.findMany.mockResolvedValue(tickets);

      const result = await service.findAll();

      expect(prismaMock.repairTicket.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          device: true,
          history: { orderBy: { createdAt: 'asc' } },
          estimate: true,
        },
      });

      expect(result).toEqual(tickets);
    });
  });

  describe('findOne', () => {
    it('returns a repair ticket when found', async () => {
      const ticket = {
        id: 1,
        status: RepairStatus.RECEIVED,
      };

      prismaMock.repairTicket.findUnique.mockResolvedValue(ticket);

      const result = await service.findOne(1);

      expect(prismaMock.repairTicket.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          customer: true,
          device: true,
          history: { orderBy: { createdAt: 'asc' } },
          estimate: true,
        },
      });

      expect(result).toEqual(ticket);
    });

    it('throws NotFoundException when repair ticket is missing', async () => {
      prismaMock.repairTicket.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('updates ticket status and writes history, then returns refreshed ticket', async () => {
      prismaMock.repairTicket.findUnique.mockResolvedValueOnce({
        id: 1,
        status: RepairStatus.RECEIVED,
      });

      const tx = {
        repairTicket: {
          update: jest.fn().mockResolvedValue(undefined),
        },
        ticketHistory: {
          create: jest.fn().mockResolvedValue(undefined),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(tx);
      });

      const refreshedTicket = {
        id: 1,
        status: RepairStatus.IN_REPAIR,
      };

      prismaMock.repairTicket.findUnique.mockResolvedValueOnce(refreshedTicket);

      const result = await service.updateStatus(
        1,
        RepairStatus.IN_REPAIR,
        'Started repair',
      );

      expect(prismaMock.$transaction).toHaveBeenCalled();

      expect(tx.repairTicket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: RepairStatus.IN_REPAIR },
      });

      expect(tx.ticketHistory.create).toHaveBeenCalledWith({
        data: {
          ticketId: 1,
          status: RepairStatus.IN_REPAIR,
          note: 'Started repair',
        },
      });

      expect(result).toEqual(refreshedTicket);
    });

    it('throws NotFoundException when repair ticket is missing', async () => {
      prismaMock.repairTicket.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(1, RepairStatus.IN_REPAIR, 'Started repair'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });
});