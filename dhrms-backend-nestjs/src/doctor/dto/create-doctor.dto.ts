import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum DoctorRole { SENIOR_CONSULTANT = 'SENIOR_CONSULTANT', JUNIOR_DOCTOR = 'JUNIOR_DOCTOR', RESIDENT = 'RESIDENT', READ_ONLY = 'READ_ONLY' }

export class CreateDoctorDto {
  @IsNotEmpty() @MaxLength(200) fullName!: string;
  @IsNotEmpty() @IsEmail() email!: string;
  @IsNotEmpty() @MinLength(8) @MaxLength(100) password!: string;
  @IsOptional() @MaxLength(150) specialization?: string;
  @IsOptional() @MaxLength(100) licenseNumber?: string;
  @IsOptional() @MaxLength(100) department?: string;
  @IsOptional() @IsEnum(DoctorRole) role?: DoctorRole;
}
