import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { WorkerService } from './worker.service';

@Controller('api/workers/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('WORKER')
export class WorkerSelfController {
  constructor(private readonly workerService: WorkerService) {}

  @Get()
  getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.workerService.getMyProfile(req.user!.id);
  }

  @Put()
  updateMyProfile(@Req() req: AuthenticatedRequest, @Body() body: UpdateWorkerDto) {
    return this.workerService.updateMyProfile(req.user!.id, body);
  }

  @Get('/medical-records')
  getMyMedicalRecords(@Req() req: AuthenticatedRequest) {
    return this.workerService.getMyMedicalRecords(req.user!.id);
  }
}
