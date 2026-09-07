import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MedicalRecordDto } from './dto/medical-record.dto';
import { PrescriptionDto } from './dto/prescription.dto';

@Injectable()
export class MedicalService {
  constructor(private readonly prisma: PrismaService) {}

  private async doctor(userId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return doctor;
  }

  private async access(doctorId: bigint, workerId: bigint) {
    const assignment = await this.prisma.doctorWorkerAssignment.findFirst({ where: { doctorId, workerId, active: true } });
    if (!assignment) throw new ForbiddenException('You are not authorized to access this worker');
    return assignment;
  }

  async listWorkerRecords(userId: bigint, workerId: bigint) {
    const doctor = await this.doctor(userId); await this.access(doctor.id, workerId);
    const records = await this.prisma.medicalRecord.findMany({ where: { workerId }, orderBy: { visitDate: 'desc' }, include: { prescriptions: true, doctor: true } });
    return records.map(r => this.recordResponse(r, doctor.id));
  }

  async getRecord(userId: bigint, recordId: bigint) {
    const doctor = await this.doctor(userId);
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId }, include: { prescriptions: true, doctor: true } });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.access(doctor.id, record.workerId);
    return this.recordResponse(record, doctor.id);
  }

  async createRecord(userId: bigint, workerId: bigint, dto: MedicalRecordDto) {
    const doctor = await this.doctor(userId); const assignment = await this.access(doctor.id, workerId);
    const record = await this.prisma.medicalRecord.create({ data: { workerId, doctorId: doctor.id, hospitalId: assignment.hospitalId, visitDate: new Date(dto.visitDate), symptoms: dto.symptoms, diagnosis: dto.diagnosis, treatment: dto.treatment, notes: dto.notes }, include: { prescriptions: true, doctor: true } });
    return this.recordResponse(record, doctor.id);
  }

  async updateRecord(userId: bigint, recordId: bigint, dto: MedicalRecordDto) {
    const doctor = await this.doctor(userId);
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.access(doctor.id, record.workerId);
    if (record.doctorId !== doctor.id) throw new ForbiddenException('Only the doctor who created this record can edit it');
    const updated = await this.prisma.medicalRecord.update({ where: { id: recordId }, data: { visitDate: new Date(dto.visitDate), symptoms: dto.symptoms, diagnosis: dto.diagnosis, treatment: dto.treatment, notes: dto.notes }, include: { prescriptions: true, doctor: true } });
    return this.recordResponse(updated, doctor.id);
  }

  async listPrescriptions(userId: bigint, recordId: bigint) {
    const doctor = await this.doctor(userId);
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.access(doctor.id, record.workerId);
    const prescriptions = await this.prisma.prescription.findMany({ where: { medicalRecordId: recordId }, orderBy: { createdAt: 'desc' } });
    return prescriptions.map(p => this.prescriptionResponse(p, doctor.id));
  }

  async createPrescription(userId: bigint, recordId: bigint, dto: PrescriptionDto) {
    const doctor = await this.doctor(userId);
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.access(doctor.id, record.workerId);
    if (record.doctorId !== doctor.id) throw new ForbiddenException('Only the doctor who created this visit can add prescriptions');
    const p = await this.prisma.prescription.create({ data: { medicalRecordId: recordId, workerId: record.workerId, doctorId: doctor.id, medicineName: dto.medicineName, dosage: dto.dosage, frequency: dto.frequency, duration: dto.duration, instructions: dto.instructions } });
    return this.prescriptionResponse(p, doctor.id);
  }

  async updatePrescription(userId: bigint, prescriptionId: bigint, dto: PrescriptionDto) {
    const doctor = await this.doctor(userId);
    const p = await this.prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!p) throw new NotFoundException('Prescription not found');
    await this.access(doctor.id, p.workerId);
    if (p.doctorId !== doctor.id) throw new ForbiddenException('Only the doctor who created this prescription can edit it');
    const updated = await this.prisma.prescription.update({ where: { id: prescriptionId }, data: { medicineName: dto.medicineName, dosage: dto.dosage, frequency: dto.frequency, duration: dto.duration, instructions: dto.instructions } });
    return this.prescriptionResponse(updated, doctor.id);
  }

  private recordResponse(r: any, currentDoctorId: bigint) {
    return { id: Number(r.id), workerId: Number(r.workerId), doctorId: Number(r.doctorId), doctorName: r.doctor?.fullName, hospitalId: Number(r.hospitalId), visitDate: r.visitDate, symptoms: r.symptoms, diagnosis: r.diagnosis, treatment: r.treatment, notes: r.notes, createdAt: r.createdAt, updatedAt: r.updatedAt, editable: r.doctorId === currentDoctorId, prescriptions: (r.prescriptions ?? []).map((p: any) => this.prescriptionResponse(p, currentDoctorId)) };
  }

  private prescriptionResponse(p: any, currentDoctorId: bigint) {
    return { id: Number(p.id), medicalRecordId: Number(p.medicalRecordId), workerId: Number(p.workerId), doctorId: Number(p.doctorId), medicineName: p.medicineName, dosage: p.dosage, frequency: p.frequency, duration: p.duration, instructions: p.instructions, filePath: p.filePath, createdAt: p.createdAt, editable: p.doctorId === currentDoctorId };
  }
}
