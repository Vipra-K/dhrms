import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(_adminId: bigint, query: Record<string, string>) {
    const district = query.district?.trim() || undefined;
    const hospitalId = query.hospitalId?.trim() || undefined;
    const officerId = query.officerId?.trim() || undefined;
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    const createdAt = {
      ...(from && !Number.isNaN(from.getTime()) ? { gte: from } : {}),
      ...(to && !Number.isNaN(to.getTime()) ? { lte: to } : {}),
    };

    const workerWhere: any = {
      ...(district ? { worksiteDistrict: district } : {}),
      ...(hospitalId && /^\d+$/.test(hospitalId) ? { hospitalId: BigInt(hospitalId) } : {}),
      ...(officerId && /^\d+$/.test(officerId) ? { registeredById: BigInt(officerId) } : {}),
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
    };

    const hospitalWhere: any = {
      ...(district ? { district } : {}),
      ...(hospitalId && /^\d+$/.test(hospitalId) ? { id: BigInt(hospitalId) } : {}),
    };

    const hospitalFilterId = hospitalId && /^\d+$/.test(hospitalId) ? BigInt(hospitalId) : undefined;

    const [
      totalWorkers,
      activeWorkers,
      totalHospitals,
      activeHospitals,
      totalDoctors,
      activeDoctors,
      activeVisits,
      totalMedicalRecords,
      totalOfficers,
      workerDistricts,
      workerBloodGroups,
      officerUsers,
      officerWorkerGroups,
      hospitals,
      recentWorkers,
    ] = await Promise.all([
      this.prisma.worker.count({ where: workerWhere }),
      this.prisma.worker.count({ where: { ...workerWhere, active: true } }),
      this.prisma.hospital.count({ where: hospitalWhere }),
      this.prisma.hospital.count({ where: { ...hospitalWhere, status: 'ACTIVE' } }),
      this.prisma.doctor.count({ where: hospitalFilterId ? { hospitalId: hospitalFilterId } : undefined }),
      this.prisma.doctor.count({
        where: {
          status: 'ACTIVE',
          ...(hospitalFilterId ? { hospitalId: hospitalFilterId } : {}),
        },
      }),
      this.prisma.encounter.count({
        where: {
          status: 'ACTIVE',
          ...(hospitalFilterId ? { hospitalId: hospitalFilterId } : {}),
          ...(district ? { hospital: { district } } : {}),
        },
      }),
      this.prisma.medicalRecord.count({
        where: {
          ...(hospitalFilterId ? { hospitalId: hospitalFilterId } : {}),
          ...(district ? { hospital: { district } } : {}),
          ...(Object.keys(createdAt).length ? { createdAt } : {}),
        },
      }),
      this.prisma.user.count({ where: { role: 'REGISTRATION_OFFICER', status: 'ACTIVE' } }),
      this.prisma.worker.groupBy({
        by: ['worksiteDistrict'],
        where: workerWhere,
        _count: { _all: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.worker.groupBy({
        by: ['bloodGroup'],
        where: workerWhere,
        _count: { _all: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.user.findMany({
        where: { role: 'REGISTRATION_OFFICER' },
        select: { id: true, email: true, status: true },
        orderBy: { email: 'asc' },
      }),
      this.prisma.worker.groupBy({
        by: ['registeredById'],
        where: workerWhere,
        _count: { _all: true },
      }),
      this.prisma.hospital.findMany({
        where: hospitalWhere,
        select: {
          id: true,
          name: true,
          hospitalCode: true,
          district: true,
          city: true,
          status: true,
          _count: { select: { workers: true, doctors: true, encounters: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.worker.findMany({
        where: workerWhere,
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const monthMap = new Map<string, number>();
    for (const row of recentWorkers) {
      const key = row.createdAt.toISOString().slice(0, 7);
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    }

    return {
      generatedAt: new Date().toISOString(),
      filters: {
        district: district || null,
        hospitalId: hospitalId || null,
        officerId: officerId || null,
        from: from?.toISOString() || null,
        to: to?.toISOString() || null,
      },
      metrics: {
        totalWorkers,
        activeWorkers,
        totalOfficers,
        totalHospitals,
        activeHospitals,
        totalDoctors,
        activeDoctors,
        activeVisits,
        totalMedicalRecords,
      },
      workerByDistrict: workerDistricts.map((row) => ({
        district: row.worksiteDistrict || 'Unknown',
        count: row._count._all,
      })),
      workerByBloodGroup: workerBloodGroups.map((row) => ({
        bloodGroup: row.bloodGroup || 'Unknown',
        count: row._count._all,
      })),
      workersByOfficer: officerUsers.map((officer) => ({
        id: Number(officer.id),
        email: officer.email,
        status: officer.status,
        workerCount: officerWorkerGroups.find((row) => row.registeredById === officer.id)?._count._all || 0,
      })),
      hospitalPerformance: hospitals.map((row) => ({
        id: Number(row.id),
        name: row.name,
        code: row.hospitalCode,
        district: row.district,
        city: row.city,
        status: row.status,
        workerCount: row._count.workers,
        doctorCount: row._count.doctors,
        encounterCount: row._count.encounters,
      })),
      registrationsByMonth: Array.from(monthMap.entries()).map(([month, count]) => ({ month, count })),
    };
  }
}
