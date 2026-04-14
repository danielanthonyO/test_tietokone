import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RepairStatus } from '@prisma/client';

export class UpdateRepairStatusDto {
  @IsEnum(RepairStatus)
  status: RepairStatus;

  @IsOptional()
  @IsString()
  @MinLength(2)
  note?: string;
}