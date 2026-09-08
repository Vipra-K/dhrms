import { Module } from '@nestjs/common';
import { MedicalController } from './medical.controller';
import { MedicalService } from './medical.service';
import { MedicalAttachmentController } from './medical-attachment.controller';
import { MedicalAttachmentService } from './medical-attachment.service';
import { SupabaseStorageService } from './supabase-storage.service';

@Module({
  controllers: [MedicalController, MedicalAttachmentController],
  providers: [MedicalService, MedicalAttachmentService, SupabaseStorageService],
  exports: [MedicalService],
})
export class MedicalModule {}
