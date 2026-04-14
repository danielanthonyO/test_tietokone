import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { DevicesModule } from './devices/devices.module';
import { RepairTicketsModule } from './repair-tickets/repair-tickets.module';
import { EstimatesModule } from './estimates/estimates.module';
import { EmailModule } from './email/email.module';


@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    DevicesModule,
    RepairTicketsModule,
    EstimatesModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}