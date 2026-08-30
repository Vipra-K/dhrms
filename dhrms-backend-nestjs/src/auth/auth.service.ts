import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

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

    const expiration = Number(this.config.get<string>('JWT_EXPIRATION', '86400000'));

    const token = jwt.sign(
      { userId: Number(user.id) },
      secret,
      {
        subject: user.email,
        expiresIn: Math.floor(expiration / 1000),
      },
    );

    return {
      token,
      userId: Number(user.id),
      email: user.email,
      role: user.role,
    };
  }
}
