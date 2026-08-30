import { IsNotEmpty, IsNumberString } from 'class-validator';

export class AssignWorkerDto {
  @IsNotEmpty()
  @IsNumberString()
  doctorId!: string;
}
