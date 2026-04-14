import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateEstimateDto {
  @IsInt()
  ticketId: number;

  @IsInt()
  @Min(0)
  laborCost: number;

  @IsInt()
  @Min(0)
  partsCost: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  note?: string;
}