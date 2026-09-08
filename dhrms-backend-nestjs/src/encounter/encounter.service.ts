import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEncounterDto } from './dto/create-encounter.dto';

@Injectable()
export class EncounterService {
  constructor(private readonly prisma: PrismaService) {}

  private async hospitalByUser(userId: bigint) {
    const hospital = await this.prisma.hospital.findUnique({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital profile not found');
    if (hospital.status !== 'ACTIVE') throw new ForbiddenException('Hospital account is not active');
    return hospital;
  }

  private async doctorByUser(userId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    if (doctor.status !== 'ACTIVE') throw new ForbiddenException('Doctor account is not active');
    if (doctor.role === 'READ_ONLY') throw new ForbiddenException('Read-only doctors cannot handle encounters');
    return doctor;
  }

  async start(hospitalUserId: bigint, dto: CreateEncounterDto) {
    const hospital = await this.hospitalByUser(hospitalUserId);
    const worker = await this.prisma.worker.findUnique({ where: { id: BigInt(dto.workerId) } });
    if (!worker || !worker.active) throw new NotFoundException('Active worker not found');

    const existing = await this.prisma.encounter.findFirst({
      where: { workerId: worker.id, status: 'ACTIVE' },
      include: { hospital: true, doctor: true },
    });
    if (existing) {
      throw new ConflictException(`Worker already has an active encounter at ${existing.hospital.name} with ${existing.doctor.fullName}`);
    }

    if (!dto.doctorId) throw new ConflictException('Select a doctor before starting the visit');
    const doctor = await this.prisma.doctor.findUnique({ where: { id: BigInt(dto.doctorId) } });
    if (!doctor || doctor.hospitalId !== hospital.id) throw new NotFoundException('Doctor not found in this hospital');
    if (doctor.status !== 'ACTIVE' || doctor.role === 'READ_ONLY') throw new ForbiddenException('Selected doctor cannot handle encounters');

    const encounter = await this.prisma.encounter.create({
      data: { workerId: worker.id, hospitalId: hospital.id, doctorId: doctor.id },
      include: { worker: true, hospital: true, doctor: true },
    });
    return this.response(encounter);
  }

  async listHospitalActive(hospitalUserId: bigint) {
    const hospital = await this.hospitalByUser(hospitalUserId);
    const encounters = await this.prisma.encounter.findMany({
      where: { hospitalId: hospital.id, status: 'ACTIVE' },
      include: { worker: true, doctor: true },
      orderBy: { startedAt: 'desc' },
    });
    return encounters.map((encounter) => this.response(encounter));
  }

  async listDoctorActive(doctorUserId: bigint) {
    const doctor = await this.doctorByUser(doctorUserId);
    const encounters = await this.prisma.encounter.findMany({
      where: { doctorId: doctor.id, status: 'ACTIVE' },
      include: { worker: true, hospital: true },
      orderBy: { startedAt: 'asc' },
    });
    return encounters.map((encounter) => this.response(encounter));
  }

  async getForDoctor(doctorUserId: bigint, encounterId: bigint) {
    const doctor = await this.doctorByUser(doctorUserId);
    const encounter = await this.prisma.encounter.findUnique({ where: { id: encounterId }, include: { worker: true, hospital: true, doctor: true, medicalRecords: { include: { prescriptions: true, attachments: { where: { status: 'ACTIVE' } } } } } });
    if (!encounter) throw new NotFoundException('Encounter not found');
    if (encounter.doctorId !== doctor.id) throw new ForbiddenException('You are not assigned to this encounter');
    return this.response(encounter);
  }

  async complete(doctorUserId: bigint, encounterId: bigint) {
    const doctor = await this.doctorByUser(doctorUserId);
    const encounter = await this.prisma.encounter.findUnique({ where: { id: encounterId } });
    if (!encounter) throw new NotFoundException('Encounter not found');
    if (encounter.doctorId !== doctor.id) throw new ForbiddenException('You are not assigned to this encounter');
    if (encounter.status !== 'ACTIVE') throw new ConflictException('Encounter is already completed');

    const completed = await this.prisma.encounter.update({
      where: { id: encounter.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { worker: true, hospital: true, doctor: true },
    });
    return this.response(completed);
  }

  async historyForWorker(userId: bigint, workerId: bigint, role: string) {
    let where: any = { workerId };
    if (role === 'HOSPITAL') {
      const hospital = await this.hospitalByUser(userId);
      where = { workerId, hospitalId: hospital.id };
    } else if (role === 'DOCTOR') {
      const doctor = await this.doctorByUser(userId);
      where = { workerId, doctorId: doctor.id };
    } else if (role !== 'WORKER') {
      throw new ForbiddenException('You are not authorized to view encounter history');
    } else {
      const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
      if (!worker || worker.userId !== userId) throw new ForbiddenException('You are not authorized to view this worker');
    }

    const encounters = await this.prisma.encounter.findMany({ where, include: { hospital: true, doctor: true }, orderBy: { startedAt: 'desc' } });
    return encounters.map((encounter) => this.response(encounter));
  }

  private response(encounter: any) {
    return {
      id: Number(encounter.id),
      workerId: Number(encounter.workerId),
      workerCode: encounter.worker?.workerCode,
      workerName: encounter.worker?.fullName,
      hospitalId: Number(encounter.hospitalId),
      hospitalName: encounter.hospital?.name,
      doctorId: Number(encounter.doctorId),
      doctorName: encounter.doctor?.fullName,
      doctorSpecialization: encounter.doctor?.specialization,
      status: encounter.status,
      startedAt: encounter.startedAt,
      completedAt: encounter.completedAt,
      createdAt: encounter.createdAt,
      updatedAt: encounter.updatedAt,
      medicalRecords: encounter.medicalRecords?.map((record: any) => ({ id: Number(record.id), visitDate: record.visitDate, diagnosis: record.diagnosis })) ?? undefined,
    };
  }
}
