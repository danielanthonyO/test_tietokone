import { Module } from '@nestjs/common';
import { EstimatesController } from './estimates.controller';
import { EstimatesService } from './estimates.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';


@Module({
  imports: [EmailModule],
  controllers: [EstimatesController],
  providers: [EstimatesService, PrismaService],
})
export class EstimatesModule {}
