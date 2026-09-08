import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseStorageService {
  private readonly bucketName?: string;

  constructor(private readonly config: ConfigService) {
    this.bucketName = config.get<string>('FIREBASE_STORAGE_BUCKET');
    const projectId = config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = config.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
    if (this.bucketName && projectId && clientEmail && privateKey && getApps().length === 0) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), storageBucket: this.bucketName });
    }
  }

  private bucket() {
    if (!this.bucketName || getApps().length === 0) {
      throw new ServiceUnavailableException('Medical file storage is not configured');
    }
    return getStorage().bucket(this.bucketName);
  }

  async upload(path: string, buffer: Buffer, mimeType: string) {
    await this.bucket().file(path).save(buffer, {
      resumable: false,
      metadata: { contentType: mimeType, cacheControl: 'private, no-store' },
    });
  }

  createReadStream(path: string) {
    return this.bucket().file(path).createReadStream();
  }

  async delete(path: string) {
    await this.bucket().file(path).delete({ ignoreNotFound: true });
  }
}
