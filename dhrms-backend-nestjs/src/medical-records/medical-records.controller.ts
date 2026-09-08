import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get('worker/:workerId')
  getWorkerRecords(@Param('workerId') workerId: string, @Req() req: any) {
    return this.medicalRecordsService.getWorkerRecords(Number(workerId), req.user);
  }

  @Get(':recordId')
  getRecord(@Param('recordId') recordId: string, @Req() req: any) {
    return this.medicalRecordsService.getRecord(Number(recordId), req.user);
  }
}
