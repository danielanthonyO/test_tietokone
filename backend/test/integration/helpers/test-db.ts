import { PrismaService } from '../../../src/prisma/prisma.service';

export async function resetDatabase(prisma: PrismaService) {
  await prisma.ticketHistory.deleteMany();
  await prisma.costEstimate.deleteMany();
  await prisma.repairTicket.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
}
