import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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

  @Post()
  register(@Req() req: AuthenticatedRequest, @Body() body: RegisterWorkerDto) {
    return this.registrationService.register(req.user!.id, body);
  }
}
