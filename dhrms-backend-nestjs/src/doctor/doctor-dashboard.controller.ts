import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DoctorService } from './doctor.service';

@Controller('api/doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class DoctorDashboardController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('/me')
  getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.doctorService.getMyProfile(req.user!.id);
  }
}
