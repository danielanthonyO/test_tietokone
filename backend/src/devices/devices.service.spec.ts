import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DevicesService } from './devices.service';

describe('DevicesService', () => {
  let service: DevicesService;

  const prismaMock = {
    customer: {
      findUnique: jest.fn(),
    },
    device: {
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
        DevicesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a device when customer exists', async () => {
      const dto = {
        customerId: 1,
        brand: 'Apple',
        model: 'MacBook Air',
        serialNumber: 'ABC123',
        type: 'LAPTOP',
      };

      const createdDevice = {
        id: 1,
        deviceCode: 'DEV-123456',
        ...dto,
        customer: {
          id: 1,
          name: 'John Doe',
        },
      };

      prismaMock.customer.findUnique.mockResolvedValue({ id: 1 });
      prismaMock.device.create.mockResolvedValue(createdDevice);

      const result = await service.create(dto as any);

      expect(prismaMock.customer.findUnique).toHaveBeenCalledWith({
        where: { id: dto.customerId },
      });

      expect(prismaMock.device.create).toHaveBeenCalledWith({
        data: {
          deviceCode: expect.any(String),
          customerId: dto.customerId,
          brand: dto.brand,
          model: dto.model,
          serialNumber: dto.serialNumber,
          type: dto.type,
        },
        include: {
          customer: true,
        },
      });

      expect(result).toEqual(createdDevice);
    });

    it('throws NotFoundException when customer does not exist', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          customerId: 999,
          brand: 'Apple',
          model: 'MacBook Air',
        } as any),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.device.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all devices with customer', async () => {
      const devices = [
        {
          id: 1,
          brand: 'Apple',
          model: 'MacBook Air',
          customer: { id: 1, name: 'John Doe' },
        },
      ];

      prismaMock.device.findMany.mockResolvedValue(devices);

      const result = await service.findAll();

      expect(prismaMock.device.findMany).toHaveBeenCalledWith({
        include: {
          customer: true,
        },
      });

      expect(result).toEqual(devices);
    });
  });

  describe('findOne', () => {
    it('returns a device when found', async () => {
      const device = {
        id: 1,
        brand: 'Apple',
        model: 'MacBook Air',
        customer: { id: 1, name: 'John Doe' },
      };

      prismaMock.device.findUnique.mockResolvedValue(device);

      const result = await service.findOne(1);

      expect(prismaMock.device.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          customer: true,
        },
      });

      expect(result).toEqual(device);
    });

    it('throws NotFoundException when device is missing', async () => {
      prismaMock.device.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates a device', async () => {
      prismaMock.device.findUnique.mockResolvedValue({
        id: 1,
        brand: 'Apple',
      });

      const dto = {
        brand: 'Dell',
      };

      const updatedDevice = {
        id: 1,
        brand: 'Dell',
        model: 'MacBook Air',
      };

      prismaMock.device.update.mockResolvedValue(updatedDevice);

      const result = await service.update(1, dto as any);

      expect(prismaMock.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          type: undefined,
          brand: 'Dell',
          model: undefined,
          serialNumber: undefined,
        },
        include: {
          customer: true,
        },
      });

      expect(result).toEqual(updatedDevice);
    });

    it('throws NotFoundException when device is missing', async () => {
      prismaMock.device.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { brand: 'Dell' } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes and returns the deleted device', async () => {
      const deletedDevice = {
        id: 1,
        brand: 'Apple',
        model: 'MacBook Air',
      };

      prismaMock.device.findUnique.mockResolvedValue(deletedDevice);
      prismaMock.device.delete.mockResolvedValue(deletedDevice);

      const result = await service.remove(1);

      expect(prismaMock.device.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual(deletedDevice);
    });

    it('throws NotFoundException when device is missing', async () => {
      prismaMock.device.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
