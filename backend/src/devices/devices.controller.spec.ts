import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

describe('DevicesController', () => {
  let controller: DevicesController;

  const devicesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        {
          provide: DevicesService,
          useValue: devicesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service', async () => {
    const dto = {
      customerId: 1,
      brand: 'Apple',
      model: 'MacBook Air',
    };

    const expected = { id: 1, ...dto };

    devicesServiceMock.create.mockResolvedValue(expected);

    await expect(controller.create(dto as any)).resolves.toEqual(expected);
    expect(devicesServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('findAll calls service', async () => {
    const expected = [{ id: 1, brand: 'Apple' }];
    devicesServiceMock.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toEqual(expected);
    expect(devicesServiceMock.findAll).toHaveBeenCalled();
  });

  it('findOne calls service with id', async () => {
    const expected = { id: 1, brand: 'Apple' };
    devicesServiceMock.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(1)).resolves.toEqual(expected);
    expect(devicesServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('update calls service with id and dto', async () => {
    const dto = { brand: 'Dell' };
    const expected = { id: 1, brand: 'Dell' };

    devicesServiceMock.update.mockResolvedValue(expected);

    await expect(controller.update(1, dto as any)).resolves.toEqual(expected);
    expect(devicesServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove calls service with id', async () => {
    const expected = { id: 1, brand: 'Apple' };
    devicesServiceMock.remove.mockResolvedValue(expected);

    await expect(controller.remove(1)).resolves.toEqual(expected);
    expect(devicesServiceMock.remove).toHaveBeenCalledWith(1);
  });
});