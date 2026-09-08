import { ForbiddenException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  private async activeEncounter(doctorId: bigint, workerId: bigint) {
    const encounter = await this.prisma.encounter.findFirst({
      where: { doctorId, workerId, status: 'ACTIVE' },
    });
    if (!encounter) throw new ForbiddenException('You are not assigned to an active visit for this worker');
    return encounter;
  }

  private assertCanWrite(doctor: any) {
    if (doctor.role === 'READ_ONLY') throw new ForbiddenException('Read-only doctors cannot modify clinical records');
    if (doctor.status !== 'ACTIVE') throw new ForbiddenException('Only active doctors can modify clinical records');
  }

  async listWorkerRecords(userId: bigint, workerId: bigint) {
    const doctor = await this.doctor(userId);
    await this.activeEncounter(doctor.id, workerId);
    const records = await this.prisma.medicalRecord.findMany({ where: { workerId }, orderBy: { visitDate: 'desc' }, include: { prescriptions: true, doctor: true, attachments: { where: { status: 'ACTIVE' } }, encounter: true } });
    return records.map(r => this.recordResponse(r, doctor.id));
  }

  async getRecord(userId: bigint, recordId: bigint) {
    const doctor = await this.doctor(userId);
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId }, include: { prescriptions: true, doctor: true, attachments: { where: { status: 'ACTIVE' } }, encounter: true } });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.activeEncounter(doctor.id, record.workerId);
    return this.recordResponse(record, doctor.id);
  }

  async createRecord(userId: bigint, workerId: bigint, dto: MedicalRecordDto) {
    const doctor = await this.doctor(userId);
    this.assertCanWrite(doctor);
    if (!dto.encounterId) throw new ConflictException('An active encounter is required to create a medical record');

    const encounter = await this.prisma.encounter.findUnique({ where: { id: BigInt(dto.encounterId) } });
    if (!encounter) throw new NotFoundException('Encounter not found');
    if (encounter.workerId !== workerId || encounter.doctorId !== doctor.id) throw new ForbiddenException('Encounter does not belong to this doctor and worker');
    if (encounter.status !== 'ACTIVE') throw new ConflictException('Cannot create a medical record for a completed encounter');

    const record = await this.prisma.medicalRecord.create({
      data: { workerId, doctorId: doctor.id, hospitalId: encounter.hospitalId, encounterId: encounter.id, visitDate: new Date(dto.visitDate), symptoms: dto.symptoms, diagnosis: dto.diagnosis, treatment: dto.treatment, notes: dto.notes },
      include: { prescriptions: true, doctor: true, attachments: true, encounter: true },
    });
    return this.recordResponse(record, doctor.id);
  }

  async updateRecord(userId: bigint, recordId: bigint, dto: MedicalRecordDto) {
    const doctor = await this.doctor(userId);
    this.assertCanWrite(doctor);
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Medical record not found');
    if (record.doctorId !== doctor.id) throw new ForbiddenException('Only the doctor who created this record can edit it');
    await this.activeEncounter(doctor.id, record.workerId);
    const updated = await this.prisma.medicalRecord.update({ where: { id: recordId }, data: { visitDate: new Date(dto.visitDate), symptoms: dto.symptoms, diagnosis: dto.diagnosis, treatment: dto.treatment, notes: dto.notes }, include: { prescriptions: true, doctor: true, attachments: { where: { status: 'ACTIVE' } }, encounter: true } });
    return this.recordResponse(updated, doctor.id);
  }

  async listPrescriptions(userId: bigint, recordId: bigint) {
    const doctor = await this.doctor(userId);
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.activeEncounter(doctor.id, record.workerId);
    const prescriptions = await this.prisma.prescription.findMany({ where: { medicalRecordId: recordId }, orderBy: { createdAt: 'desc' } });
    return prescriptions.map(p => this.prescriptionResponse(p, doctor.id));
  }

  async createPrescription(userId: bigint, recordId: bigint, dto: PrescriptionDto) {
    const doctor = await this.doctor(userId); this.assertCanWrite(doctor);
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Medical record not found');
    await this.activeEncounter(doctor.id, record.workerId);
    if (record.doctorId !== doctor.id) throw new ForbiddenException('Only the doctor who created this visit can add prescriptions');
    const p = await this.prisma.prescription.create({ data: { medicalRecordId: recordId, workerId: record.workerId, doctorId: doctor.id, medicineName: dto.medicineName, dosage: dto.dosage, frequency: dto.frequency, duration: dto.duration, instructions: dto.instructions } });
    return this.prescriptionResponse(p, doctor.id);
  }

  async updatePrescription(userId: bigint, prescriptionId: bigint, dto: PrescriptionDto) {
    const doctor = await this.doctor(userId); this.assertCanWrite(doctor);
    const p = await this.prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!p) throw new NotFoundException('Prescription not found');
    await this.activeEncounter(doctor.id, p.workerId);
    if (p.doctorId !== doctor.id) throw new ForbiddenException('Only the doctor who created this prescription can edit it');
    const updated = await this.prisma.prescription.update({ where: { id: prescriptionId }, data: { medicineName: dto.medicineName, dosage: dto.dosage, frequency: dto.frequency, duration: dto.duration, instructions: dto.instructions } });
    return this.prescriptionResponse(updated, doctor.id);
  }

  private recordResponse(r: any, currentDoctorId: bigint) {
    return { id: Number(r.id), workerId: Number(r.workerId), doctorId: Number(r.doctorId), doctorName: r.doctor?.fullName, hospitalId: Number(r.hospitalId), encounterId: r.encounterId ? Number(r.encounterId) : null, visitDate: r.visitDate, symptoms: r.symptoms, diagnosis: r.diagnosis, treatment: r.treatment, notes: r.notes, createdAt: r.createdAt, updatedAt: r.updatedAt, editable: r.doctorId === currentDoctorId, prescriptions: (r.prescriptions ?? []).map((p: any) => this.prescriptionResponse(p, currentDoctorId)), attachments: (r.attachments ?? []).map((a: any) => ({ id: Number(a.id), medicalRecordId: Number(a.medicalRecordId), fileName: a.fileName, mimeType: a.mimeType, fileSize: a.fileSize, status: a.status, createdAt: a.createdAt })) };
  }

  private prescriptionResponse(p: any, currentDoctorId: bigint) {
    return { id: Number(p.id), medicalRecordId: Number(p.medicalRecordId), workerId: Number(p.workerId), doctorId: Number(p.doctorId), medicineName: p.medicineName, dosage: p.dosage, frequency: p.frequency, duration: p.duration, instructions: p.instructions, filePath: p.filePath, createdAt: p.createdAt, editable: p.doctorId === currentDoctorId };
  }
}
