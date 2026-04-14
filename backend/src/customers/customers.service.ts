import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { generateCode } from '../common/utils/generate-code';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        customerCode: generateCode('CUS'),
        type: dto.type,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
    });
  }

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.customer.update({
      where: { id },
      data: {
        type: dto.type,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // ensure exists
    return this.prisma.customer.delete({ where: { id } });
  }
}