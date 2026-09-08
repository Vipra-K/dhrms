import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEncounterDto {
  @IsInt()
  workerId!: number;

  @IsOptional()
  @IsInt()
  doctorId?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
