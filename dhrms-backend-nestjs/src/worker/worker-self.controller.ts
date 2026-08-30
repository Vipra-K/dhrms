import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
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

  @Get('/medical-records')
  getMyMedicalRecords(@Req() req: AuthenticatedRequest) {
    return this.workerService.getMyMedicalRecords(req.user!.id);
  }
}
