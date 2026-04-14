import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('registers a new user', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'secret123',
        role: UserRole.ADMIN,
      };

      const createdUser = {
        id: 1,
        email: dto.email,
        role: dto.role,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: 'hashed-password',
          role: dto.role,
        },
        select: { id: true, email: true, role: true, createdAt: true },
      });

      expect(result).toEqual(createdUser);
    });

    it('defaults role to WORKER when role is not provided', async () => {
      const dto: RegisterDto = {
        email: 'worker@example.com',
        password: 'secret123',
      };

      const createdUser = {
        id: 2,
        email: dto.email,
        role: UserRole.WORKER,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: 'hashed-password',
          role: UserRole.WORKER,
        },
        select: { id: true, email: true, role: true, createdAt: true },
      });

      expect(result).toEqual(createdUser);
    });

    it('throws ConflictException when email already exists', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'secret123',
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: 99,
        email: dto.email,
      });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns access token for valid credentials', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'secret123',
      };

      const user = {
        id: 1,
        email: dto.email,
        password: 'stored-hash',
        role: UserRole.ADMIN,
      };

      prismaMock.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtMock.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login(dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);

      expect(jwtMock.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('throws UnauthorizedException when user is not found', async () => {
      const dto: LoginDto = {
        email: 'missing@example.com',
        password: 'secret123',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const user = {
        id: 1,
        email: dto.email,
        password: 'stored-hash',
        role: UserRole.WORKER,
      };

      prismaMock.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });
});