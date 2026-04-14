import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateEstimateDto) {
    return this.estimatesService.create(dto);
  }

  @Patch(':token/approve')
  approve(@Param('token') token: string) {
    return this.estimatesService.approve(token);
  }

  @Patch(':token/reject')
  reject(@Param('token') token: string) {
    return this.estimatesService.reject(token);
  }

  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.estimatesService.findByTicket(ticketId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('expire-pending')
  expirePending() {
    return this.estimatesService.expirePendingEstimates();
  }
}

