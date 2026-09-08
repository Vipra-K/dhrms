import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateEncounterDto {
  @Type(() => Number)
  @IsInt()
  workerId!: number;

  @Type(() => Number)
  @IsInt()
  doctorId!: number;
}

