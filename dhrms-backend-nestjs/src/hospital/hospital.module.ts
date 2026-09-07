import { Module } from '@nestjs/common';
import { HospitalAuthController } from './hospital-auth.controller';
import { HospitalAuthService } from './hospital-auth.service';
import { HospitalDashboardController } from './hospital-dashboard.controller';
import { HospitalDashboardService } from './hospital-dashboard.service';

@Module({
  controllers: [HospitalAuthController, HospitalDashboardController],
  providers: [HospitalAuthService, HospitalDashboardService],
  exports: [HospitalAuthService, HospitalDashboardService],
})
export class HospitalModule {}
