import { Test, TestingModule } from '@nestjs/testing';
import { EstimatesController } from './estimates.controller';
import { EstimatesService } from './estimates.service';

describe('EstimatesController', () => {
  let controller: EstimatesController;

  const estimatesServiceMock = {
    create: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    findByTicket: jest.fn(),
    expirePendingEstimates: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstimatesController],
      providers: [
        {
          provide: EstimatesService,
          useValue: estimatesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<EstimatesController>(EstimatesController);
  });

  it('creates an estimate through the service', async () => {
    const dto = { ticketId: 1, laborCost: 100, partsCost: 50, note: 'LCD replacement' };
    const expected = { message: 'Estimate created successfully' };
    estimatesServiceMock.create.mockResolvedValue(expected);

    await expect(controller.create(dto as any)).resolves.toEqual(expected);
    expect(estimatesServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('approves an estimate by token', async () => {
    estimatesServiceMock.approve.mockResolvedValue({ ok: true });

    await expect(controller.approve('token-123')).resolves.toEqual({ ok: true });
    expect(estimatesServiceMock.approve).toHaveBeenCalledWith('token-123');
  });

  it('rejects an estimate by token', async () => {
    estimatesServiceMock.reject.mockResolvedValue({ ok: true });

    await expect(controller.reject('token-456')).resolves.toEqual({ ok: true });
    expect(estimatesServiceMock.reject).toHaveBeenCalledWith('token-456');
  });

  it('finds a ticket estimate by ticket id', async () => {
    estimatesServiceMock.findByTicket.mockResolvedValue({ id: 1 });

    await expect(controller.findByTicket(1)).resolves.toEqual({ id: 1 });
    expect(estimatesServiceMock.findByTicket).toHaveBeenCalledWith(1);
  });

  it('expires pending estimates', async () => {
    estimatesServiceMock.expirePendingEstimates.mockResolvedValue({ count: 2 });

    await expect(controller.expirePending()).resolves.toEqual({ count: 2 });
    expect(estimatesServiceMock.expirePendingEstimates).toHaveBeenCalled();
  });
});
