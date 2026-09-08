import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto, DoctorRole } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  private async hospital(userId: bigint) {
    const hospital = await this.prisma.hospital.findUnique({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital profile not found');
    if (hospital.status !== 'ACTIVE') throw new ForbiddenException('Hospital account is not active');
    return hospital;
  }

  private response(doctor: any) {
    return {
      id: Number(doctor.id), fullName: doctor.fullName, email: doctor.user.email,
      specialization: doctor.specialization, licenseNumber: doctor.licenseNumber, department: doctor.department,
      role: doctor.role, status: doctor.status, workingHoursStart: doctor.workingHoursStart,
      workingHoursEnd: doctor.workingHoursEnd, hospitalId: Number(doctor.hospitalId),
    };
  }

  async getMyProfile(userId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return this.response(doctor);
  }

  async getMyDashboard(userId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [assignedWorkers, activeVisits, visitsToday, completedVisits, recentRecords, activeEncounters] = await Promise.all([
      this.prisma.doctorWorkerAssignment.count({ where: { doctorId: doctor.id, active: true } }),
      this.prisma.encounter.count({ where: { doctorId: doctor.id, status: 'ACTIVE' } }),
      this.prisma.medicalRecord.count({ where: { doctorId: doctor.id, visitDate: { gte: startOfDay, lt: endOfDay } } }),
      this.prisma.encounter.count({ where: { doctorId: doctor.id, status: 'COMPLETED', completedAt: { gte: startOfDay, lt: endOfDay } } }),
      this.prisma.medicalRecord.findMany({ where: { doctorId: doctor.id }, include: { worker: true }, orderBy: { visitDate: 'desc' }, take: 5 }),
      this.prisma.encounter.findMany({ where: { doctorId: doctor.id, status: 'ACTIVE' }, include: { worker: true, hospital: true }, orderBy: { startedAt: 'asc' }, take: 10 }),
    ]);

    return {
      doctor: this.response(doctor),
      counts: { assignedWorkers, activeVisits, visitsToday, completedVisits },
      activeVisits: activeEncounters.map((encounter) => ({
        id: Number(encounter.id), workerId: Number(encounter.workerId), workerCode: encounter.worker.workerCode,
        workerName: encounter.worker.fullName, hospitalId: Number(encounter.hospitalId), hospitalName: encounter.hospital.name,
        startedAt: encounter.startedAt,
      })),
      recentVisits: recentRecords.map((record) => ({ id: Number(record.id), visitDate: record.visitDate, workerId: Number(record.workerId), workerCode: record.worker.workerCode, workerName: record.worker.fullName, diagnosis: record.diagnosis })),
    };
  }

  async createDoctor(hospitalUserId: bigint, request: CreateDoctorDto) {
    const hospital = await this.hospital(hospitalUserId);
    if (await this.prisma.user.findUnique({ where: { email: request.email } })) throw new BadRequestException('Email is already registered');
    if (request.licenseNumber && await this.prisma.doctor.findUnique({ where: { licenseNumber: request.licenseNumber } })) throw new BadRequestException('License number is already registered');

    const doctor = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email: request.email, passwordHash: await bcrypt.hash(request.password, 10), role: 'DOCTOR', status: 'ACTIVE' } });
      return tx.doctor.create({
        data: { userId: user.id, hospitalId: hospital.id, fullName: request.fullName, specialization: request.specialization, licenseNumber: request.licenseNumber, department: request.department, role: request.role ?? DoctorRole.JUNIOR_DOCTOR, status: 'ACTIVE', workingHoursStart: request.workingHoursStart, workingHoursEnd: request.workingHoursEnd },
        include: { user: true },
      });
    });
    return this.response(doctor);
  }

  async getHospitalDoctors(hospitalUserId: bigint) {
    const hospital = await this.hospital(hospitalUserId);
    const doctors = await this.prisma.doctor.findMany({ where: { hospitalId: hospital.id }, include: { user: true }, orderBy: { fullName: 'asc' } });
    return doctors.map((doctor) => this.response(doctor));
  }

  async getDoctorsForHospital(hospitalUserId: bigint) {
    const hospital = await this.hospital(hospitalUserId);
    const doctors = await this.prisma.doctor.findMany({ where: { hospitalId: hospital.id, status: 'ACTIVE' }, include: { user: true }, orderBy: { fullName: 'asc' } });
    return doctors.map((doctor) => this.response(doctor));
  }

  async getDoctor(hospitalUserId: bigint, doctorId: bigint) {
    const hospital = await this.hospital(hospitalUserId);
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId }, include: { user: true } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.hospitalId !== hospital.id) throw new ForbiddenException('Doctor does not belong to this hospital');
    return this.response(doctor);
  }

  async updateDoctor(hospitalUserId: bigint, doctorId: bigint, request: UpdateDoctorDto) {
    const hospital = await this.hospital(hospitalUserId);
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.hospitalId !== hospital.id) throw new ForbiddenException('Doctor does not belong to this hospital');
    if (request.licenseNumber && await this.prisma.doctor.findFirst({ where: { licenseNumber: request.licenseNumber, NOT: { id: doctorId } } })) throw new BadRequestException('License number is already registered');
    const updated = await this.prisma.doctor.update({ where: { id: doctorId }, data: request, include: { user: true } });
    return this.response(updated);
  }

  async changeStatus(hospitalUserId: bigint, doctorId: bigint, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') {
    const hospital = await this.hospital(hospitalUserId);
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.hospitalId !== hospital.id) throw new ForbiddenException('Doctor does not belong to this hospital');
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.doctor.update({ where: { id: doctorId }, data: { status }, include: { user: true } });
      await tx.user.update({ where: { id: doctor.userId }, data: { status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' } });
      if (status !== 'ACTIVE') await tx.doctorWorkerAssignment.updateMany({ where: { doctorId, active: true }, data: { active: false, endedAt: new Date() } });
      return result;
    });
    return this.response(updated);
  }
}
