import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class PrescriptionDto {
  @IsNotEmpty() @MaxLength(200) medicineName!: string;
  @IsOptional() @MaxLength(100) dosage?: string;
  @IsOptional() @MaxLength(100) frequency?: string;
  @IsOptional() @MaxLength(100) duration?: string;
  @IsOptional() @MaxLength(1000) instructions?: string;
}
