import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerQrService {
  constructor(private readonly prisma: PrismaService) {}
  private async ownedWorker(hospitalUserId: bigint, workerId: bigint) {
    const hospital = await this.prisma.hospital.findUnique({ where: { userId: hospitalUserId } });
    if (!hospital) throw new NotFoundException('Hospital profile not found');
    if (hospital.status !== 'ACTIVE') throw new ForbiddenException('Hospital account is not active');
    const worker = await this.prisma.worker.findFirst({ where: { id: workerId, hospitalId: hospital.id } });
    if (!worker) throw new ForbiddenException('Worker does not belong to this hospital');
    return worker;
  }
  async generateQr(hospitalUserId: bigint, workerId: bigint) {
    const worker = await this.ownedWorker(hospitalUserId, workerId);
    if (!worker.active) throw new BadRequestException('Cannot generate a QR code for an inactive worker');
    const existing = await this.prisma.workerQrCode.findUnique({ where: { workerId } });
    if (existing?.status === 'ACTIVE' && existing.qrContent) return { workerId: Number(worker.id), workerCode: worker.workerCode, qrContent: existing.qrContent, qrImage: await QRCode.toDataURL(existing.qrContent, { width: 400 }) };
    const rawToken = randomUUID().replace(/-/g, ''); const qrContent = `DHRMS:${rawToken}`; const tokenHash = this.hashToken(rawToken);
    if (existing) await this.prisma.workerQrCode.update({ where: { id: existing.id }, data: { tokenHash, qrContent, status: 'ACTIVE', revokedAt: null } });
    else await this.prisma.workerQrCode.create({ data: { workerId, tokenHash, qrContent, status: 'ACTIVE' } });
    return { workerId: Number(worker.id), workerCode: worker.workerCode, qrContent, qrImage: await QRCode.toDataURL(qrContent, { width: 400 }) };
  }
  async getWorkerQr(hospitalUserId: bigint, workerId: bigint) {
    const worker = await this.ownedWorker(hospitalUserId, workerId); const existing = await this.prisma.workerQrCode.findUnique({ where: { workerId } });
    if (!worker.active) throw new BadRequestException('Worker is inactive; their QR code is unavailable');
    if (!existing || existing.status !== 'ACTIVE' || !existing.qrContent) throw new NotFoundException('QR code not found');
    return { workerId: Number(worker.id), workerCode: worker.workerCode, qrContent: existing.qrContent, qrImage: await QRCode.toDataURL(existing.qrContent, { width: 400 }) };
  }
  async getWorkerFromQr(hospitalUserId: bigint, qrContent: string) {
    if (!qrContent || !qrContent.startsWith('DHRMS:')) throw new BadRequestException('Invalid DHRMS QR code');
    const tokenHash = this.hashToken(qrContent.substring('DHRMS:'.length));
    const qrCode = await this.prisma.workerQrCode.findFirst({ where: { tokenHash, status: 'ACTIVE' }, include: { worker: true } });
    if (!qrCode) throw new BadRequestException('Invalid or revoked QR code');
    if (!qrCode.worker.active) throw new BadRequestException('Worker is inactive; QR code cannot be used');
    return this.toLookupResponse(hospitalUserId, qrCode.worker);
  }
  async getWorkerFromPhone(hospitalUserId: bigint, phone: string) {
    const normalizedPhone = phone.replace(/\s+/g, '').trim(); if (!normalizedPhone) throw new BadRequestException('Phone number is required');
    const worker = await this.prisma.worker.findFirst({ where: { phone: normalizedPhone, active: true } });
    if (!worker) throw new NotFoundException('Worker not found'); return this.toLookupResponse(hospitalUserId, worker);
  }
  async getWorkerFromCode(hospitalUserId: bigint, workerCode: string) {
    const code = workerCode.trim(); if (!code) throw new BadRequestException('Worker ID is required');
    const worker = await this.prisma.worker.findFirst({ where: { workerCode: code, active: true } });
    if (!worker) throw new NotFoundException('Worker not found'); return this.toLookupResponse(hospitalUserId, worker);
  }
  async revokeQr(hospitalUserId: bigint, workerId: bigint) {
    const worker = await this.ownedWorker(hospitalUserId, workerId); const existing = await this.prisma.workerQrCode.findUnique({ where: { workerId } });
    if (!existing) return null; return this.prisma.workerQrCode.update({ where: { id: existing.id }, data: { status: 'REVOKED', revokedAt: new Date() } });
  }
  private async toLookupResponse(hospitalUserId: bigint, worker: any) {
    const hospital = await this.prisma.hospital.findUnique({ where: { userId: hospitalUserId } }); if (!hospital) throw new NotFoundException('Hospital profile not found');
    const hospitalRelationshipStatus = worker.hospitalId === hospital.id ? 'ACTIVE' : worker.hospitalId === null ? 'AVAILABLE' : 'OTHER_HOSPITAL';
    return { id: Number(worker.id), workerCode: worker.workerCode, fullName: worker.fullName, dateOfBirth: worker.dateOfBirth, gender: worker.gender, bloodGroup: worker.bloodGroup, phone: worker.phone, address: worker.address, emergencyContactName: worker.emergencyContactName, emergencyContactPhone: worker.emergencyContactPhone, emergencyContactRelation: worker.emergencyContactRelation, employerName: worker.employerName, worksiteName: worker.worksiteName, worksiteAddress: worker.worksiteAddress, worksiteDistrict: worker.worksiteDistrict, jobRole: worker.jobRole, registrationStatus: worker.registrationStatus, active: worker.active, hospitalRelationshipStatus };
  }
  private hashToken(token: string) { return crypto.createHash('sha256').update(token, 'utf8').digest('base64'); }
}
