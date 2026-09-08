import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class WorkerPhoneLookupDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone!: string;
}
