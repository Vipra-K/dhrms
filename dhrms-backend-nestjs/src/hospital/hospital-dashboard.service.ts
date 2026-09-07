import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HospitalDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: bigint) {
    const hospital = await this.prisma.hospital.findUnique({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital profile not found');

    const [workers, activeDoctors, unassignedWorkers, recentWorkers] = await Promise.all([
      this.prisma.worker.count({ where: { hospitalId: hospital.id } }),
      this.prisma.doctor.count({ where: { hospitalId: hospital.id, status: 'ACTIVE' } }),
      this.prisma.worker.count({
        where: {
          hospitalId: hospital.id,
          active: true,
          assignments: { none: { hospitalId: hospital.id, active: true } },
        },
      }),
      this.prisma.worker.findMany({
        where: { hospitalId: hospital.id },
        include: { assignments: { where: { hospitalId: hospital.id, active: true }, include: { doctor: true }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      hospital: { id: Number(hospital.id), code: hospital.hospitalCode, name: hospital.name, city: hospital.city, district: hospital.district },
      counts: { workers, activeDoctors, unassignedWorkers },
      recentWorkers: recentWorkers.map((worker) => ({
        id: Number(worker.id), workerCode: worker.workerCode, fullName: worker.fullName, active: worker.active,
        assignedDoctor: worker.assignments[0] ? { id: Number(worker.assignments[0].doctor.id), name: worker.assignments[0].doctor.fullName } : null,
      })),
    };
  }
}
