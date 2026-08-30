import { IsOptional, MaxLength } from 'class-validator';

export class UpdateWorkerDto {
  @IsOptional() @MaxLength(200) fullName?: string;
  @IsOptional() dateOfBirth?: string;
  @IsOptional() @MaxLength(20) gender?: string;
  @IsOptional() @MaxLength(10) bloodGroup?: string;
  @IsOptional() @MaxLength(20) phone?: string;
  @IsOptional() @MaxLength(300) address?: string;
  @IsOptional() @MaxLength(150) emergencyContactName?: string;
  @IsOptional() @MaxLength(20) emergencyContactPhone?: string;
  @IsOptional() @MaxLength(50) emergencyContactRelation?: string;
}
