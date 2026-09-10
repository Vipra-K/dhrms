import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() request: LoginDto) {
    return this.authService.login(request);
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  getCurrentSession(@Req() request: AuthenticatedRequest) {
    if (!request.authSessionId) {
      throw new Error('Authenticated session is missing');
    }

    return this.authService.getCurrentSession(request.authSessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() request: AuthenticatedRequest) {
    if (!request.authSessionId) {
      return { message: 'Logged out successfully' };
    }

    return this.authService.logout(request.authSessionId);
  }
}
