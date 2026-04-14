import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RepairTicketsService } from './repair-tickets.service';
import { CreateRepairTicketDto } from './dto/create-repair-ticket.dto';
import { UpdateRepairStatusDto } from './dto/update-repair-status.dto';

@Controller('orders')
export class RepairTicketsController {
  constructor(private readonly repairTicketsService: RepairTicketsService) {}

  @Post()
  create(@Body() dto: CreateRepairTicketDto) {
    return this.repairTicketsService.create(dto);
  }

  @Get()
  findAll() {
    return this.repairTicketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repairTicketsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRepairStatusDto,
  ) {
    return this.repairTicketsService.updateStatus(id, dto.status, dto.note);
  }
}