import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkerDto {
  @IsNotEmpty() @MaxLength(200) fullName!: string;
  @IsEmail() @MaxLength(150) email!: string;
  @IsNotEmpty() @MinLength(6) @MaxLength(100) password!: string;
  @IsOptional() dateOfBirth?: string;
  @IsOptional() @MaxLength(20) gender?: string;
  @IsOptional() @MaxLength(10) bloodGroup?: string;
  @IsOptional() @MaxLength(20) phone?: string;
  @IsOptional() @MaxLength(300) address?: string;
  @IsOptional() @MaxLength(150) emergencyContactName?: string;
  @IsOptional() @MaxLength(20) emergencyContactPhone?: string;
  @IsOptional() @MaxLength(50) emergencyContactRelation?: string;
}
