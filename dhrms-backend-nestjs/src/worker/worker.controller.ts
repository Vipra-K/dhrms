import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { WorkerPhoneLookupDto } from './dto/worker-phone-lookup.dto';
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

  @Post('/phone/lookup')
  lookupWorkerByPhone(@Req() _req: AuthenticatedRequest, @Body() body: WorkerPhoneLookupDto) {
    return this.workerQrService.getWorkerFromPhone(body.phone);
  }
}
