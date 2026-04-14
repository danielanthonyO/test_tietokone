import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { generateCode } from '../common/utils/generate-code';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDeviceDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.device.create({
      data: {
        deviceCode: generateCode('DEV'),
        customerId: dto.customerId,
        type: dto.type,
        brand: dto.brand,
        model: dto.model,
        serialNumber: dto.serialNumber,
      },
      include: {
        customer: true,
      },
    });
  }

  findAll() {
    return this.prisma.device.findMany({
      include: {
        customer: true,
      },
    });
  }

  async findOne(id: number) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async update(id: number, dto: UpdateDeviceDto) {
    await this.findOne(id);

    return this.prisma.device.update({
      where: { id },
      data: dto,
      include: {
        customer: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.device.delete({
      where: { id },
    });
  }
}