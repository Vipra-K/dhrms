import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AiService } from './ai.service';

@Controller('api/ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('/worker/:workerId/summary')
  getWorkerSummary(@Req() req: AuthenticatedRequest, @Param('workerId') workerId: string) {
    return this.aiService.summarizeWorkerHistory(req.user!.id, BigInt(workerId));
  }
}
