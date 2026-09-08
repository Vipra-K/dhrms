import { Body, Controller, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkerQrLookupDto } from './dto/worker-qr-lookup.dto';
import { WorkerQrService } from './worker-qr.service';
import { WorkerService } from './worker.service';

@Controller('api/hospitals/workers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOSPITAL')
export class WorkerController {
  constructor(private readonly workerService: WorkerService, private readonly workerQrService: WorkerQrService) {}

  @Post('/qr/lookup')
  async lookupWorkerByQr(@Req() req: AuthenticatedRequest, @Body() body: WorkerQrLookupDto) {
    const worker = await this.workerQrService.getWorkerFromQr(body.qrContent);
    return this.workerService.getRegisteredWorker(worker.id);
  }

  @Get()
  getWorkers(@Req() req: AuthenticatedRequest) { return this.workerService.getWorkers(req.user!.id); }
  @Get('/code/:workerCode')
  getWorkerByCode(@Req() req: AuthenticatedRequest, @Param('workerCode') workerCode: string) { return this.workerService.getWorkerByCode(req.user!.id, workerCode); }
  @Get('/:workerId')
  getWorker(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) { return this.workerService.getWorker(req.user!.id, BigInt(workerId)); }
  @Put('/:workerId')
  updateWorker(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string, @Body() body: UpdateWorkerDto) { return this.workerService.updateWorker(req.user!.id, BigInt(workerId), body); }
  @Patch('/:workerId/activate')
  activateWorker(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) { return this.workerService.activateWorker(req.user!.id, BigInt(workerId)); }
  @Patch('/:workerId/deactivate')
  deactivateWorker(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) { return this.workerService.deactivateWorker(req.user!.id, BigInt(workerId)); }
}
