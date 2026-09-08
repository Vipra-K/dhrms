import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
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
  constructor(private readonly workerQrService: WorkerQrService, private readonly workerService: WorkerService) {}

  @Get()
  getWorkers(@Req() req: AuthenticatedRequest) {
    return this.workerService.getWorkers(req.user!.id);
  }

  @Get('/:workerId')
  getWorker(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    return this.workerService.getWorker(req.user!.id, BigInt(workerId));
  }

  @Post('/qr/lookup')
  lookupWorkerByQr(@Req() req: AuthenticatedRequest, @Body() body: WorkerQrLookupDto) {
    return this.workerQrService.getWorkerFromQr(req.user!.id, body.qrContent);
  }

  @Post('/phone/lookup')
  lookupWorkerByPhone(@Req() req: AuthenticatedRequest, @Body() body: WorkerPhoneLookupDto) {
    return this.workerQrService.getWorkerFromPhone(req.user!.id, body.phone);
  }

  @Post('/code/lookup')
  lookupWorkerByCode(@Req() req: AuthenticatedRequest, @Body() body: WorkerCodeLookupDto) {
    return this.workerQrService.getWorkerFromCode(req.user!.id, body.workerCode);
  }

  @Post('/:workerId/relationship')
  addWorkerToHospital(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    return this.workerService.addWorkerToHospital(req.user!.id, BigInt(workerId));
  }

  @Patch('/:workerId/terminate-relationship')
  terminateHospitalRelationship(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    return this.workerService.terminateHospitalRelationship(req.user!.id, BigInt(workerId));
  }
}
