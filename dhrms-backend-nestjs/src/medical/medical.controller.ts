import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MedicalRecordDto } from './dto/medical-record.dto';
import { PrescriptionDto } from './dto/prescription.dto';
import { MedicalService } from './medical.service';

@Controller('api/doctors/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class MedicalController {
  constructor(private readonly service: MedicalService) {}

  @Get('workers/:workerId/medical-records') list(@Req() r: AuthenticatedRequest, @Param('workerId') id: string) { return this.service.listWorkerRecords(r.user!.id, BigInt(id)); }
  @Post('workers/:workerId/medical-records') create(@Req() r: AuthenticatedRequest, @Param('workerId') id: string, @Body() b: MedicalRecordDto) { return this.service.createRecord(r.user!.id, BigInt(id), b); }
  @Get('medical-records/:recordId') get(@Req() r: AuthenticatedRequest, @Param('recordId') id: string) { return this.service.getRecord(r.user!.id, BigInt(id)); }
  @Put('medical-records/:recordId') update(@Req() r: AuthenticatedRequest, @Param('recordId') id: string, @Body() b: MedicalRecordDto) { return this.service.updateRecord(r.user!.id, BigInt(id), b); }
  @Delete('medical-records/:recordId') async remove(@Req() r: AuthenticatedRequest, @Param('recordId') id: string) { await this.service.deleteRecord(r.user!.id, BigInt(id)); return; }
  @Get('medical-records/:recordId/prescriptions') prescriptions(@Req() r: AuthenticatedRequest, @Param('recordId') id: string) { return this.service.listPrescriptions(r.user!.id, BigInt(id)); }
  @Post('medical-records/:recordId/prescriptions') addPrescription(@Req() r: AuthenticatedRequest, @Param('recordId') id: string, @Body() b: PrescriptionDto) { return this.service.createPrescription(r.user!.id, BigInt(id), b); }
  @Put('prescriptions/:prescriptionId') updatePrescription(@Req() r: AuthenticatedRequest, @Param('prescriptionId') id: string, @Body() b: PrescriptionDto) { return this.service.updatePrescription(r.user!.id, BigInt(id), b); }
  @Delete('prescriptions/:prescriptionId') async removePrescription(@Req() r: AuthenticatedRequest, @Param('prescriptionId') id: string) { await this.service.deletePrescription(r.user!.id, BigInt(id)); return; }
}
