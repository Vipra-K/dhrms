import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { DoctorRole } from './create-doctor.dto';

export class UpdateDoctorDto {
  @IsOptional() @MaxLength(200) fullName?: string;
  @IsOptional() @MaxLength(150) specialization?: string;
  @IsOptional() @MaxLength(100) licenseNumber?: string;
  @IsOptional() @MaxLength(100) department?: string;
  @IsOptional() @IsEnum(DoctorRole) role?: DoctorRole;
  @IsOptional() @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'workingHoursStart must be in HH:mm format' }) workingHoursStart?: string;
  @IsOptional() @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'workingHoursEnd must be in HH:mm format' }) workingHoursEnd?: string;
}
