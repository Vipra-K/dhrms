import { Body, Controller, Post } from '@nestjs/common';
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { HospitalAuthService } from './hospital-auth.service';

@Controller('api/hospitals')
export class HospitalAuthController {
  constructor(private readonly hospitalAuthService: HospitalAuthService) {}

  @Post('/register')
  register(@Body() body: RegisterHospitalDto) {
    return this.hospitalAuthService.registerHospital(body);
  }
}
