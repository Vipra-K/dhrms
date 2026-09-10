import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const DEFAULT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getSessionTtlMs(): number {
    const configured = Number(this.config.get<string>('JWT_EXPIRATION', `${DEFAULT_SESSION_TTL_MS}`));
    if (!Number.isFinite(configured) || configured <= 0) {
      return DEFAULT_SESSION_TTL_MS;
    }

    return configured;
  }

  async login(request: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: request.email },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(request.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const ttlMs = this.getSessionTtlMs();
    const expiresAt = new Date(Date.now() + ttlMs);
    const sessionId = randomUUID();

    await this.prisma.authSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt,
      },
    });

    const token = jwt.sign(
      {
        userId: Number(user.id),
        sid: sessionId,
      },
      secret,
      {
        subject: user.email,
        expiresIn: Math.floor(ttlMs / 1000),
        algorithm: 'HS256',
      },
    );

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      userId: Number(user.id),
      email: user.email,
      role: user.role,
    };
  }

  async logout(sessionId: string) {
    await this.prisma.authSession.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return { message: 'Logged out successfully' };
  }
}
