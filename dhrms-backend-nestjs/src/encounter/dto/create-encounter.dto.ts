import { IsInt } from 'class-validator';

export class CreateEncounterDto {
  @IsInt()
  workerId!: number;

  @IsInt()
  doctorId!: number;
}
