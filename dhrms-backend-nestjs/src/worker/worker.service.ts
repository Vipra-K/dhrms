import { Injectable, NotFoundException } from '@nestjs/common';
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
    return hospital;
  }

  async createWorker(hospitalUserId: bigint, request: CreateWorkerDto) {
    await this.getHospitalByUserId(hospitalUserId);

    const existing = await this.prisma.user.findUnique({ where: { email: request.email } });
    if (existing) throw new Error('Email is already registered');

    const user = await this.prisma.user.create({
      data: {
        email: request.email,
        passwordHash: await bcrypt.hash(request.password, 10),
        role: 'WORKER',
        status: 'ACTIVE',
      },
    });

    let workerCode: string;
    do {
      workerCode = `DHRMS-WKR-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    } while (await this.prisma.worker.findUnique({ where: { workerCode } }));

    const worker = await this.prisma.worker.create({
      data: {
        userId: user.id,
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

    return this.toResponse(worker);
  }

  async getWorkers(hospitalUserId: bigint) {
    await this.getHospitalByUserId(hospitalUserId);
    const workers = await this.prisma.worker.findMany({ where: { active: true } });
    return workers.map((worker) => this.toResponse(worker));
  }

  async getWorker(hospitalUserId: bigint, workerId: bigint) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');

    const assignment = await this.prisma.doctorWorkerAssignment.findFirst({
      where: { workerId, hospitalId: hospital.id, active: true },
      include: { doctor: true },
    });

    return {
      ...this.toResponse(worker),
      ...(assignment ? {
        assignedDoctorId: Number(assignment.doctor.id),
        assignedDoctorName: assignment.doctor.fullName,
        assignedDoctorSpecialization: assignment.doctor.specialization,
      } : {}),
    };
  }

  async getWorkerByCode(hospitalUserId: bigint, workerCode: string) {
    await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findUnique({ where: { workerCode } });
    if (!worker) throw new NotFoundException('Worker not found');
    return this.toResponse(worker);
  }

  async getWorkerForDoctor(workerId: bigint) {
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');
    return this.toResponse(worker);
  }

  async updateWorker(hospitalUserId: bigint, workerId: bigint, request: UpdateWorkerDto) {
    await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');

    const updated = await this.prisma.worker.update({
      where: { id: workerId },
      data: {
        fullName: request.fullName,
        dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : undefined,
        gender: request.gender,
        bloodGroup: request.bloodGroup,
        phone: request.phone,
        address: request.address,
        emergencyContactName: request.emergencyContactName,
        emergencyContactPhone: request.emergencyContactPhone,
        emergencyContactRelation: request.emergencyContactRelation,
      },
    });
    return this.toResponse(updated);
  }

  async deactivateWorker(hospitalUserId: bigint, workerId: bigint) {
    await this.getHospitalByUserId(hospitalUserId);
    return this.toResponse(await this.prisma.worker.update({ where: { id: workerId }, data: { active: false } }));
  }

  async activateWorker(hospitalUserId: bigint, workerId: bigint) {
    await this.getHospitalByUserId(hospitalUserId);
    return this.toResponse(await this.prisma.worker.update({ where: { id: workerId }, data: { active: true } }));
  }

  async getMyProfile(userId: bigint) {
    const worker = await this.prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new NotFoundException('Worker profile not found');
    return this.toResponse(worker);
  }

  async getMyMedicalRecords(userId: bigint) {
    const worker = await this.prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new NotFoundException('Worker profile not found');

    const records = await this.prisma.medicalRecord.findMany({
      where: { workerId: worker.id },
      orderBy: { visitDate: 'desc' },
      include: { hospital: true, doctor: true },
    });

    return records.map((record) => ({
      id: Number(record.id),
      visitDate: record.visitDate,
      hospitalName: record.hospital.name,
      doctorName: record.doctor.fullName,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes,
    }));
  }

  private toResponse(worker: any) {
    return {
      id: Number(worker.id),
      workerCode: worker.workerCode,
      fullName: worker.fullName,
      dateOfBirth: worker.dateOfBirth,
      gender: worker.gender,
      bloodGroup: worker.bloodGroup,
      phone: worker.phone,
      address: worker.address,
      emergencyContactName: worker.emergencyContactName,
      emergencyContactPhone: worker.emergencyContactPhone,
      emergencyContactRelation: worker.emergencyContactRelation,
      active: worker.active,
      createdAt: worker.createdAt,
    };
  }
}
