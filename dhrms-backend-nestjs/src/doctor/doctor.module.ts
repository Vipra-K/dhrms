import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorDashboardController } from './doctor-dashboard.controller';
import { DoctorService } from './doctor.service';

@Module({
  controllers: [DoctorController, DoctorDashboardController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
