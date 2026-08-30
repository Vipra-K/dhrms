import { Module } from '@nestjs/common';
import { HospitalAuthController } from './hospital-auth.controller';
import { HospitalAuthService } from './hospital-auth.service';

@Module({
  controllers: [HospitalAuthController],
  providers: [HospitalAuthService],
  exports: [HospitalAuthService],
})
export class HospitalModule {}
