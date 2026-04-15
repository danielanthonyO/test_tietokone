import { PrismaService } from '../../../src/prisma/prisma.service';
import { CustomerType, RepairStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function createUser(prisma: PrismaService, overrides: Partial<any> = {}) {
  return prisma.user.create({
    data: {
      email: overrides.email ?? `user-${Date.now()}-${Math.random()}@example.com`,
      password: overrides.password ?? (await bcrypt.hash('password123', 10)),
      role: overrides.role ?? UserRole.WORKER,
      name: overrides.name ?? 'Test User',
      phone: overrides.phone ?? '1234567',
      avatar: overrides.avatar,
    },
  });
}

export async function createCustomer(prisma: PrismaService, overrides: Partial<any> = {}) {
  return prisma.customer.create({
    data: {
      customerCode: overrides.customerCode ?? `CUS-${Date.now()}`,
      type: overrides.type ?? CustomerType.INDIVIDUAL,
      name: overrides.name ?? 'Jane Customer',
      email: overrides.email ?? 'customer@example.com',
      phone: overrides.phone ?? '1234567',
    },
  });
}

export async function createDevice(prisma: PrismaService, customerId: number, overrides: Partial<any> = {}) {
  return prisma.device.create({
    data: {
      deviceCode: overrides.deviceCode ?? `DEV-${Date.now()}`,
      customerId,
      type: overrides.type ?? 'Phone',
      brand: overrides.brand ?? 'Apple',
      model: overrides.model ?? 'iPhone 13',
      serialNumber: overrides.serialNumber ?? `SN-${Date.now()}`,
    },
  });
}

export async function createRepairTicket(prisma: PrismaService, customerId: number, deviceId: number, overrides: Partial<any> = {}) {
  return prisma.repairTicket.create({
    data: {
      repairCode: overrides.repairCode ?? `TIC-${Date.now()}`,
      customerId,
      deviceId,
      problemDescription: overrides.problemDescription ?? 'Screen is cracked',
      status: overrides.status ?? RepairStatus.RECEIVED,
      history: {
        create: {
          status: overrides.status ?? RepairStatus.RECEIVED,
          note: overrides.historyNote ?? 'Ticket created',
        },
      },
    },
  });
}
