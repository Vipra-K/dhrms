import { Controller, Delete, Get, Param, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MedicalAttachmentService } from './medical-attachment.service';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR', 'WORKER', 'HOSPITAL')
export class MedicalAttachmentController {
  constructor(private readonly attachments: MedicalAttachmentService) {}

  @Post('medical-records/:recordId/attachments')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 20 * 1024 * 1024, files: 10 } }))
  upload(@Req() req: AuthenticatedRequest, @Param('recordId') recordId: string, @UploadedFiles() files: Express.Multer.File[]) {
    return this.attachments.upload(req.user!, recordId, files);
  }

  @Get('medical-records/:recordId/attachments')
  list(@Req() req: AuthenticatedRequest, @Param('recordId') recordId: string) { return this.attachments.list(req.user!, recordId); }

  @Get('medical-record-attachments/:attachmentId')
  async download(@Req() req: AuthenticatedRequest, @Param('attachmentId') attachmentId: string, @Res() response: Response) {
    const attachment = await this.attachments.download(req.user!, attachmentId);
    response.setHeader('Content-Type', attachment.mimeType);
    response.setHeader('Content-Length', attachment.fileSize);
    response.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`);
    response.setHeader('Cache-Control', 'private, no-store');
    this.attachments.stream(attachment.storagePath).on('error', () => response.destroy()).pipe(response);
  }

  @Delete('medical-record-attachments/:attachmentId')
  revoke(@Req() req: AuthenticatedRequest, @Param('attachmentId') attachmentId: string) { return this.attachments.revoke(req.user!, attachmentId); }
}
