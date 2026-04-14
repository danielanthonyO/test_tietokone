import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { RepairStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { generateCode } from '../common/utils/generate-code';

@Injectable()
export class EstimatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateEstimateDto) {
    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id: dto.ticketId },
      include: {
        estimate: true,
        customer: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Repair ticket not found');
    }

    if (ticket.estimate) {
      throw new BadRequestException(
        'An estimate already exists for this repair ticket',
      );
    }

    const approvalToken = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const subtotal = dto.laborCost + dto.partsCost;
    const vatRate = 0.255;
    const vatAmount = +(subtotal * vatRate).toFixed(2);
    const totalCost = +(subtotal + vatAmount).toFixed(2);

    const estimate = await this.prisma.$transaction(async (tx) => {
      const createdEstimate = await tx.costEstimate.create({
        data: {
          estimateCode: generateCode('EST'),
          ticketId: dto.ticketId,
          laborCost: dto.laborCost,
          partsCost: dto.partsCost,
          note: dto.note,
          currency: dto.currency ?? 'EUR',
          status: 'PENDING',
          approvalToken,
          expiresAt,
          subtotal,
          vatRate,
          vatAmount,
          totalCost,
        },
      });

      await tx.repairTicket.update({
        where: { id: dto.ticketId },
        data: {
          status: RepairStatus.WAITING_APPROVAL,
        },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId: dto.ticketId,
          status: RepairStatus.WAITING_APPROVAL,
          note: 'Cost estimate created and waiting for customer approval',
        },
      });

      return createdEstimate;
    });

    const approveUrl = `${process.env.FRONTEND_BASE_URL}/estimate/${approvalToken}/approve`;
    const rejectUrl = `${process.env.FRONTEND_BASE_URL}/estimate/${approvalToken}/reject`;

    try {
      if (ticket.customer.email) {
        await this.emailService.sendEstimateEmail({
          customerEmail: ticket.customer.email,
          customerName: ticket.customer.name,
          laborCost: dto.laborCost,
          partsCost: dto.partsCost,
          totalCost,
          currency: dto.currency ?? 'EUR',
          note: dto.note,
          approveUrl,
          rejectUrl,
        });
        console.log('Estimate email sent successfully');
      } else {
        console.log('No customer email found');
        console.log('Approve URL:', approveUrl);
        console.log('Reject URL:', rejectUrl);
      }
    } catch (error) {
      console.error('Estimate email sending failed:', error);
      console.log('Approve URL:', approveUrl);
      console.log('Reject URL:', rejectUrl);
    }

    return {
      message: 'Estimate created successfully',
      approvalToken,
      expiresAt,
      estimate,
    };
  }

  async approve(token: string) {
    const estimate = await this.prisma.costEstimate.findUnique({
      where: { approvalToken: token },
      include: {
        ticket: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!estimate) {
      throw new NotFoundException('Estimate token not found');
    }

    if (estimate.status !== 'PENDING') {
      throw new BadRequestException('This estimate has already been processed');
    }

    if (estimate.expiresAt && estimate.expiresAt < new Date()) {
      await this.prisma.costEstimate.update({
        where: { id: estimate.id },
        data: {
          status: 'EXPIRED',
          approvalToken: null,
        },
      });

      throw new BadRequestException('Estimate token has expired');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedEstimate = await tx.costEstimate.update({
        where: { id: estimate.id },
        data: {
          status: 'APPROVED',
          decidedAt: new Date(),
          approvalToken: null,
        },
      });

      await tx.repairTicket.update({
        where: { id: estimate.ticketId },
        data: {
          status: RepairStatus.IN_REPAIR,
        },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId: estimate.ticketId,
          status: RepairStatus.IN_REPAIR,
          note: 'Customer approved the estimate',
        },
      });

      return updatedEstimate;
    });

    try {
      if (estimate.ticket.customer.email) {
        await this.emailService.sendEstimateDecisionEmail({
          customerEmail: estimate.ticket.customer.email,
          customerName: estimate.ticket.customer.name,
          decision: 'APPROVED',
        });
        console.log('Approval confirmation email sent successfully');
      }
    } catch (error) {
      console.error('Approval confirmation email failed:', error);
    }

    return {
      message: 'Estimate approved successfully',
      estimate: result,
    };
  }

  async reject(token: string) {
    const estimate = await this.prisma.costEstimate.findUnique({
      where: { approvalToken: token },
      include: {
        ticket: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!estimate) {
      throw new NotFoundException('Estimate token not found');
    }

    if (estimate.status !== 'PENDING') {
      throw new BadRequestException('This estimate has already been processed');
    }

    if (estimate.expiresAt && estimate.expiresAt < new Date()) {
      await this.prisma.costEstimate.update({
        where: { id: estimate.id },
        data: {
          status: 'EXPIRED',
          approvalToken: null,
        },
      });

      throw new BadRequestException('Estimate token has expired');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedEstimate = await tx.costEstimate.update({
        where: { id: estimate.id },
        data: {
          status: 'REJECTED',
          decidedAt: new Date(),
          approvalToken: null,
        },
      });

      await tx.repairTicket.update({
        where: { id: estimate.ticketId },
        data: {
          status: RepairStatus.NOT_SERVICED,
        },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId: estimate.ticketId,
          status: RepairStatus.NOT_SERVICED,
          note: 'Customer rejected the estimate',
        },
      });

      return updatedEstimate;
    });

    try {
      if (estimate.ticket.customer.email) {
        await this.emailService.sendEstimateDecisionEmail({
          customerEmail: estimate.ticket.customer.email,
          customerName: estimate.ticket.customer.name,
          decision: 'REJECTED',
        });
        console.log('Rejection confirmation email sent successfully');
      }
    } catch (error) {
      console.error('Rejection confirmation email failed:', error);
    }

    return {
      message: 'Estimate rejected successfully',
      estimate: result,
    };
  }

  async expirePendingEstimates() {
    const now = new Date();

    const result = await this.prisma.costEstimate.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: 'EXPIRED',
        approvalToken: null,
      },
    });

    return {
      message: 'Expired pending estimates updated successfully',
      count: result.count,
    };
  }

  async findByTicket(ticketId: number) {
    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id: ticketId },
      include: {
        estimate: true,
        customer: true,
        device: true,
        history: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Repair ticket not found');
    }

    return ticket;
  }
}