import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async hospital(userId: bigint) {
    const hospital = await this.prisma.hospital.findUnique({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital profile not found');
    return hospital;
  }

  private async doctorByUser(userId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return doctor;
  }

  async assignWorker(hospitalUserId: bigint, workerId: bigint, doctorId: bigint) {
    const hospital = await this.hospital(hospitalUserId);
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.hospitalId !== hospital.id) throw new ForbiddenException('Doctor does not belong to this hospital');
    if (doctor.status !== 'ACTIVE') throw new BadRequestException('Doctor is not active');

    const current = await this.prisma.doctorWorkerAssignment.findFirst({ where: { workerId, hospitalId: hospital.id, active: true } });
    if (current) {
      if (current.doctorId === doctor.id) return this.response(await this.prisma.doctorWorkerAssignment.findUnique({ where: { id: current.id }, include: { doctor: true, worker: true } }));
      await this.prisma.doctorWorkerAssignment.update({ where: { id: current.id }, data: { active: false } });
    }

    const existing = await this.prisma.doctorWorkerAssignment.findUnique({ where: { doctorId_workerId_hospitalId: { doctorId, workerId, hospitalId: hospital.id } } });
    const assignment = existing
      ? await this.prisma.doctorWorkerAssignment.update({ where: { id: existing.id }, data: { active: true, assignedBy: hospitalUserId }, include: { doctor: true, worker: true } })
      : await this.prisma.doctorWorkerAssignment.create({ data: { doctorId, workerId, hospitalId: hospital.id, assignedBy: hospitalUserId, active: true }, include: { doctor: true, worker: true } });
    return this.response(assignment);
  }

  async getWorkerAssignment(hospitalUserId: bigint, workerId: bigint) {
    const hospital = await this.hospital(hospitalUserId);
    const assignment = await this.prisma.doctorWorkerAssignment.findFirst({ where: { workerId, hospitalId: hospital.id, active: true }, include: { doctor: true, worker: true } });
    if (!assignment) throw new NotFoundException('Worker is not assigned to a doctor');
    return this.response(assignment);
  }

  async getMyWorkers(doctorUserId: bigint) {
    const doctor = await this.doctorByUser(doctorUserId);
    const assignments = await this.prisma.doctorWorkerAssignment.findMany({ where: { doctorId: doctor.id, active: true }, include: { worker: true, doctor: true }, orderBy: { assignedAt: 'desc' } });
    return assignments.map(a => this.workerResponse(a.worker));
  }

  async verifyDoctorWorkerAccess(doctorUserId: bigint, workerId: bigint) {
    const doctor = await this.doctorByUser(doctorUserId);
    const assignment = await this.prisma.doctorWorkerAssignment.findFirst({ where: { workerId, hospitalId: doctor.hospitalId, doctorId: doctor.id, active: true } });
    if (!assignment) throw new ForbiddenException('You are not authorized to access this worker');
  }

  private response(a: any) {
    if (!a) return a;
    return { id: Number(a.id), workerId: Number(a.workerId), workerCode: a.worker.workerCode, doctorId: Number(a.doctorId), doctorName: a.doctor.fullName, doctorSpecialization: a.doctor.specialization, hospitalId: Number(a.hospitalId), active: a.active, assignedAt: a.assignedAt };
  }

  private workerResponse(w: any) {
    return { workerId: Number(w.id), workerCode: w.workerCode, fullName: w.fullName, dateOfBirth: w.dateOfBirth, gender: w.gender, bloodGroup: w.bloodGroup, phone: w.phone };
  }
}
