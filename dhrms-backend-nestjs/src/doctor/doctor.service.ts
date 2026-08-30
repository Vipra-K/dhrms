import { Injectable, NotFoundException } from '@nestjs/common';
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
    return hospital;
  }

  private response(doctor: any) {
    return {
      id: Number(doctor.id),
      fullName: doctor.fullName,
      email: doctor.user.email,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      department: doctor.department,
      role: doctor.role,
      status: doctor.status,
      workingHoursStart: doctor.workingHoursStart,
      workingHoursEnd: doctor.workingHoursEnd,
      hospitalId: Number(doctor.hospitalId),
    };
  }

  async getMyProfile(userId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId }, include: { user: true } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return this.response(doctor);
  }

  async createDoctor(hospitalUserId: bigint, request: CreateDoctorDto) {
    const hospital = await this.hospital(hospitalUserId);
    if (await this.prisma.user.findUnique({ where: { email: request.email } })) throw new Error('Email is already registered');
    if (request.licenseNumber && await this.prisma.doctor.findUnique({ where: { licenseNumber: request.licenseNumber } })) throw new Error('License number is already registered');

    const user = await this.prisma.user.create({ data: { email: request.email, passwordHash: await bcrypt.hash(request.password, 10), role: 'DOCTOR', status: 'ACTIVE' } });
    const doctor = await this.prisma.doctor.create({
      data: {
        userId: user.id,
        hospitalId: hospital.id,
        fullName: request.fullName,
        specialization: request.specialization,
        licenseNumber: request.licenseNumber,
        department: request.department,
        role: request.role ?? DoctorRole.JUNIOR_DOCTOR,
        status: 'ACTIVE',
        workingHoursStart: request.workingHoursStart,
        workingHoursEnd: request.workingHoursEnd,
      },
      include: { user: true },
    });
    return this.response(doctor);
  }

  async getHospitalDoctors(hospitalUserId: bigint) {
    const hospital = await this.hospital(hospitalUserId);
    const doctors = await this.prisma.doctor.findMany({ where: { hospitalId: hospital.id }, include: { user: true } });
    return doctors.map((doctor) => this.response(doctor));
  }

  async getDoctorsForHospital(hospitalUserId: bigint) {
    const hospital = await this.hospital(hospitalUserId);
    const doctors = await this.prisma.doctor.findMany({ where: { hospitalId: hospital.id, status: 'ACTIVE' }, include: { user: true } });
    return doctors.map((doctor) => this.response(doctor));
  }

  async getDoctor(hospitalUserId: bigint, doctorId: bigint) {
    const hospital = await this.hospital(hospitalUserId);
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId }, include: { user: true } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.hospitalId !== hospital.id) throw new Error('Doctor does not belong to this hospital');
    return this.response(doctor);
  }

  async updateDoctor(hospitalUserId: bigint, doctorId: bigint, request: UpdateDoctorDto) {
    const hospital = await this.hospital(hospitalUserId);
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.hospitalId !== hospital.id) throw new Error('Doctor does not belong to this hospital');
    if (request.licenseNumber && await this.prisma.doctor.findFirst({ where: { licenseNumber: request.licenseNumber, NOT: { id: doctorId } } })) throw new Error('License number is already registered');

    const updated = await this.prisma.doctor.update({ where: { id: doctorId }, data: request, include: { user: true } });
    return this.response(updated);
  }

  async changeStatus(hospitalUserId: bigint, doctorId: bigint, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') {
    const hospital = await this.hospital(hospitalUserId);
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.hospitalId !== hospital.id) throw new Error('Doctor does not belong to this hospital');

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.doctor.update({ where: { id: doctorId }, data: { status }, include: { user: true } });
      await tx.user.update({ where: { id: doctor.userId }, data: { status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' } });
      return result;
    });
    return this.response(updated);
  }
}
