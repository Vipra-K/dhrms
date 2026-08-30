import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerQrService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQr(workerId: bigint) {
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');

    const existing = await this.prisma.workerQrCode.findUnique({ where: { workerId } });
    if (existing) {
      await this.prisma.workerQrCode.update({
        where: { id: existing.id },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });
    }

    const rawToken = randomUUID().replace(/-/g, '');
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.workerQrCode.create({
      data: { workerId, tokenHash, status: 'ACTIVE' },
    });

    const qrContent = `DHRMS:${rawToken}`;
    const qrImage = await QRCode.toDataURL(qrContent, { width: 400});

    return {
      workerId: Number(worker.id),
      workerCode: worker.workerCode,
      qrContent,
      qrImage,
    };
  }

  async getWorkerFromQr(qrContent: string) {
    if (!qrContent || !qrContent.startsWith('DHRMS:')) {
      throw new BadRequestException('Invalid DHRMS QR code');
    }

    const rawToken = qrContent.substring('DHRMS:'.length);
    const tokenHash = this.hashToken(rawToken);
    const qrCode = await this.prisma.workerQrCode.findFirst({
      where: { tokenHash, status: 'ACTIVE' },
      include: { worker: true },
    });

    if (!qrCode) throw new BadRequestException('Invalid or revoked QR code');
    return qrCode.worker;
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token, 'utf8').digest('base64');
  }
}
