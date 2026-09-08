import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterWorkerDto } from './dto/register-worker.dto';

@Injectable()
export class WorkerRegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOfficer(registrarId: bigint) {
    const registrar = await this.prisma.user.findUnique({ where: { id: registrarId } });
    if (!registrar || registrar.status !== 'ACTIVE' || registrar.role !== 'REGISTRATION_OFFICER') throw new ForbiddenException('Only active registration officers can access registration records');
  }

  private serializeWorker(worker: any) {
    return {
      id: Number(worker.id), workerCode: worker.workerCode, fullName: worker.fullName, dateOfBirth: worker.dateOfBirth,
      gender: worker.gender, bloodGroup: worker.bloodGroup, phone: worker.phone, address: worker.address,
      emergencyContactName: worker.emergencyContactName, emergencyContactPhone: worker.emergencyContactPhone,
      emergencyContactRelation: worker.emergencyContactRelation, employerName: worker.employerName, worksiteName: worker.worksiteName,
      worksiteAddress: worker.worksiteAddress, worksiteDistrict: worker.worksiteDistrict, jobRole: worker.jobRole,
      registrationStatus: worker.registrationStatus, active: worker.active, createdAt: worker.createdAt, updatedAt: worker.updatedAt,
      qrStatus: worker.qrCode?.status || 'NOT_ISSUED', qrContent: worker.qrCode?.qrContent || null, qrImage: null,
    };
  }

  async listRegisteredWorkers(registrarId: bigint, search?: string) {
    await this.assertOfficer(registrarId);
    const term = search?.trim();
    const workers = await this.prisma.worker.findMany({ where: { registeredById: registrarId, ...(term ? { OR: [
      { fullName: { contains: term, mode: 'insensitive' } }, { workerCode: { contains: term, mode: 'insensitive' } }, { phone: { contains: term, mode: 'insensitive' } },
    ] } : {}) }, include: { qrCode: true }, orderBy: { createdAt: 'desc' } });
    return workers.map((worker) => this.serializeWorker(worker));
  }

  async checkPhone(registrarId: bigint, phone: string) {
    await this.assertOfficer(registrarId);
    const normalized = phone.trim();
    if (!normalized) return { exists: false };
    const worker = await this.prisma.worker.findFirst({ where: { phone: normalized }, select: { id: true, workerCode: true, fullName: true } });
    return worker ? { exists: true, worker: { id: Number(worker.id), workerCode: worker.workerCode, fullName: worker.fullName } } : { exists: false };
  }

  async getRegisteredWorker(registrarId: bigint, workerId: bigint) {
    await this.assertOfficer(registrarId);
    const worker = await this.prisma.worker.findFirst({ where: { id: workerId, registeredById: registrarId }, include: { qrCode: true } });
    if (!worker) throw new NotFoundException('Worker was not found in your registrations');
    const result = this.serializeWorker(worker);
    if (result.qrContent) result.qrImage = await QRCode.toDataURL(result.qrContent, { width: 500, margin: 2 });
    return result;
  }

  async register(registrarId: bigint, dto: RegisterWorkerDto) {
    await this.assertOfficer(registrarId);
    if ((dto.email && !dto.password) || (!dto.email && dto.password)) throw new BadRequestException('Email and password must be provided together');
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) throw new BadRequestException('Email is already registered');
    }
    if (dto.phone) {
      const existingPhone = await this.prisma.worker.findFirst({ where: { phone: dto.phone } });
      if (existingPhone) throw new BadRequestException('A worker with this phone number is already registered');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = dto.email && dto.password ? await tx.user.create({ data: { email: dto.email, passwordHash: await bcrypt.hash(dto.password, 10), role: 'WORKER', status: 'ACTIVE' } }) : null;
      let workerCode: string;
      do { workerCode = `DHRMS-WKR-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`; } while (await tx.worker.findUnique({ where: { workerCode } }));
      return tx.worker.create({ data: {
        userId: user?.id, registeredById: registrarId, registrationStatus: 'VERIFIED', workerCode, fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined, gender: dto.gender, bloodGroup: dto.bloodGroup,
        phone: dto.phone, address: dto.address, emergencyContactName: dto.emergencyContactName, emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactRelation: dto.emergencyContactRelation, employerName: dto.employerName, worksiteName: dto.worksiteName,
        worksiteAddress: dto.worksiteAddress, worksiteDistrict: dto.worksiteDistrict, jobRole: dto.jobRole, active: true,
      } });
    });

    const qrContent = `DHRMS:${randomUUID().replace(/-/g, '')}`;
    const tokenHash = crypto.createHash('sha256').update(qrContent.substring('DHRMS:'.length), 'utf8').digest('base64');
    await this.prisma.workerQrCode.create({ data: { workerId: result.id, tokenHash, qrContent, status: 'ACTIVE' } });
    const qrImage = await QRCode.toDataURL(qrContent, { width: 400 });
    return { id: Number(result.id), workerCode: result.workerCode, fullName: result.fullName, registrationStatus: result.registrationStatus, qrContent, qrImage };
  }
}
