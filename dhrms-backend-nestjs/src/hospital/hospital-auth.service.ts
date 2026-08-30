import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterHospitalDto } from './dto/register-hospital.dto';

@Injectable()
export class HospitalAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async registerHospital(request: RegisterHospitalDto) {
    if (await this.prisma.user.findUnique({ where: { email: request.email } })) {
      throw new BadRequestException('Email is already registered');
    }
    if (await this.prisma.hospital.findUnique({ where: { hospitalCode: request.hospitalCode } })) {
      throw new BadRequestException('Hospital code is already registered');
    }

    const facility = await this.prisma.hfrFacility.findUnique({ where: { hfrId: request.hfrId } });
    if (!facility) throw new BadRequestException('Invalid HFR ID');
    if (facility.status !== 'ACTIVE') throw new BadRequestException('HFR facility is inactive');

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: request.email,
          passwordHash: await bcrypt.hash(request.password, 10),
          role: 'HOSPITAL',
          status: 'ACTIVE',
        },
      });

      return tx.hospital.create({
        data: {
          userId: user.id,
          hfrFacilityId: facility.id,
          hospitalCode: request.hospitalCode,
          name: request.hospitalName,
          address: request.address,
          city: request.city,
          district: request.district,
          phone: request.phone,
          status: 'ACTIVE',
        },
      });
    });

    return {
      message: 'Hospital registered successfully',
      hospitalId: Number(result.id),
      hospitalCode: result.hospitalCode,
      name: result.name,
    };
  }
}
