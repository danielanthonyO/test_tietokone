import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('calls authService.register with dto and returns the result', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'secret123',
        role: UserRole.ADMIN,
      };

      const serviceResult = {
        id: 1,
        email: dto.email,
        role: dto.role,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      authServiceMock.register.mockResolvedValue(serviceResult);

      const result = await controller.register(dto);

      expect(authServiceMock.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('login', () => {
    it('calls authService.login with dto and returns the token', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'secret123',
      };

      const serviceResult = {
        access_token: 'jwt-token',
      };

      authServiceMock.login.mockResolvedValue(serviceResult);

      const result = await controller.login(dto);

      expect(authServiceMock.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('me', () => {
    it('returns req.user', () => {
      const req = {
        user: {
          userId: 1,
          email: 'test@example.com',
          role: UserRole.ADMIN,
        },
      };

      expect(controller.me(req)).toEqual(req.user);
    });
  });
});