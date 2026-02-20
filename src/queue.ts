import 'dotenv/config';
import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PDFExtract } from 'pdf.js-extract';
import { Groq } from 'groq-sdk';

// 1. Initialize Prisma with the PG Adapter for the Worker
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Initialize Groq & PDFExtract
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const pdfExtract = new PDFExtract();

// Helper to extract text directly from a Buffer in memory
async function getPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    pdfExtract.extractBuffer(buffer, {}, (err, data) => {
      if (err) return reject(err);
      if (!data || !data.pages) return resolve("");

      let fullText = "";
      for (const page of data.pages) {
        for (const contentItem of page.content) {
          fullText += contentItem.str + " ";
        }
        fullText += "\n";
      }
      resolve(fullText);
    });
  });
}

// 3. Define the Redis connection config
const connection = { host: '127.0.0.1', port: 6379 };

// 4. Initialize Queue and Worker
export const assessmentQueue = new Queue('assessment-queue', { connection });

const worker = new Worker('assessment-queue', async job => {
  const { assessmentId, fileBase64 } = job.data;
  
  // Convert Base64 back to a binary buffer
  const fileBuffer = Buffer.from(fileBase64, 'base64');
  
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: 'parsing' }
  });

  try {
    console.log(`[Job ${job.id}] Extracting text from PDF...`);
    const resumeText = await getPdfTextFromBuffer(fileBuffer);
    const truncatedText = resumeText.substring(0, 20000); 

    console.log(`[Job ${job.id}] Sending text to Groq...`);
    // Note: We are NOT using 'stream: true' here because we want the full string 
    // returned at once to save into the database.
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert HR parser. Your job is to extract a list of professional technical and soft skills from resume text. Return ONLY a comma-separated list of skills. Do not include introductory text."
        },
        {
          role: "user",
          content: `Extract the skills from the following resume text:\n\n${truncatedText}`
        }
      ],
      model: "llama-3.1-8b-instant", 
      temperature: 0.5, 
      max_tokens: 1024,
    });

    const extractedSkills = chatCompletion.choices[0]?.message?.content?.trim() || "No skills found";
    console.log(`[Job ${job.id}] Skills extracted: ${extractedSkills}`);

    // OPTIONAL: Update the Assessment record with the extracted skills
    // Make sure you add `skills String?` to your Assessment model in schema.prisma!
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { 
        // skills: extractedSkills, // <-- Uncomment this if you add a skills column to Prisma
        status: 'ready' 
      }
    });

    // Create the Questions (You can eventually use Groq to generate these dynamically based on the skills!)
    await prisma.question.createMany({
      data: [
        {
          assessmentId,
          text: `We noticed you have experience with: ${extractedSkills.substring(0, 50)}... How do you scale WebSockets horizontally?`,
          options: [{ id: "a", text: "Sticky Sessions & Redis Pub/Sub" }, { id: "b", text: "Add RAM" }],
          correctOption: "a"
        },
        {
          assessmentId,
          text: "What is the default index type in PostgreSQL?",
          options: [{ id: "a", text: "B-Tree" }, { id: "b", text: "Hash" }],
          correctOption: "a"
        }
      ]
    });

  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'failed' }
    });
  }
}, { connection });

worker.on('completed', job => console.log(`Job ${job.id} has completed successfully!`));
worker.on('failed', (job, err) => console.log(`Job ${job?.id} has failed with ${err?.message}`));