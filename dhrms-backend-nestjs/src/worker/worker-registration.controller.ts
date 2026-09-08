import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RegisterWorkerDto } from './dto/register-worker.dto';
import { WorkerRegistrationService } from './worker-registration.service';

@Controller('api/registration/workers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('REGISTRATION_OFFICER')
export class WorkerRegistrationController {
  constructor(private readonly registrationService: WorkerRegistrationService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query('search') search?: string) {
    return this.registrationService.listRegisteredWorkers(req.user!.id, search);
  }

  @Get('/check-phone')
  checkPhone(@Req() req: AuthenticatedRequest, @Query('phone') phone?: string) {
    return this.registrationService.checkPhone(req.user!.id, phone || '');
  }

  @Get('/:workerId')
  get(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    return this.registrationService.getRegisteredWorker(req.user!.id, BigInt(workerId));
  }

  @Post()
  register(@Req() req: AuthenticatedRequest, @Body() body: RegisterWorkerDto) {
    return this.registrationService.register(req.user!.id, body);
  }
}
