// queue.ts (Updated Worker Logic)
import 'dotenv/config';
import { Queue, Worker } from 'bullmq';
import { PDFExtract } from 'pdf.js-extract';
import { Groq } from 'groq-sdk';
import { Assessment, Question } from './models.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const pdfExtract = new PDFExtract();
const connection = { host: '127.0.0.1', port: 6379 };

export const assessmentQueue = new Queue('assessment-queue', { connection });

// Helper to safely parse JSON from LLM outputs
function extractJSON(text: string) {
  try {
    const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch (e) {
    return null;
  }
}

async function getPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  // ... (Keep your existing getPdfTextFromBuffer function unchanged)
  return new Promise((resolve, reject) => {
    pdfExtract.extractBuffer(buffer, {}, (err, data) => {
      if (err) return reject(err);
      if (!data || !data.pages) return resolve("");
      let fullText = "";
      for (const page of data.pages) {
        for (const contentItem of page.content) fullText += contentItem.str + " ";
        fullText += "\n";
      }
      resolve(fullText);
    });
  });
}

const worker = new Worker('assessment-queue', async job => {
  const { assessmentId, fileBase64 } = job.data;
  const fileBuffer = Buffer.from(fileBase64, 'base64');
  
  await Assessment.findByIdAndUpdate(assessmentId, { status: 'parsing' });

  try {
    const resumeText = await getPdfTextFromBuffer(fileBuffer);
    const truncatedText = resumeText.substring(0, 20000); 

    // --- STEP 1: Extract Top 5 Skills ---
    console.log(`[Job ${job.id}] Extracting top 5 skills...`);
    const skillCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert HR parser. Return a JSON array of strings representing the top 5 technical skills from the resume. Example: [\"React\", \"Node.js\", \"AWS\", \"Python\", \"Docker\"]. Return ONLY valid JSON." },
        { role: "user", content: `Resume text:\n\n${truncatedText}` }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1, // Low temperature for more deterministic JSON
    });

    const extractedSkills = extractJSON(skillCompletion.choices[0]?.message?.content || '[]');
    const topSkills = (Array.isArray(extractedSkills) && extractedSkills.length > 0) 
      ? extractedSkills.slice(0, 5) 
      : ["JavaScript", "Backend Development", "System Design", "Databases", "API Design"]; // Fallback

    console.log(`[Job ${job.id}] Identified Skills:`, topSkills);

    // --- STEP 2: Generate 10 Questions per Skill ---
    const allQuestions : any = [];
    
    // Using a sequential loop instead of Promise.all to avoid Groq Free-Tier Rate Limits
    for (const skill of topSkills) {
      console.log(`[Job ${job.id}] Generating 10 questions for ${skill}...`);
      
      const questionCompletion = await groq.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are a technical interviewer. Generate exactly 10 multiple-choice questions for the skill: "${skill}". 
            Return strictly a JSON array of objects. Format: 
            [{"text": "Question?", "options": [{"id": "a", "text": "Opt 1"}, {"id": "b", "text": "Opt 2"}, {"id": "c", "text": "Opt 3"}, {"id": "d", "text": "Opt 4"}], "correctOption": "a"}]
            Return ONLY valid JSON.` 
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
        max_tokens: 2000, 
      });

      const parsedQuestions = extractJSON(questionCompletion.choices[0]?.message?.content || '[]');
      
      if (Array.isArray(parsedQuestions)) {
        parsedQuestions.forEach(q => {
          if (q.text && q.options && q.correctOption) {
            allQuestions.push({
              assessmentId,
              skill,      // Add the skill context
              text: q.text,
              options: q.options,
              correctOption: q.correctOption
            });
          }
        });
      }
    }

    // --- STEP 3: Save to Database ---
    await Assessment.findByIdAndUpdate(assessmentId, { 
      status: 'ready',
      resumeText: truncatedText,
      extractedStack: { topSkills } 
    });

    if (allQuestions.length > 0) {
      await Question.insertMany(allQuestions);
      console.log(`[Job ${job.id}] Successfully generated ${allQuestions.length} questions.`);
    } else {
      throw new Error("Failed to parse valid questions from AI response.");
    }

  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    await Assessment.findByIdAndUpdate(assessmentId, { status: 'failed' });
  }
}, { connection });

worker.on('completed', job => console.log(`Job ${job.id} has completed successfully!`));
worker.on('failed', (job, err) => console.log(`Job ${job?.id} has failed with ${err?.message}`));