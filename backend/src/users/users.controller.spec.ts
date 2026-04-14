import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getMe: jest.fn(),
    updateByAdmin: jest.fn(),
    updateMe: jest.fn(),
    resetPassword: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service', async () => {
    const dto = {
      email: 'user@example.com',
      password: 'secret123',
      role: UserRole.WORKER,
    };

    const expected = { id: 1, email: dto.email };

    usersServiceMock.create.mockResolvedValue(expected);

    await expect(controller.create(dto as any)).resolves.toEqual(expected);
    expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('findAll calls service', async () => {
    const expected = [{ id: 1, email: 'user@example.com' }];
    usersServiceMock.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toEqual(expected);
    expect(usersServiceMock.findAll).toHaveBeenCalled();
  });

  it('getMe calls service with req.user.userId', async () => {
    const req = { user: { userId: 7 } };
    const expected = { id: 7, email: 'me@example.com' };

    usersServiceMock.getMe.mockResolvedValue(expected);

    await expect(controller.getMe(req)).resolves.toEqual(expected);
    expect(usersServiceMock.getMe).toHaveBeenCalledWith(7);
  });

  it('findOne calls service with id', async () => {
    const expected = { id: 1, email: 'user@example.com' };
    usersServiceMock.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(1)).resolves.toEqual(expected);
    expect(usersServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('updateMe calls service with req.user.userId and dto', async () => {
    const req = { user: { userId: 7 } };
    const dto = { name: 'Updated Name' };
    const expected = { id: 7, name: 'Updated Name' };

    usersServiceMock.updateMe.mockResolvedValue(expected);

    await expect(controller.updateMe(req, dto as any)).resolves.toEqual(expected);
    expect(usersServiceMock.updateMe).toHaveBeenCalledWith(7, dto);
  });

  it('updateByAdmin calls service with id and dto', async () => {
    const dto = { role: UserRole.ADMIN };
    const expected = { id: 1, role: UserRole.ADMIN };

    usersServiceMock.updateByAdmin.mockResolvedValue(expected);

    await expect(controller.updateByAdmin(1, dto as any)).resolves.toEqual(expected);
    expect(usersServiceMock.updateByAdmin).toHaveBeenCalledWith(1, dto);
  });

  it('resetPassword calls service with id and dto', async () => {
    const dto = { newPassword: 'new-secret' };
    const expected = { id: 1, email: 'user@example.com' };

    usersServiceMock.resetPassword.mockResolvedValue(expected);

    await expect(controller.resetPassword(1, dto as any)).resolves.toEqual(expected);
    expect(usersServiceMock.resetPassword).toHaveBeenCalledWith(1, dto);
  });

  it('remove calls service with id', async () => {
    const expected = { message: 'User deleted successfully' };
    usersServiceMock.remove.mockResolvedValue(expected);

    await expect(controller.remove(1)).resolves.toEqual(expected);
    expect(usersServiceMock.remove).toHaveBeenCalledWith(1);
  });
});