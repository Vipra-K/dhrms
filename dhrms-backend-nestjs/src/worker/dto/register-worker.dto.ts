import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterWorkerDto {
  @IsNotEmpty() @IsString() @MaxLength(200) fullName!: string;
  @IsOptional() @IsEmail() @MaxLength(255) email?: string;
  @IsOptional() @MinLength(6) @MaxLength(100) password?: string;
  @IsOptional() dateOfBirth?: string;
  @IsOptional() @IsString() @MaxLength(20) gender?: string;
  @IsOptional() @IsString() @MaxLength(10) bloodGroup?: string;
  @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @IsOptional() @IsString() @MaxLength(300) address?: string;
  @IsOptional() @IsString() @MaxLength(150) emergencyContactName?: string;
  @IsOptional() @IsString() @MaxLength(20) emergencyContactPhone?: string;
  @IsOptional() @IsString() @MaxLength(50) emergencyContactRelation?: string;
  @IsOptional() @IsString() @MaxLength(200) employerName?: string;
  @IsOptional() @IsString() @MaxLength(255) worksiteName?: string;
  @IsOptional() @IsString() @MaxLength(300) worksiteAddress?: string;
  @IsOptional() @IsString() @MaxLength(100) worksiteDistrict?: string;
  @IsOptional() @IsString() @MaxLength(100) jobRole?: string;
}
