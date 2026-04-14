import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  let service: CustomersService;

  const prismaMock = {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a customer', async () => {
      const dto = {
        type: 'PRIVATE',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
      };

      const createdCustomer = {
        id: 1,
        customerCode: 'CUS-123456',
        ...dto,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      prismaMock.customer.create.mockResolvedValue(createdCustomer);

      const result = await service.create(dto as any);

      expect(prismaMock.customer.create).toHaveBeenCalledWith({
        data: {
          customerCode: expect.any(String),
          type: dto.type,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
        },
      });

      expect(result).toEqual(createdCustomer);
    });
  });

  describe('findAll', () => {
    it('returns all customers ordered by createdAt desc', async () => {
      const customers = [
        {
          id: 1,
          customerCode: 'CUS-123456',
          name: 'John Doe',
          type: 'PRIVATE',
        },
      ];

      prismaMock.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(prismaMock.customer.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(customers);
    });
  });

  describe('findOne', () => {
    it('returns a customer when found', async () => {
      const customer = {
        id: 1,
        customerCode: 'CUS-123456',
        name: 'John Doe',
        type: 'PRIVATE',
      };

      prismaMock.customer.findUnique.mockResolvedValue(customer);

      const result = await service.findOne(1);

      expect(prismaMock.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual(customer);
    });

    it('throws NotFoundException when customer is missing', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates a customer', async () => {
      prismaMock.customer.findUnique.mockResolvedValue({
        id: 1,
        name: 'John Doe',
      });

      const dto = {
        phone: '999999999',
      };

      const updatedCustomer = {
        id: 1,
        customerCode: 'CUS-123456',
        type: 'PRIVATE',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '999999999',
      };

      prismaMock.customer.update.mockResolvedValue(updatedCustomer);

      const result = await service.update(1, dto as any);

      expect(prismaMock.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          type: undefined,
          name: undefined,
          email: undefined,
          phone: '999999999',
        },
      });

      expect(result).toEqual(updatedCustomer);
    });

    it('throws NotFoundException when customer is missing', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { phone: '999999999' } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes and returns the deleted customer', async () => {
      const deletedCustomer = {
        id: 1,
        customerCode: 'CUS-123456',
        name: 'John Doe',
        type: 'PRIVATE',
      };

      prismaMock.customer.findUnique.mockResolvedValue(deletedCustomer);
      prismaMock.customer.delete.mockResolvedValue(deletedCustomer);

      const result = await service.remove(1);

      expect(prismaMock.customer.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual(deletedCustomer);
    });

    it('throws NotFoundException when customer is missing', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});