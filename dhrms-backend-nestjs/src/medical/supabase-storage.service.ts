import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class SupabaseStorageService {
  private readonly url: string;
  private readonly bucketName: string;
  private readonly secretKey: string;

  constructor(private readonly config: ConfigService) {
    this.url = (config.get<string>('SUPABASE_URL') || '').replace(/\/$/, '');
    this.bucketName = config.get<string>('SUPABASE_STORAGE_BUCKET') || 'medical-records';
    this.secretKey = config.get<string>('SUPABASE_SECRET_KEY') || '';
  }

  private ensureConfigured() {
    if (!this.url || !this.secretKey || !this.bucketName) {
      throw new ServiceUnavailableException('Medical file storage is not configured');
    }
  }

  private objectUrl(path: string) {
    return `${this.url}/storage/v1/object/${encodeURIComponent(this.bucketName)}/${path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')}`;
  }

  private headers(contentType?: string) {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      apikey: this.secretKey,
      ...(contentType ? { 'Content-Type': contentType } : {}),
    };
  }

  async upload(path: string, buffer: Buffer, mimeType: string) {
    this.ensureConfigured();
    const response = await fetch(this.objectUrl(path), {
      method: 'POST',
      headers: { ...this.headers(mimeType), 'x-upsert': 'false', 'cache-control': 'private, no-store' },
      body: buffer,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new ServiceUnavailableException(`Medical file upload failed${detail ? `: ${detail}` : ''}`);
    }
  }

  async createReadStream(path: string) {
    this.ensureConfigured();
    const response = await fetch(this.objectUrl(path), {
      method: 'GET',
      headers: this.headers(),
    });

    if (!response.ok || !response.body) {
      await response.text().catch(() => undefined);
      throw new ServiceUnavailableException('Medical file could not be retrieved');
    }

    return Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]);
  }

  async delete(path: string) {
    this.ensureConfigured();
    const response = await fetch(`${this.url}/storage/v1/object/${encodeURIComponent(this.bucketName)}`, {
      method: 'DELETE',
      headers: { ...this.headers('application/json'), Prefer: 'return=minimal' },
      body: JSON.stringify({ prefixes: [path] }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new ServiceUnavailableException(`Medical file deletion failed${detail ? `: ${detail}` : ''}`);
    }
  }
}
