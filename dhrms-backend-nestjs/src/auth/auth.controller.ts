import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() request: LoginDto) {
    return this.authService.login(request);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: AuthenticatedRequest) {
    const sessionId = request.authSessionId;
    if (!sessionId) {
      return { message: 'Logged out successfully' };
    }

    return this.authService.logout(sessionId);
  }
}
