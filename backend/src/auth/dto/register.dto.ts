import { IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';


export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}