import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;

  const customersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: customersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service', async () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const expected = { id: 1, ...dto };

    customersServiceMock.create.mockResolvedValue(expected);

    await expect(controller.create(dto as any)).resolves.toEqual(expected);
    expect(customersServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('findAll calls service', async () => {
    const expected = [{ id: 1, firstName: 'John' }];
    customersServiceMock.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toEqual(expected);
    expect(customersServiceMock.findAll).toHaveBeenCalled();
  });

  it('findOne calls service with id', async () => {
    const expected = { id: 1, firstName: 'John' };
    customersServiceMock.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(1)).resolves.toEqual(expected);
    expect(customersServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('update calls service with id and dto', async () => {
    const dto = { firstName: 'Jane' };
    const expected = { id: 1, firstName: 'Jane' };

    customersServiceMock.update.mockResolvedValue(expected);

    await expect(controller.update(1, dto as any)).resolves.toEqual(expected);
    expect(customersServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove calls service with id', async () => {
    const expected = { message: 'Customer deleted successfully' };
    customersServiceMock.remove.mockResolvedValue(expected);

    await expect(controller.remove(1)).resolves.toEqual(expected);
    expect(customersServiceMock.remove).toHaveBeenCalledWith(1);
  });
});