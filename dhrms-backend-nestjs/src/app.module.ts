import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkerModule } from './worker/worker.module';
import { DoctorModule } from './doctor/doctor.module';
import { HospitalModule } from './hospital/hospital.module';
import { AssignmentModule } from './assignment/assignment.module';
import { MedicalModule } from './medical/medical.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HospitalModule,
    WorkerModule,
    DoctorModule,
    AssignmentModule,
    MedicalModule,
  ],
})
export class AppModule {}
