import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: bigint;
    email: string;
    role: string;
    status: string;
  };
  authSessionId?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required');
    }

    const token = header.substring(7).trim();
    if (!token) throw new UnauthorizedException('Authentication required');

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) throw new UnauthorizedException('JWT secret is not configured');

    try {
      const payload = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload & { userId?: number; sid?: string };

      if (payload.userId === undefined || !payload.sid) {
        throw new UnauthorizedException('Invalid token');
      }

      const session = await this.prisma.authSession.findUnique({
        where: { id: payload.sid },
        include: { user: true },
      });

      if (
        !session ||
        session.userId !== BigInt(payload.userId) ||
        session.revokedAt !== null ||
        session.expiresAt.getTime() <= Date.now() ||
        session.user.status !== 'ACTIVE'
      ) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      request.user = session.user;
      request.authSessionId = session.id;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
