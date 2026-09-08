import { Body, Controller, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { WorkerCodeLookupDto } from './dto/worker-code-lookup.dto';
import { WorkerPhoneLookupDto } from './dto/worker-phone-lookup.dto';
import { WorkerQrLookupDto } from './dto/worker-qr-lookup.dto';
import { WorkerQrService } from './worker-qr.service';
import { WorkerService } from './worker.service';

@Controller('api/hospitals/workers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOSPITAL')
export class WorkerController {
  constructor(
    private readonly workerQrService: WorkerQrService,
    private readonly workerService: WorkerService,
  ) {}

  @Post('/qr/lookup')
  lookupWorkerByQr(@Req() _req: AuthenticatedRequest, @Body() body: WorkerQrLookupDto) {
    return this.workerQrService.getWorkerFromQr(body.qrContent);
  }

  @Post('/phone/lookup')
  lookupWorkerByPhone(@Req() _req: AuthenticatedRequest, @Body() body: WorkerPhoneLookupDto) {
    return this.workerQrService.getWorkerFromPhone(body.phone);
  }

  @Post('/code/lookup')
  lookupWorkerByCode(@Req() _req: AuthenticatedRequest, @Body() body: WorkerCodeLookupDto) {
    return this.workerQrService.getWorkerFromCode(body.workerCode);
  }

  @Patch('/:workerId/terminate-relationship')
  terminateHospitalRelationship(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    return this.workerService.terminateHospitalRelationship(req.user!.id, BigInt(workerId));
  }
}
