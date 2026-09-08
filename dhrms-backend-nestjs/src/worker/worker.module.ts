import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerSelfController } from './worker-self.controller';
import { WorkerRegistrationController } from './worker-registration.controller';
import { WorkerQrService } from './worker-qr.service';
import { WorkerService } from './worker.service';
import { WorkerRegistrationService } from './worker-registration.service';

@Module({
  controllers: [WorkerController, WorkerSelfController, WorkerRegistrationController],
  providers: [WorkerService, WorkerQrService, WorkerRegistrationService],
  exports: [WorkerService, WorkerQrService, WorkerRegistrationService],
})
export class WorkerModule {}
