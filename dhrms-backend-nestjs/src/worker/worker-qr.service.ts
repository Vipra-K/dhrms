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
    if (existing?.status === 'ACTIVE' && existing.qrContent) {
      const qrImage = await QRCode.toDataURL(existing.qrContent, { width: 400 });
      return { workerId: Number(worker.id), workerCode: worker.workerCode, qrContent: existing.qrContent, qrImage };
    }

    const rawToken = randomUUID().replace(/-/g, '');
    const qrContent = `DHRMS:${rawToken}`;
    const tokenHash = this.hashToken(rawToken);
    if (existing) {
      await this.prisma.workerQrCode.update({ where: { id: existing.id }, data: { tokenHash, qrContent, status: 'ACTIVE', revokedAt: null } });
    } else {
      await this.prisma.workerQrCode.create({ data: { workerId, tokenHash, qrContent, status: 'ACTIVE' } });
    }
    const qrImage = await QRCode.toDataURL(qrContent, { width: 400 });
    return { workerId: Number(worker.id), workerCode: worker.workerCode, qrContent, qrImage };
  }

  async getWorkerQr(hospitalUserId: bigint, workerId: bigint) {
    const worker = await this.ownedWorker(hospitalUserId, workerId);
    const existing = await this.prisma.workerQrCode.findUnique({ where: { workerId } });
    if (!worker.active) throw new BadRequestException('Worker is inactive; their QR code is unavailable');
    if (!existing || existing.status !== 'ACTIVE' || !existing.qrContent) throw new NotFoundException('QR code not found');
    const qrImage = await QRCode.toDataURL(existing.qrContent, { width: 400 });
    return { workerId: Number(worker.id), workerCode: worker.workerCode, qrContent: existing.qrContent, qrImage };
  }

  async getWorkerFromQr(qrContent: string) {
    if (!qrContent || !qrContent.startsWith('DHRMS:')) throw new BadRequestException('Invalid DHRMS QR code');
    const rawToken = qrContent.substring('DHRMS:'.length);
    const tokenHash = this.hashToken(rawToken);
    const qrCode = await this.prisma.workerQrCode.findFirst({ where: { tokenHash, status: 'ACTIVE' }, include: { worker: true } });
    if (!qrCode) throw new BadRequestException('Invalid or revoked QR code');
    if (!qrCode.worker.active) throw new BadRequestException('Worker is inactive; QR code cannot be used');

    // Worker IDs are PostgreSQL BIGINT values. Do not return the raw Prisma
    // model here because Express JSON serialization cannot serialize BigInt.
    // Returning an explicit public DTO also prevents internal fields from
    // leaking through the QR lookup endpoint.
    return {
      id: Number(qrCode.worker.id),
      workerCode: qrCode.worker.workerCode,
      fullName: qrCode.worker.fullName,
      dateOfBirth: qrCode.worker.dateOfBirth,
      gender: qrCode.worker.gender,
      bloodGroup: qrCode.worker.bloodGroup,
      phone: qrCode.worker.phone,
      address: qrCode.worker.address,
      emergencyContactName: qrCode.worker.emergencyContactName,
      emergencyContactPhone: qrCode.worker.emergencyContactPhone,
      emergencyContactRelation: qrCode.worker.emergencyContactRelation,
      employerName: qrCode.worker.employerName,
      worksiteName: qrCode.worker.worksiteName,
      worksiteAddress: qrCode.worker.worksiteAddress,
      worksiteDistrict: qrCode.worker.worksiteDistrict,
      jobRole: qrCode.worker.jobRole,
      registrationStatus: qrCode.worker.registrationStatus,
      active: qrCode.worker.active,
    };
  }

  async revokeQr(hospitalUserId: bigint, workerId: bigint) {
    const worker = await this.ownedWorker(hospitalUserId, workerId);
    const existing = await this.prisma.workerQrCode.findUnique({ where: { workerId } });
    if (!existing) return null;
    return this.prisma.workerQrCode.update({ where: { id: existing.id }, data: { status: 'REVOKED', revokedAt: new Date() } });
  }

  private hashToken(token: string) { return crypto.createHash('sha256').update(token, 'utf8').digest('base64'); }
}
