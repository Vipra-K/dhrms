import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterWorkerDto } from './dto/register-worker.dto';

@Injectable()
export class WorkerRegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registrarId: bigint, dto: RegisterWorkerDto) {
    const registrar = await this.prisma.user.findUnique({ where: { id: registrarId } });
    if (!registrar || registrar.status !== 'ACTIVE' || registrar.role !== 'REGISTRATION_OFFICER') {
      throw new ForbiddenException('Only active registration officers can register workers');
    }

    if ((dto.email && !dto.password) || (!dto.email && dto.password)) {
      throw new BadRequestException('Email and password must be provided together');
    }
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) throw new BadRequestException('Email is already registered');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = dto.email && dto.password
        ? await tx.user.create({ data: { email: dto.email, passwordHash: await bcrypt.hash(dto.password, 10), role: 'WORKER', status: 'ACTIVE' } })
        : null;

      let workerCode: string;
      do {
        workerCode = `DHRMS-WKR-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      } while (await tx.worker.findUnique({ where: { workerCode } }));

      return tx.worker.create({
        data: {
          userId: user?.id,
          registeredById: registrarId,
          registrationStatus: 'VERIFIED',
          workerCode,
          fullName: dto.fullName,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender,
          bloodGroup: dto.bloodGroup,
          phone: dto.phone,
          address: dto.address,
          emergencyContactName: dto.emergencyContactName,
          emergencyContactPhone: dto.emergencyContactPhone,
          emergencyContactRelation: dto.emergencyContactRelation,
          employerName: dto.employerName,
          worksiteName: dto.worksiteName,
          worksiteAddress: dto.worksiteAddress,
          worksiteDistrict: dto.worksiteDistrict,
          jobRole: dto.jobRole,
          active: true,
        },
      });
    });

    const qrContent = `DHRMS:${randomUUID().replace(/-/g, '')}`;
    const tokenHash = crypto.createHash('sha256').update(qrContent.substring('DHRMS:'.length), 'utf8').digest('base64');
    await this.prisma.workerQrCode.create({ data: { workerId: result.id, tokenHash, qrContent, status: 'ACTIVE' } });
    const qrImage = await QRCode.toDataURL(qrContent, { width: 400 });

    return {
      id: Number(result.id),
      workerCode: result.workerCode,
      fullName: result.fullName,
      registrationStatus: result.registrationStatus,
      qrContent,
      qrImage,
    };
  }
}
