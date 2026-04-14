import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateDeviceDto {
  @IsInt()
  @Min(1)
  customerId: number;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;
}