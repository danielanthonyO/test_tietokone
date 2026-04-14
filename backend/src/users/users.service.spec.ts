import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a user successfully', async () => {
      const dto = {
        email: 'worker@example.com',
        password: 'secret123',
        role: UserRole.WORKER,
        name: 'Worker One',
        phone: '123456789',
      };

      const createdUser = {
        id: 1,
        email: dto.email,
        role: dto.role,
        name: dto.name,
        phone: dto.phone,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: 'hashed-password',
          role: dto.role,
          name: dto.name,
          phone: dto.phone,
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      });

      expect(result).toEqual(createdUser);
    });

    it('defaults role to WORKER when role is not provided', async () => {
      const dto = {
        email: 'worker@example.com',
        password: 'secret123',
        name: 'Worker One',
        phone: '123456789',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        email: dto.email,
        role: UserRole.WORKER,
        name: dto.name,
        phone: dto.phone,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      await service.create(dto as any);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: 'hashed-password',
          role: UserRole.WORKER,
          name: dto.name,
          phone: dto.phone,
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      });
    });

    it('throws ConflictException when email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 99,
        email: 'worker@example.com',
      });

      await expect(
        service.create({
          email: 'worker@example.com',
          password: 'secret123',
        } as any),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns users', async () => {
      const users = [
        {
          id: 1,
          email: 'a@example.com',
          role: UserRole.ADMIN,
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('returns a user when found', async () => {
      const user = {
        id: 1,
        email: 'a@example.com',
        role: UserRole.ADMIN,
      };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user is missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMe', () => {
    it('delegates to findOne', async () => {
      const user = { id: 1, email: 'me@example.com' };
      const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(user as any);

      const result = await service.getMe(1);

      expect(findOneSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('updateByAdmin', () => {
    it('updates a user', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({
          id: 1,
          email: 'old@example.com',
        })
        .mockResolvedValueOnce(null);

      const updatedUser = {
        id: 1,
        email: 'new@example.com',
        role: UserRole.ADMIN,
        name: 'New Name',
      };

      prismaMock.user.update.mockResolvedValue(updatedUser);

      const dto = {
        email: 'new@example.com',
        role: UserRole.ADMIN,
        name: 'New Name',
      };

      const result = await service.updateByAdmin(1, dto as any);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          avatar: dto['avatar'],
          name: dto.name,
          phone: dto['phone'],
          email: dto.email,
          role: dto.role,
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(updatedUser);
    });

    it('throws NotFoundException when user is missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.updateByAdmin(1, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when new email is already in use', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({
          id: 1,
          email: 'old@example.com',
        })
        .mockResolvedValueOnce({
          id: 2,
          email: 'taken@example.com',
        });

      await expect(
        service.updateByAdmin(1, { email: 'taken@example.com' } as any),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('updateMe', () => {
    it('updates own profile', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({
          id: 1,
          email: 'old@example.com',
        })
        .mockResolvedValueOnce(null);

      const updatedUser = {
        id: 1,
        email: 'new@example.com',
        name: 'Updated User',
      };

      prismaMock.user.update.mockResolvedValue(updatedUser);

      const dto = {
        email: 'new@example.com',
        name: 'Updated User',
      };

      const result = await service.updateMe(1, dto as any);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          avatar: dto['avatar'],
          name: dto.name,
          phone: dto['phone'],
          email: dto.email,
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(updatedUser);
    });

    it('throws NotFoundException when user is missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.updateMe(1, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when email is already in use', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({
          id: 1,
          email: 'old@example.com',
        })
        .mockResolvedValueOnce({
          id: 2,
          email: 'taken@example.com',
        });

      await expect(
        service.updateMe(1, { email: 'taken@example.com' } as any),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('hashes and updates the password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const updatedUser = {
        id: 1,
        email: 'user@example.com',
        role: UserRole.WORKER,
      };

      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.resetPassword(1, {
        newPassword: 'new-secret',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('new-secret', 10);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          password: 'new-hash',
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(updatedUser);
    });

    it('throws NotFoundException when user is missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword(1, { newPassword: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes a user and returns success message', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
      });

      prismaMock.user.delete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('throws NotFoundException when user is missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});