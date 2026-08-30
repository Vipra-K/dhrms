import { IsDateString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class MedicalRecordDto {
  @IsDateString() visitDate!: string;
  @IsOptional() @MaxLength(2000) symptoms?: string;
  @IsNotEmpty() @MaxLength(2000) diagnosis!: string;
  @IsOptional() @MaxLength(3000) treatment?: string;
  @IsOptional() @MaxLength(5000) notes?: string;
}
