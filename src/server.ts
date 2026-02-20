import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// CRITICAL: In Node ESM, local imports must end in .js (even if the file is .ts)
import { assessmentQueue } from './queue.js'; 

const fastify = Fastify({ logger: true });

// 1. Initialize Prisma with the PG Adapter
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Plugins
fastify.register(cors, { origin: '*' });
fastify.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload Route
fastify.post('/upload', async (request, reply) => {
  const data = await request.file();
  if (!data) return reply.status(400).send({ error: 'No file uploaded' });

  const buffer = await data.toBuffer();
  
  // Convert buffer to base64 so it serializes safely into Redis
  const fileBase64 = buffer.toString('base64');

  // Create db record
  const assessment = await prisma.assessment.create({
    data: { status: 'uploading' }
  });

  // Throw job into BullMQ
  await assessmentQueue.add('parse-resume', {
    assessmentId: assessment.id,
    fileBase64 
  });

  return reply.send({ uploadId: assessment.id });
});

// Polling Route
fastify.get('/status/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { status: true }
  });

  if (!assessment) return reply.status(404).send({ error: 'Not found' });
  return reply.send({ ready: assessment.status === 'ready', status: assessment.status });
});

// Get Questions Route
fastify.get('/test/:id/questions', async (request, reply) => {
  const { id } = request.params as { id: string };
  const questions = await prisma.question.findMany({
    where: { assessmentId: id },
    select: { id: true, text: true, options: true } 
  });
  return reply.send({ questions });
});

// Submit Test & Calculate Percentile Route
fastify.post('/test/:id/submit', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { answers } = request.body as { answers: Record<string, string> };

  const questions = await prisma.question.findMany({ where: { assessmentId: id } });
  
  // Calculate Score
  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctOption) score += 10;
    
    await prisma.question.update({
      where: { id: q.id },
      data: { userAnswer: answers[q.id] || null }
    });
  }

  // Calculate Percentile
  await prisma.$executeRaw`
    WITH Percentiles AS (
      SELECT id, percent_rank() OVER (ORDER BY score ASC) * 100 as pct
      FROM "Assessment"
      WHERE score IS NOT NULL
    )
    UPDATE "Assessment"
    SET score = ${score},
        percentile = (SELECT pct FROM Percentiles WHERE "Assessment".id = Percentiles.id),
        status = 'completed'
    WHERE id = ${id};
  `;
  
  return reply.send({ success: true, score });
});

// Start Server
const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:4000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();