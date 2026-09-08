import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async summarizeWorkerHistory(doctorUserId: bigint, workerId: bigint) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor || doctor.status !== 'ACTIVE') throw new ForbiddenException('Only an active doctor can use the AI assistant');

    const activeEncounter = await this.prisma.encounter.findFirst({
      where: { workerId, doctorId: doctor.id, status: 'ACTIVE' },
    });
    if (!activeEncounter) throw new ForbiddenException('You are not assigned to an active visit for this worker');

    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) throw new NotFoundException('Worker not found');

    const records = await this.prisma.medicalRecord.findMany({
      where: { workerId },
      orderBy: { visitDate: 'desc' },
      take: 10,
      include: {
        doctor: true,
        hospital: true,
        prescriptions: true,
      },
    });

    const context = records.map((record) => ({
      date: record.visitDate,
      hospital: record.hospital?.name,
      doctor: record.doctor?.fullName,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes,
      prescriptions: record.prescriptions.map((p) => ({
        medicine: p.medicineName,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        instructions: p.instructions,
      })),
    }));

    if (!context.length) {
      return { summary: 'No previous medical records are available for this worker.', recordsAnalyzed: 0 };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new InternalServerErrorException('GEMINI_API_KEY is not configured');

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a medical history assistant helping a doctor review a worker's previous records.

Worker: ${worker.fullName}

Previous medical records (newest first):
${JSON.stringify(context, null, 2)}

Create a short, easy-to-read clinical history summary for the current doctor.
Include:
- important existing or recurring conditions
- recent diagnoses and symptoms
- recent medicines and prescriptions
- important previous visits
- anything from the history that the doctor should be aware of

Do not diagnose the worker, do not prescribe medicines, and do not invent information.
Use only the supplied records. If something is not present, say so.
Keep the response concise and suitable for a doctor's encounter screen.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return {
        summary: response.text?.trim() || 'The AI could not generate a summary.',
        recordsAnalyzed: context.length,
      };
    } catch (error) {
      console.error('Gemini history summary failed:', error);
      throw new InternalServerErrorException('Unable to analyze the worker history right now');
    }
  }
}
