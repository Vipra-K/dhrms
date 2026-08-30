import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AssignWorkerDto } from './dto/assign-worker.dto';
import { AssignmentService } from './assignment.service';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post('hospitals/workers/:workerId/assignment')
  @Roles('HOSPITAL')
  assign(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string, @Body() body: AssignWorkerDto) {
    return this.service.assignWorker(req.user!.id, BigInt(workerId), BigInt(body.doctorId));
  }

  @Get('hospitals/workers/:workerId/assignment')
  @Roles('HOSPITAL')
  getAssignment(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    return this.service.getWorkerAssignment(req.user!.id, BigInt(workerId));
  }

  @Get('doctors/me/workers')
  @Roles('DOCTOR')
  getMyWorkers(@Req() req: AuthenticatedRequest) {
    return this.service.getMyWorkers(req.user!.id);
  }

  @Get('doctors/me/workers/:workerId')
  @Roles('DOCTOR')
  async getMyWorker(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    await this.service.verifyDoctorWorkerAccess(req.user!.id, BigInt(workerId));
    const worker = await this.service['prisma'].worker.findUnique({ where: { id: BigInt(workerId) } });
    if (!worker) throw new Error('Worker not found');
    return { id: Number(worker.id), workerCode: worker.workerCode, fullName: worker.fullName, dateOfBirth: worker.dateOfBirth, gender: worker.gender, bloodGroup: worker.bloodGroup, phone: worker.phone, address: worker.address, emergencyContactName: worker.emergencyContactName, emergencyContactPhone: worker.emergencyContactPhone, emergencyContactRelation: worker.emergencyContactRelation, active: worker.active, createdAt: worker.createdAt };
  }
}
