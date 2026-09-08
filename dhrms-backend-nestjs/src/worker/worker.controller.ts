import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { WorkerQrLookupDto } from './dto/worker-qr-lookup.dto';
import { WorkerQrService } from './worker-qr.service';

@Controller('api/hospitals/workers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOSPITAL')
export class WorkerController {
  constructor(private readonly workerQrService: WorkerQrService) {}

  @Post('/qr/lookup')
  lookupWorkerByQr(@Req() _req: AuthenticatedRequest, @Body() body: WorkerQrLookupDto) {
    return this.workerQrService.getWorkerFromQr(body.qrContent);
  }
}
