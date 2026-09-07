import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { HospitalDashboardService } from './hospital-dashboard.service';

@Controller('api/hospitals/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOSPITAL')
export class HospitalDashboardController {
  constructor(private readonly dashboard: HospitalDashboardService) {}

  @Get('dashboard')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return this.dashboard.getSummary(req.user!.id);
  }
}
