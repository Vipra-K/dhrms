import { Body, Controller, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorService } from './doctor.service';

@Controller('api/hospitals/doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOSPITAL')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  createDoctor(@Req() req: AuthenticatedRequest, @Body() body: CreateDoctorDto) {
    return this.doctorService.createDoctor(req.user!.id, body);
  }

  @Get()
  getDoctors(@Req() req: AuthenticatedRequest) {
    return this.doctorService.getHospitalDoctors(req.user!.id);
  }

  @Get('/hospital/doctors')
  getHospitalDoctors(@Req() req: AuthenticatedRequest) {
    return this.doctorService.getDoctorsForHospital(req.user!.id);
  }

  @Get('/:doctorId')
  getDoctor(@Req() req: AuthenticatedRequest, @Param('doctorId') doctorId: string) {
    return this.doctorService.getDoctor(req.user!.id, BigInt(doctorId));
  }

  @Put('/:doctorId')
  updateDoctor(@Req() req: AuthenticatedRequest, @Param('doctorId') doctorId: string, @Body() body: UpdateDoctorDto) {
    return this.doctorService.updateDoctor(req.user!.id, BigInt(doctorId), body);
  }

  @Patch('/:doctorId/activate')
  activateDoctor(@Req() req: AuthenticatedRequest, @Param('doctorId') doctorId: string) {
    return this.doctorService.changeStatus(req.user!.id, BigInt(doctorId), 'ACTIVE');
  }

  @Patch('/:doctorId/suspend')
  suspendDoctor(@Req() req: AuthenticatedRequest, @Param('doctorId') doctorId: string) {
    return this.doctorService.changeStatus(req.user!.id, BigInt(doctorId), 'SUSPENDED');
  }

  @Patch('/:doctorId/deactivate')
  deactivateDoctor(@Req() req: AuthenticatedRequest, @Param('doctorId') doctorId: string) {
    return this.doctorService.changeStatus(req.user!.id, BigInt(doctorId), 'INACTIVE');
  }
}
