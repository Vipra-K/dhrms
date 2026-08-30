import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { DoctorRole } from './create-doctor.dto';

export class UpdateDoctorDto {
  @IsOptional() @MaxLength(200) fullName?: string;
  @IsOptional() @MaxLength(150) specialization?: string;
  @IsOptional() @MaxLength(100) licenseNumber?: string;
  @IsOptional() @MaxLength(100) department?: string;
  @IsOptional() @IsEnum(DoctorRole) role?: DoctorRole;
}
