import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterHospitalDto {
  @IsNotEmpty() @MaxLength(200) hospitalName!: string;
  @IsNotEmpty() @MaxLength(50) hfrId!: string;
  @IsNotEmpty() @MaxLength(50) hospitalCode!: string;
  @IsEmail() @MaxLength(150) email!: string;
  @IsNotEmpty() @MinLength(8) @MaxLength(100) password!: string;
  @IsOptional() @MaxLength(300) address?: string;
  @IsOptional() @MaxLength(100) city?: string;
  @IsOptional() @MaxLength(100) district?: string;
  @IsOptional() @MaxLength(20) phone?: string;
}
