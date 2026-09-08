import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseStorageService } from './supabase-storage.service';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

@Injectable()
export class MedicalAttachmentService {
  constructor(private readonly prisma: PrismaService, private readonly storage: SupabaseStorageService) {}

  private id(value: string) {
    if (!/^\d+$/.test(value)) throw new BadRequestException('Invalid attachment identifier');
    return BigInt(value);
  }

  private async recordFor(user: { id: bigint; role: string }, recordId: bigint, write = false) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Medical record not found');
    if (user.role === 'WORKER') {
      const worker = await this.prisma.worker.findUnique({ where: { userId: user.id } });
      if (!worker || worker.id !== record.workerId) throw new ForbiddenException('You are not authorized to access this medical record');
      if (write) throw new ForbiddenException('Workers cannot modify medical attachments');
      return record;
    }
    if (user.role === 'HOSPITAL') {
      const hospital = await this.prisma.hospital.findUnique({ where: { userId: user.id } });
      if (!hospital || hospital.status !== 'ACTIVE' || hospital.id !== record.hospitalId) throw new ForbiddenException('You are not authorized to access this medical record');
      if (write) throw new ForbiddenException('Hospital users cannot modify medical attachments');
      return record;
    }
    if (user.role === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findUnique({ where: { userId: user.id } });
      if (!doctor) throw new NotFoundException('Doctor profile not found');
      const assignment = await this.prisma.doctorWorkerAssignment.findFirst({ where: { doctorId: doctor.id, workerId: record.workerId, hospitalId: record.hospitalId, active: true } });
      if (!assignment) throw new ForbiddenException('You are not authorized to access this medical record');
      if (write) {
        if (doctor.status !== 'ACTIVE' || doctor.role === 'READ_ONLY') throw new ForbiddenException('Read-only or inactive doctors cannot modify medical attachments');
        if (record.doctorId !== doctor.id) throw new ForbiddenException('Only the doctor who created this visit can modify its attachments');
      }
      return record;
    }
    throw new ForbiddenException('You are not authorized to access medical attachments');
  }

  private validate(file: Express.Multer.File) {
    if (!file || !ALLOWED_TYPES.has(file.mimetype)) throw new BadRequestException('File type not supported.');
    const maxMb = file.mimetype === 'application/pdf' ? Number(process.env.PDF_MAX_SIZE_MB || 20) : Number(process.env.IMAGE_MAX_SIZE_MB || 10);
    if (!Number.isFinite(maxMb) || file.size > maxMb * 1024 * 1024) throw new BadRequestException(`File exceeds the maximum allowed size of ${maxMb} MB.`);
    if (!file.buffer?.length) throw new BadRequestException('Uploaded file is empty.');
  }

  private safeName(name: string) {
    const cleaned = name.normalize('NFKC').replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').replace(/\s+/g, ' ').trim();
    return (cleaned || 'attachment').slice(0, 180);
  }

  async upload(user: { id: bigint; role: string }, recordIdText: string, files: Express.Multer.File[]) {
    const recordId = this.id(recordIdText);
    await this.recordFor(user, recordId, true);
    if (!files?.length) throw new BadRequestException('Select at least one file to upload.');
    if (files.length > 10) throw new BadRequestException('A maximum of 10 files can be uploaded at once.');
    files.forEach((file) => this.validate(file));
    const uploaded: any[] = [];
    const storedPaths: string[] = [];
    try {
      for (const file of files) {
        const attachmentId = randomUUID();
        const fileName = this.safeName(file.originalname);
        const storagePath = `medical-records/${recordId}/${attachmentId}/${fileName}`;
        await this.storage.upload(storagePath, file.buffer, file.mimetype);
        storedPaths.push(storagePath);
        const attachment = await this.prisma.medicalRecordAttachment.create({ data: { medicalRecordId: recordId, fileName, storagePath, mimeType: file.mimetype, fileSize: file.size, uploadedById: user.id } });
        uploaded.push(this.response(attachment));
      }
    } catch (error) {
      await Promise.all(storedPaths.map((path) => this.storage.delete(path).catch(() => undefined)));
      await Promise.all(uploaded.map(async (attachment) => {
        const saved = await this.prisma.medicalRecordAttachment.findUnique({ where: { id: BigInt(attachment.id) } });
        if (saved) await this.prisma.medicalRecordAttachment.delete({ where: { id: saved.id } }).catch(() => undefined);
      }));
      throw error;
    }
    return uploaded;
  }

  async list(user: { id: bigint; role: string }, recordIdText: string) {
    const recordId = this.id(recordIdText);
    await this.recordFor(user, recordId);
    const attachments = await this.prisma.medicalRecordAttachment.findMany({ where: { medicalRecordId: recordId, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } });
    return attachments.map((attachment) => this.response(attachment));
  }

  async download(user: { id: bigint; role: string }, attachmentIdText: string) {
    const attachment = await this.prisma.medicalRecordAttachment.findUnique({ where: { id: this.id(attachmentIdText) } });
    if (!attachment || attachment.status !== 'ACTIVE') throw new NotFoundException('Medical attachment not found');
    await this.recordFor(user, attachment.medicalRecordId);
    return attachment;
  }

  async revoke(user: { id: bigint; role: string }, attachmentIdText: string) {
    const attachment = await this.prisma.medicalRecordAttachment.findUnique({ where: { id: this.id(attachmentIdText) } });
    if (!attachment || attachment.status !== 'ACTIVE') throw new NotFoundException('Medical attachment not found');
    await this.recordFor(user, attachment.medicalRecordId, true);

    // Remove the physical object from Supabase before marking the database
    // record as revoked. This prevents a revoked medical file from remaining
    // accessible in storage while the application hides it.
    await this.storage.delete(attachment.storagePath);

    const revoked = await this.prisma.medicalRecordAttachment.update({ where: { id: attachment.id }, data: { status: 'REVOKED', revokedAt: new Date(), revokedById: user.id } });
    return this.response(revoked);
  }

  stream(path: string) { return this.storage.createReadStream(path); }

  private response(attachment: any) {
    return { id: Number(attachment.id), medicalRecordId: Number(attachment.medicalRecordId), fileName: attachment.fileName, mimeType: attachment.mimeType, fileSize: attachment.fileSize, status: attachment.status, createdAt: attachment.createdAt };
  }
}
