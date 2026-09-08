import { IsNotEmpty, IsString } from 'class-validator';

export class WorkerCodeLookupDto {
  @IsString()
  @IsNotEmpty()
  workerCode!: string;
}
