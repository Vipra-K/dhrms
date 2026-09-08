import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkerService {
  constructor(private readonly prisma: PrismaService) {}

  private async getHospitalByUserId(userId: bigint) {
    const hospital = await this.prisma.hospital.findUnique({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital profile not found');
    if (hospital.status !== 'ACTIVE') throw new ForbiddenException('Hospital account is not active');
    return hospital;
  }

  private async getOwnedWorker(hospitalUserId: bigint, workerId: bigint) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findFirst({ where: { id: workerId, hospitalId: hospital.id } });
    if (!worker) throw new NotFoundException('Worker not found in this hospital');
    return { hospital, worker };
  }

  async createWorker(hospitalUserId: bigint, request: CreateWorkerDto) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const existing = await this.prisma.user.findUnique({ where: { email: request.email } });
    if (existing) throw new BadRequestException('Email is already registered');

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: request.email, passwordHash: await bcrypt.hash(request.password, 10), role: 'WORKER', status: 'ACTIVE' },
      });

      let workerCode: string;
      do {
        workerCode = `DHRMS-WKR-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      } while (await tx.worker.findUnique({ where: { workerCode } }));

      const worker = await tx.worker.create({
        data: {
          userId: user.id,
          hospitalId: hospital.id,
          workerCode,
          fullName: request.fullName,
          dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : undefined,
          gender: request.gender,
          bloodGroup: request.bloodGroup,
          phone: request.phone,
          address: request.address,
          emergencyContactName: request.emergencyContactName,
          emergencyContactPhone: request.emergencyContactPhone,
          emergencyContactRelation: request.emergencyContactRelation,
          active: true,
        },
      });
      return worker;
    });

    return { ...this.toResponse(result), hospitalId: Number(hospital.id), assignedDoctor: null };
  }

  async getWorkers(hospitalUserId: bigint) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const workers = await this.prisma.worker.findMany({
      where: { hospitalId: hospital.id },
      include: { assignments: { where: { hospitalId: hospital.id, active: true }, include: { doctor: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
    return workers.map((worker) => this.withAssignment(this.toResponse(worker), worker.assignments[0]));
  }

  async getWorker(hospitalUserId: bigint, workerId: bigint) {
    const { worker } = await this.getOwnedWorker(hospitalUserId, workerId);
    const assignment = await this.prisma.doctorWorkerAssignment.findFirst({
      where: { workerId, active: true, hospitalId: worker.hospitalId! },
      include: { doctor: true },
    });
    return this.withAssignment(this.toResponse(worker), assignment);
  }

  async getWorkerByCode(hospitalUserId: bigint, workerCode: string) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findFirst({ where: { workerCode, hospitalId: hospital.id } });
    if (!worker) throw new NotFoundException('Worker not found');
    return this.getWorker(hospitalUserId, worker.id);
  }

  async getWorkerForDoctor(doctorUserId: bigint, workerId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    const assignment = await this.prisma.doctorWorkerAssignment.findFirst({ where: { doctorId: doctor.id, workerId, active: true }, include: { doctor: true } });
    if (!assignment) throw new NotFoundException('Worker is not assigned to you');
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');
    return this.withAssignment(this.toResponse(worker), assignment);
  }

  async updateWorker(hospitalUserId: bigint, workerId: bigint, request: UpdateWorkerDto) {
    await this.getOwnedWorker(hospitalUserId, workerId);
    const updated = await this.prisma.worker.update({
      where: { id: workerId },
      data: { ...request, dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : undefined },
    });
    return this.toResponse(updated);
  }

  async deactivateWorker(hospitalUserId: bigint, workerId: bigint) {
    await this.getOwnedWorker(hospitalUserId, workerId);
    const updated = await this.prisma.$transaction(async (tx) => {
      const worker = await tx.worker.findUnique({ where: { id: workerId } });
      if (!worker) throw new NotFoundException('Worker not found');
      await tx.doctorWorkerAssignment.updateMany({ where: { workerId, active: true }, data: { active: false, endedAt: new Date() } });
      await tx.workerQrCode.updateMany({ where: { workerId, status: 'ACTIVE' }, data: { status: 'REVOKED', revokedAt: new Date() } });
      if (worker.userId) await tx.user.update({ where: { id: worker.userId }, data: { status: 'INACTIVE' } });
      return tx.worker.update({ where: { id: workerId }, data: { active: false } });
    });
    return this.toResponse(updated);
  }

  async activateWorker(hospitalUserId: bigint, workerId: bigint) {
    await this.getOwnedWorker(hospitalUserId, workerId);
    const updated = await this.prisma.$transaction(async (tx) => {
      const worker = await tx.worker.update({ where: { id: workerId }, data: { active: true } });
      if (worker.userId) await tx.user.update({ where: { id: worker.userId }, data: { status: 'ACTIVE' } });
      return worker;
    });
    return this.toResponse(updated);
  }

  async getMyProfile(userId: bigint) {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      include: { hospital: true, assignments: { where: { active: true }, include: { doctor: true, hospital: true }, take: 1 } },
    });
    if (!worker) throw new NotFoundException('Worker profile not found');
    return {
      ...this.toResponse(worker),
      hospital: worker.hospital ? { id: Number(worker.hospital.id), code: worker.hospital.hospitalCode, name: worker.hospital.name, city: worker.hospital.city, district: worker.hospital.district } : null,
      assignedDoctor: worker.assignments[0] ? { id: Number(worker.assignments[0].doctor.id), name: worker.assignments[0].doctor.fullName, specialization: worker.assignments[0].doctor.specialization, assignedAt: worker.assignments[0].assignedAt } : null,
    };
  }

  async updateMyProfile(userId: bigint, request: UpdateWorkerDto) {
    const worker = await this.prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new NotFoundException('Worker profile not found');
    if (!worker.active) throw new ForbiddenException('Worker account is inactive');
    const updated = await this.prisma.worker.update({ where: { id: worker.id }, data: { ...request, dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : undefined } });
    return this.toResponse(updated);
  }

  async getMyMedicalRecords(userId: bigint) {
    const worker = await this.prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new NotFoundException('Worker profile not found');
    const records = await this.prisma.medicalRecord.findMany({ where: { workerId: worker.id }, orderBy: { visitDate: 'desc' }, include: { hospital: true, doctor: true, prescriptions: true, attachments: { where: { status: 'ACTIVE' } } } });
    return records.map((record) => ({
      id: Number(record.id), visitDate: record.visitDate, hospitalName: record.hospital.name, doctorName: record.doctor.fullName,
      symptoms: record.symptoms, diagnosis: record.diagnosis, treatment: record.treatment, notes: record.notes, updatedAt: record.updatedAt,
      prescriptions: record.prescriptions.map((p) => ({ id: Number(p.id), medicineName: p.medicineName, dosage: p.dosage, frequency: p.frequency, duration: p.duration, instructions: p.instructions })),
      attachments: record.attachments.map((a) => ({ id: Number(a.id), fileName: a.fileName, mimeType: a.mimeType, fileSize: a.fileSize, status: a.status, createdAt: a.createdAt })),
    }));
  }

  private withAssignment(response: any, assignment: any) {
    if (!assignment) return { ...response, assignedDoctor: null, assignedDoctorId: null, assignedDoctorName: null, assignedDoctorSpecialization: null };
    return {
      ...response,
      assignedDoctor: { id: Number(assignment.doctor.id), name: assignment.doctor.fullName, specialization: assignment.doctor.specialization, assignedAt: assignment.assignedAt },
      assignedDoctorId: Number(assignment.doctor.id), assignedDoctorName: assignment.doctor.fullName, assignedDoctorSpecialization: assignment.doctor.specialization,
    };
  }

  private toResponse(worker: any) {
    return {
      id: Number(worker.id), workerCode: worker.workerCode, fullName: worker.fullName, dateOfBirth: worker.dateOfBirth,
      gender: worker.gender, bloodGroup: worker.bloodGroup, phone: worker.phone, address: worker.address,
      emergencyContactName: worker.emergencyContactName, emergencyContactPhone: worker.emergencyContactPhone,
      emergencyContactRelation: worker.emergencyContactRelation, active: worker.active, createdAt: worker.createdAt,
    };
  }
}
