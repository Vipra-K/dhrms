import { IsNotEmpty, IsString } from 'class-validator';

export class WorkerQrLookupDto {
  @IsString()
  @IsNotEmpty()
  qrContent!: string;
}
