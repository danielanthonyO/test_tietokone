import { Test, TestingModule } from '@nestjs/testing';
import { RepairStatus } from '@prisma/client';
import { RepairTicketsController } from './repair-tickets.controller';
import { RepairTicketsService } from './repair-tickets.service';

describe('RepairTicketsController', () => {
  let controller: RepairTicketsController;

  const repairTicketsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairTicketsController],
      providers: [
        {
          provide: RepairTicketsService,
          useValue: repairTicketsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RepairTicketsController>(RepairTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service', async () => {
    const dto = {
      customerId: 1,
      deviceId: 2,
      problemDescription: 'Screen is broken',
    };

    const expected = { id: 1, ...dto };

    repairTicketsServiceMock.create.mockResolvedValue(expected);

    await expect(controller.create(dto as any)).resolves.toEqual(expected);
    expect(repairTicketsServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('findAll calls service', async () => {
    const expected = [{ id: 1, status: RepairStatus.RECEIVED }];
    repairTicketsServiceMock.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toEqual(expected);
    expect(repairTicketsServiceMock.findAll).toHaveBeenCalled();
  });

  it('findOne calls service with id', async () => {
    const expected = { id: 1, status: RepairStatus.RECEIVED };
    repairTicketsServiceMock.findOne.mockResolvedValue(expected);

    await expect(controller.findOne(1)).resolves.toEqual(expected);
    expect(repairTicketsServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('updateStatus calls service with id, status, and note', async () => {
    const dto = {
      status: RepairStatus.IN_REPAIR,
      note: 'Started repair',
    };

    const expected = { id: 1, status: RepairStatus.IN_REPAIR };

    repairTicketsServiceMock.updateStatus.mockResolvedValue(expected);

    await expect(controller.updateStatus(1, dto as any)).resolves.toEqual(expected);
    expect(repairTicketsServiceMock.updateStatus).toHaveBeenCalledWith(
      1,
      dto.status,
      dto.note,
    );
  });
});