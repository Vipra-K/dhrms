const assert = require('node:assert/strict');

const BASE_URL = (process.env.DHRMS_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const PASSWORD = 'Test@12345';
const timestamp = Date.now();
const workerEmail = `e2e.worker.${timestamp}@dhrms.test`;
const workerPassword = 'Worker@12345';

let passed = 0;
let failed = 0;

async function api(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { status: response.status, body };
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

async function login(email, password = PASSWORD) {
  const result = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  assert.equal(result.status, 200, `Login failed for ${email}: ${JSON.stringify(result.body)}`);
  assert.ok(result.body?.token, `No token returned for ${email}`);
  return result.body;
}

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(`      ${error.message}`);
  }
}

async function main() {
  console.log('');
  console.log('DHRMS end-to-end flow test');
  console.log(`API: ${BASE_URL}`);
  console.log('');

  // The seed provides these accounts.
  const officer = await login('officer@dhrms.test');
  const kochiHospital = await login('kochi.hospital@dhrms.test');
  const ernakulamHospital = await login('ernakulam.hospital@dhrms.test');
  const arun = await login('doctor.arun@dhrms.test');
  const rahul = await login('doctor.rahul@dhrms.test');

  let workerId;
  let workerCode;
  let qrContent;
  let encounter1Id;
  let recordId;
  let prescriptionId;
  let encounter2Id;

  await check('Registration Officer can register a worker', async () => {
    const result = await api('/api/registration/workers', {
      method: 'POST',
      headers: auth(officer.token),
      body: JSON.stringify({
        fullName: 'DHRMS E2E Worker',
        email: workerEmail,
        password: workerPassword,
        dateOfBirth: '1995-01-15',
        gender: 'MALE',
        bloodGroup: 'O+',
        phone: '9000000000',
        address: 'E2E Worker Address',
        emergencyContactName: 'E2E Emergency Contact',
        emergencyContactPhone: '9111111111',
        emergencyContactRelation: 'Brother',
        employerName: 'E2E Construction Company',
        worksiteName: 'E2E Construction Site',
        worksiteAddress: 'Kochi, Kerala',
        worksiteDistrict: 'Ernakulam',
        jobRole: 'Construction Worker',
      }),
    });

    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body));
    assert.ok(result.body?.id, JSON.stringify(result.body));
    assert.ok(result.body?.workerCode, JSON.stringify(result.body));
    assert.ok(result.body?.qrContent?.startsWith('DHRMS:'), JSON.stringify(result.body));

    workerId = Number(result.body.id);
    workerCode = result.body.workerCode;
    qrContent = result.body.qrContent;
  });

  await check('Hospital cannot register a worker', async () => {
    const result = await api('/api/registration/workers', {
      method: 'POST',
      headers: auth(kochiHospital.token),
      body: JSON.stringify({ fullName: 'Unauthorized Worker' }),
    });
    assert.ok([401, 403].includes(result.status), JSON.stringify(result.body));
  });

  await check('Hospital can resolve the worker QR', async () => {
    const result = await api('/api/hospitals/workers/qr/lookup', {
      method: 'POST',
      headers: auth(kochiHospital.token),
      body: JSON.stringify({ qrContent }),
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.equal(Number(result.body?.id), workerId, JSON.stringify(result.body));
    assert.equal(result.body?.workerCode, workerCode, JSON.stringify(result.body));
  });

  await check('Hospital can start an encounter with its doctor', async () => {
    const result = await api('/api/encounters', {
      method: 'POST',
      headers: auth(kochiHospital.token),
      body: JSON.stringify({ workerId, doctorId: 1 }),
    });
    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body));
    encounter1Id = Number(result.body?.id);
    assert.ok(encounter1Id > 0, JSON.stringify(result.body));
    assert.equal(result.body?.status, 'ACTIVE');
    assert.equal(Number(result.body?.workerId), workerId);
    assert.equal(Number(result.body?.doctorId), 1);
  });

  await check('Second hospital cannot start a simultaneous active encounter', async () => {
    const result = await api('/api/encounters', {
      method: 'POST',
      headers: auth(ernakulamHospital.token),
      body: JSON.stringify({ workerId, doctorId: 3 }),
    });
    assert.equal(result.status, 409, JSON.stringify(result.body));
  });

  await check('Hospital active visits contains the encounter', async () => {
    const result = await api('/api/encounters/hospital/active', {
      headers: auth(kochiHospital.token),
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.ok(Array.isArray(result.body));
    assert.ok(result.body.some((item) => Number(item.id) === encounter1Id));
  });

  await check('Assigned doctor can see the active encounter', async () => {
    const result = await api('/api/encounters/doctor/active', {
      headers: auth(arun.token),
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.ok(result.body.some((item) => Number(item.id) === encounter1Id));
  });

  await check('Assigned doctor can open the encounter', async () => {
    const result = await api(`/api/encounters/doctor/${encounter1Id}`, {
      headers: auth(arun.token),
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.equal(Number(result.body?.id), encounter1Id);
    assert.equal(Number(result.body?.workerId), workerId);
  });

  await check('Wrong doctor cannot open the encounter', async () => {
    const result = await api(`/api/encounters/doctor/${encounter1Id}`, {
      headers: auth(rahul.token),
    });
    assert.equal(result.status, 403, JSON.stringify(result.body));
  });

  await check('Doctor can create a medical record only through the active encounter', async () => {
    const result = await api(`/api/doctors/me/workers/${workerId}/medical-records`, {
      method: 'POST',
      headers: auth(arun.token),
      body: JSON.stringify({
        visitDate: new Date().toISOString(),
        encounterId: encounter1Id,
        symptoms: 'Fever and body pain',
        diagnosis: 'Viral fever',
        treatment: 'Rest, hydration and symptomatic treatment',
        notes: 'DHRMS automated E2E test record',
      }),
    });
    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body));
    recordId = Number(result.body?.id);
    assert.ok(recordId > 0, JSON.stringify(result.body));
    assert.equal(Number(result.body?.encounterId), encounter1Id);
  });

  await check('Doctor can add a prescription to the medical record', async () => {
    const result = await api(`/api/doctors/me/medical-records/${recordId}/prescriptions`, {
      method: 'POST',
      headers: auth(arun.token),
      body: JSON.stringify({
        medicineName: 'Paracetamol',
        dosage: '500 mg',
        frequency: 'Twice daily',
        duration: '3 days',
        instructions: 'Take after food',
      }),
    });
    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body));
    prescriptionId = Number(result.body?.id);
    assert.ok(prescriptionId > 0, JSON.stringify(result.body));
  });

  await check('Doctor can read the prescription', async () => {
    const result = await api(`/api/doctors/me/medical-records/${recordId}/prescriptions`, {
      headers: auth(arun.token),
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.ok(Array.isArray(result.body));
    assert.ok(result.body.some((item) => Number(item.id) === prescriptionId));
  });

  await check('Doctor can complete the encounter', async () => {
    const result = await api(`/api/encounters/doctor/${encounter1Id}/complete`, {
      method: 'POST',
      headers: auth(arun.token),
    });
    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body));
    assert.equal(result.body?.status, 'COMPLETED');
    assert.ok(result.body?.completedAt);
  });

  await check('Completed encounter is no longer in doctor active visits', async () => {
    const result = await api('/api/encounters/doctor/active', {
      headers: auth(arun.token),
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.ok(!result.body.some((item) => Number(item.id) === encounter1Id));
  });

  await check('Medical record remains readable in encounter history', async () => {
    const result = await api(`/api/encounters/worker/${workerId}/history`, {
      headers: auth(arun.token),
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.ok(result.body.some((item) => Number(item.id) === encounter1Id && item.status === 'COMPLETED'));
  });

  await check('Worker can log in and view encounter history', async () => {
    const worker = await login(workerEmail, workerPassword);
    const result = await api(`/api/encounters/worker/${workerId}/history`, {
      headers: auth(worker.token),
    });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.ok(result.body.some((item) => Number(item.id) === encounter1Id));
  });

  await check('Medical record cannot be created after encounter completion', async () => {
    const result = await api(`/api/doctors/me/workers/${workerId}/medical-records`, {
      method: 'POST',
      headers: auth(arun.token),
      body: JSON.stringify({
        visitDate: new Date().toISOString(),
        encounterId: encounter1Id,
        diagnosis: 'This must fail',
      }),
    });
    assert.equal(result.status, 409, JSON.stringify(result.body));
  });

  await check('Worker can start a new encounter at another hospital after the first visit is completed', async () => {
    const result = await api('/api/encounters', {
      method: 'POST',
      headers: auth(ernakulamHospital.token),
      body: JSON.stringify({ workerId, doctorId: 3 }),
    });
    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body));
    encounter2Id = Number(result.body?.id);
    assert.ok(encounter2Id > 0);
    assert.notEqual(encounter2Id, encounter1Id);
    assert.equal(Number(result.body?.hospitalId), 2);
    assert.equal(Number(result.body?.doctorId), 3);
    assert.equal(result.body?.status, 'ACTIVE');
  });

  await check('New hospital and doctor see the new active encounter', async () => {
    const hospitalResult = await api('/api/encounters/hospital/active', {
      headers: auth(ernakulamHospital.token),
    });
    assert.equal(hospitalResult.status, 200, JSON.stringify(hospitalResult.body));
    assert.ok(hospitalResult.body.some((item) => Number(item.id) === encounter2Id));

    const doctorResult = await api('/api/encounters/doctor/active', {
      headers: auth(rahul.token),
    });
    assert.equal(doctorResult.status, 200, JSON.stringify(doctorResult.body));
    assert.ok(doctorResult.body.some((item) => Number(item.id) === encounter2Id));
  });

  await check('New encounter can be completed independently', async () => {
    const result = await api(`/api/encounters/doctor/${encounter2Id}/complete`, {
      method: 'POST',
      headers: auth(rahul.token),
    });
    assert.ok([200, 201].includes(result.status), JSON.stringify(result.body));
    assert.equal(result.body?.status, 'COMPLETED');
  });

  console.log('');
  console.log(`Result: ${passed} passed, ${failed} failed`);
  console.log('');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('FATAL  DHRMS E2E test could not start');
  console.error(error);
  process.exitCode = 1;
});
