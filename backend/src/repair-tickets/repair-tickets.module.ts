import { Module } from '@nestjs/common';
import { RepairTicketsService } from './repair-tickets.service';
import { RepairTicketsController } from './repair-tickets.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RepairTicketsController],
  providers: [RepairTicketsService, PrismaService],
})
export class RepairTicketsModule {}
