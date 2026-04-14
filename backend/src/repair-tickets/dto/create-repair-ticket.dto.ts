import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateRepairTicketDto {
  @IsInt()
  @Min(1)
  customerId: number;

  @IsInt()
  @Min(1)
  deviceId: number;

  @IsString()
  @MinLength(5)
  problemDescription: string;
}