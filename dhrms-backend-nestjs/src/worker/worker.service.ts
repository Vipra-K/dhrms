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
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const existing = await this.prisma.user.findUnique({ where: { email: request.email } });
    if (existing) throw new Error('Email is already registered');

    const user = await this.prisma.user.create({ data: { email: request.email, passwordHash: await bcrypt.hash(request.password, 10), role: 'WORKER', status: 'ACTIVE' } });
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

    // The worker model has no hospitalId; ownership is represented by an active
    // assignment to a doctor in this hospital, so newly-created workers remain
    // discoverable by the hospital through the assignment workflow.
    return { ...this.toResponse(worker), hospitalId: Number(hospital.id) };
  }

  async getWorkers(hospitalUserId: bigint) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const workers = await this.prisma.worker.findMany({
      where: {
        assignments: { some: { hospitalId: hospital.id } },
      },
      orderBy: { createdAt: 'desc' },
    });
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
    if (!assignment) throw new NotFoundException('Worker does not belong to this hospital');

    return {
      ...this.toResponse(worker),
      assignedDoctorId: Number(assignment.doctor.id),
      assignedDoctorName: assignment.doctor.fullName,
      assignedDoctorSpecialization: assignment.doctor.specialization,
    };
  }

  async getWorkerByCode(hospitalUserId: bigint, workerCode: string) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findFirst({
      where: { workerCode, assignments: { some: { hospitalId: hospital.id } } },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return this.toResponse(worker);
  }

  async getWorkerForDoctor(doctorUserId: bigint, workerId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    const assignment = await this.prisma.doctorWorkerAssignment.findFirst({ where: { doctorId: doctor.id, workerId, active: true } });
    if (!assignment) throw new NotFoundException('Worker is not assigned to you');
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');
    return this.toResponse(worker);
  }

  async updateWorker(hospitalUserId: bigint, workerId: bigint, request: UpdateWorkerDto) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');
    const belongs = await this.prisma.doctorWorkerAssignment.findFirst({ where: { workerId, hospitalId: hospital.id } });
    if (!belongs) throw new NotFoundException('Worker does not belong to this hospital');

    const updated = await this.prisma.worker.update({ where: { id: workerId }, data: { ...request, dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : undefined } });
    return this.toResponse(updated);
  }

  async deactivateWorker(hospitalUserId: bigint, workerId: bigint) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');
    const belongs = await this.prisma.doctorWorkerAssignment.findFirst({ where: { workerId, hospitalId: hospital.id } });
    if (!belongs) throw new NotFoundException('Worker does not belong to this hospital');
    return this.toResponse(await this.prisma.worker.update({ where: { id: workerId }, data: { active: false } }));
  }

  async activateWorker(hospitalUserId: bigint, workerId: bigint) {
    const hospital = await this.getHospitalByUserId(hospitalUserId);
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');
    const belongs = await this.prisma.doctorWorkerAssignment.findFirst({ where: { workerId, hospitalId: hospital.id } });
    if (!belongs) throw new NotFoundException('Worker does not belong to this hospital');
    return this.toResponse(await this.prisma.worker.update({ where: { id: workerId }, data: { active: true } }));
  }

  async getMyProfile(userId: bigint) {
    const worker = await this.prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new NotFoundException('Worker profile not found');
    return this.toResponse(worker);
  }

  async updateMyProfile(userId: bigint, request: UpdateWorkerDto) {
    const worker = await this.prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new NotFoundException('Worker profile not found');
    const updated = await this.prisma.worker.update({ where: { id: worker.id }, data: { ...request, dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : undefined } });
    return this.toResponse(updated);
  }

  async getMyMedicalRecords(userId: bigint) {
    const worker = await this.prisma.worker.findUnique({ where: { userId } });
    if (!worker) throw new NotFoundException('Worker profile not found');
    const records = await this.prisma.medicalRecord.findMany({ where: { workerId: worker.id }, orderBy: { visitDate: 'desc' }, include: { hospital: true, doctor: true, prescriptions: true } });
    return records.map((record) => ({
      id: Number(record.id), visitDate: record.visitDate, hospitalName: record.hospital.name, doctorName: record.doctor.fullName,
      symptoms: record.symptoms, diagnosis: record.diagnosis, treatment: record.treatment, notes: record.notes,
      prescriptions: record.prescriptions.map((p) => ({ id: Number(p.id), medicineName: p.medicineName, dosage: p.dosage, frequency: p.frequency, duration: p.duration, instructions: p.instructions })),
    }));
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
