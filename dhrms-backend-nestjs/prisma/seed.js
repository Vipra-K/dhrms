const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PASSWORD_HASH =
  '$2b$10$B3axJnOn7G/GJdy4KU37vuNKyn.slYkccV67og4a5Dhcx6ePTkfxK';

async function main() {
  console.log('Seeding DHRMS development data...');

  const facilities = [
    {
      hfrId: 'HFR-KL-001',
      name: 'Kerala Government Health Facility - Kochi',
    },
    {
      hfrId: 'HFR-KL-002',
      name: 'Kerala Government Health Facility - Ernakulam',
    },
    {
      hfrId: 'HFR-KL-003',
      name: 'Kerala Government Health Facility - Thrissur',
    },
  ];

  const facilityMap = {};
  for (const facility of facilities) {
    const row = await prisma.hfrFacility.upsert({
      where: { hfrId: facility.hfrId },
      update: { name: facility.name, status: 'ACTIVE' },
      create: { ...facility, status: 'ACTIVE' },
    });
    facilityMap[facility.hfrId] = row;
  }

  const users = [
    { email: 'officer@dhrms.test', role: 'REGISTRATION_OFFICER' },
    { email: 'kochi.hospital@dhrms.test', role: 'HOSPITAL' },
    { email: 'ernakulam.hospital@dhrms.test', role: 'HOSPITAL' },
    { email: 'thrissur.hospital@dhrms.test', role: 'HOSPITAL' },
    { email: 'doctor.arun@dhrms.test', role: 'DOCTOR' },
    { email: 'doctor.meera@dhrms.test', role: 'DOCTOR' },
    { email: 'doctor.rahul@dhrms.test', role: 'DOCTOR' },
    { email: 'doctor.anitha@dhrms.test', role: 'DOCTOR' },
  ];

  const userMap = {};
  for (const user of users) {
    userMap[user.email] = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash: PASSWORD_HASH,
        role: user.role,
        status: 'ACTIVE',
      },
      create: {
        email: user.email,
        passwordHash: PASSWORD_HASH,
        role: user.role,
        status: 'ACTIVE',
      },
    });
  }

  const hospitals = [
    {
      email: 'kochi.hospital@dhrms.test',
      hfrId: 'HFR-KL-001',
      hospitalCode: 'HOSP-KOC-001',
      name: 'Government General Hospital Kochi',
      address: 'MG Road',
      city: 'Kochi',
      district: 'Ernakulam',
      phone: '0484-0000001',
    },
    {
      email: 'ernakulam.hospital@dhrms.test',
      hfrId: 'HFR-KL-002',
      hospitalCode: 'HOSP-ERN-001',
      name: 'District Hospital Ernakulam',
      address: 'Civil Station Road',
      city: 'Kakkanad',
      district: 'Ernakulam',
      phone: '0484-0000002',
    },
    {
      email: 'thrissur.hospital@dhrms.test',
      hfrId: 'HFR-KL-003',
      hospitalCode: 'HOSP-TSR-001',
      name: 'Government Hospital Thrissur',
      address: 'MG Road',
      city: 'Thrissur',
      district: 'Thrissur',
      phone: '0487-0000003',
    },
  ];

  const hospitalMap = {};
  for (const hospital of hospitals) {
    hospitalMap[hospital.hospitalCode] = await prisma.hospital.upsert({
      where: { hospitalCode: hospital.hospitalCode },
      update: {
        userId: userMap[hospital.email].id,
        hfrFacilityId: facilityMap[hospital.hfrId].id,
        name: hospital.name,
        address: hospital.address,
        city: hospital.city,
        district: hospital.district,
        phone: hospital.phone,
        status: 'ACTIVE',
      },
      create: {
        userId: userMap[hospital.email].id,
        hfrFacilityId: facilityMap[hospital.hfrId].id,
        hospitalCode: hospital.hospitalCode,
        name: hospital.name,
        address: hospital.address,
        city: hospital.city,
        district: hospital.district,
        phone: hospital.phone,
        status: 'ACTIVE',
      },
    });
  }

  const doctors = [
    {
      email: 'doctor.arun@dhrms.test',
      hospitalCode: 'HOSP-KOC-001',
      fullName: 'Dr. Arun Kumar',
      specialization: 'General Medicine',
      licenseNumber: 'KL-DOC-1001',
      department: 'General Medicine',
      role: 'SENIOR_DOCTOR',
      start: '09:00',
      end: '17:00',
    },
    {
      email: 'doctor.meera@dhrms.test',
      hospitalCode: 'HOSP-KOC-001',
      fullName: 'Dr. Meera Nair',
      specialization: 'General Medicine',
      licenseNumber: 'KL-DOC-1002',
      department: 'General Medicine',
      role: 'JUNIOR_DOCTOR',
      start: '10:00',
      end: '18:00',
    },
    {
      email: 'doctor.rahul@dhrms.test',
      hospitalCode: 'HOSP-ERN-001',
      fullName: 'Dr. Rahul Menon',
      specialization: 'Internal Medicine',
      licenseNumber: 'KL-DOC-1003',
      department: 'Internal Medicine',
      role: 'SENIOR_DOCTOR',
      start: '09:00',
      end: '17:00',
    },
    {
      email: 'doctor.anitha@dhrms.test',
      hospitalCode: 'HOSP-TSR-001',
      fullName: 'Dr. Anitha Thomas',
      specialization: 'General Medicine',
      licenseNumber: 'KL-DOC-1004',
      department: 'General Medicine',
      role: 'JUNIOR_DOCTOR',
      start: '09:00',
      end: '17:00',
    },
  ];

  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: { userId: userMap[doctor.email].id },
      update: {
        hospitalId: hospitalMap[doctor.hospitalCode].id,
        fullName: doctor.fullName,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        department: doctor.department,
        role: doctor.role,
        status: 'ACTIVE',
        workingHoursStart: doctor.start,
        workingHoursEnd: doctor.end,
      },
      create: {
        userId: userMap[doctor.email].id,
        hospitalId: hospitalMap[doctor.hospitalCode].id,
        fullName: doctor.fullName,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        department: doctor.department,
        role: doctor.role,
        status: 'ACTIVE',
        workingHoursStart: doctor.start,
        workingHoursEnd: doctor.end,
      },
    });
  }

  console.log('DHRMS development seed completed.');
  console.log('Test password: Test@12345');
  console.log('Registration Officer: officer@dhrms.test');
  console.log('Hospitals: 3');
  console.log('Doctors: 4');
}

main()
  .catch((error) => {
    console.error('DHRMS seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
