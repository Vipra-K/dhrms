import { Controller } from '@nestjs/common';

/**
 * Permanent worker-doctor assignment endpoints are intentionally retired.
 * Doctor relationships are now represented by Encounter records.
 */
@Controller('api/assignments')
export class AssignmentController {}
