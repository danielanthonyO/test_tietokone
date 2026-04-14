
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepairTicketDto } from './dto/create-repair-ticket.dto';
import { RepairStatus } from '@prisma/client';
import { generateCode } from '../common/utils/generate-code';

@Injectable()
export class RepairTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRepairTicketDto) {
    // 1) customer exists?
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // 2) device exists AND belongs to customer?
    const device = await this.prisma.device.findFirst({
      where: { id: dto.deviceId, customerId: dto.customerId },
    });
    if (!device) {
      throw new NotFoundException('Device not found for this customer');
    }

    // 3) create ticket + initial history row
    return this.prisma.repairTicket.create({
      data: {
        repairCode: generateCode('TIC'), // important: this will generate a unique Code for the repair ticket
        customerId: dto.customerId,
        deviceId: dto.deviceId,
        problemDescription: dto.problemDescription,
        status: RepairStatus.RECEIVED,
        history: {
          create: {
            status: RepairStatus.RECEIVED,
            note: 'Ticket created',
          },
        },
      },
      include: {
        customer: true,
        device: true,
        history: { orderBy: { createdAt: 'asc' } },
        estimate: true,
      },
    });
  }

  findAll() {
    return this.prisma.repairTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        device: true,
        history: { orderBy: { createdAt: 'asc' } },
        estimate: true,
      },
    });
  }

  async findOne(id: number) {
    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id },
      include: {
        customer: true,
        device: true,
        history: { orderBy: { createdAt: 'asc' } },
        estimate: true,
      },
    });

    if (!ticket) throw new NotFoundException('Repair ticket not found');
    return ticket;
  }

  async updateStatus(id: number, status: RepairStatus, note?: string) {
    // ensure ticket exists
    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Repair ticket not found');

    // transaction: update ticket + insert history
    await this.prisma.$transaction(async (tx) => {
      await tx.repairTicket.update({
        where: { id },
        data: { status },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId: id,
          status,
          note,
        },
      });
    });

    // return full ticket again
    return this.findOne(id);
  }
}