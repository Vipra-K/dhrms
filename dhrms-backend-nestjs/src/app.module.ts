import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkerModule } from './worker/worker.module';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, WorkerModule, DoctorModule],
})
export class AppModule {}
