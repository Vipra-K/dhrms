import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { EncounterService } from './encounter.service';

@Controller('api/encounters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EncounterController {
  constructor(private readonly encounterService: EncounterService) {}

  @Post()
  @Roles('HOSPITAL')
  start(@Req() req: AuthenticatedRequest, @Body() body: CreateEncounterDto) {
    return this.encounterService.start(req.user!.id, body);
  }

  @Get('/hospital/active')
  @Roles('HOSPITAL')
  listHospitalActive(@Req() req: AuthenticatedRequest) {
    return this.encounterService.listHospitalActive(req.user!.id);
  }

  @Get('/doctor/active')
  @Roles('DOCTOR')
  listDoctorActive(@Req() req: AuthenticatedRequest) {
    return this.encounterService.listDoctorActive(req.user!.id);
  }

  @Get('/doctor/:encounterId')
  @Roles('DOCTOR')
  getForDoctor(@Req() req: AuthenticatedRequest, @Param('encounterId') encounterId: string) {
    return this.encounterService.getForDoctor(req.user!.id, BigInt(encounterId));
  }

  @Post('/doctor/:encounterId/complete')
  @Roles('DOCTOR')
  complete(@Req() req: AuthenticatedRequest, @Param('encounterId') encounterId: string) {
    return this.encounterService.complete(req.user!.id, BigInt(encounterId));
  }

  @Get('/worker/:workerId/history')
  @Roles('WORKER', 'HOSPITAL', 'DOCTOR')
  history(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    return this.encounterService.historyForWorker(req.user!.id, BigInt(workerId), req.user!.role);
  }
}
