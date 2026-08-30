import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerQrService } from './worker-qr.service';
import { WorkerService } from './worker.service';

@Module({
  controllers: [WorkerController],
  providers: [WorkerService, WorkerQrService],
  exports: [WorkerService, WorkerQrService],
})
export class WorkerModule {}
