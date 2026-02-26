import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';

// CRITICAL: In Node ESM, local imports must end in .js
import { connectDB, Assessment, Question } from './models.js'; 
import { assessmentQueue } from './queue.js'; 
import meetingRoutes from './metting/meeting.route.js'; //Make sure this path is correct

const fastify = Fastify({ logger: true });

// Plugins
fastify.register(cors, { origin: '*' });
fastify.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Register meeting routes - add logging to confirm registration
// Register meeting routes with error handling
fastify.register(meetingRoutes, { prefix: '/api' })
  .after((err) => {
    if (err) {
      console.error('❌ Failed to register meeting routes:', err);
    } else {
      console.log('✅ Meeting routes registered with prefix /api');
    }
  });
// Add a test route to verify server is working
fastify.get('/test', async () => {
  return { message: 'Server is working' };
});

// Upload Route
fastify.post('/upload', async (request, reply) => {
  const data = await request.file();
  if (!data) return reply.status(400).send({ error: 'No file uploaded' });

  const buffer = await data.toBuffer();
  const fileBase64 = buffer.toString('base64');

  // Create db record using Mongoose
  const assessment = await Assessment.create({ status: 'uploading' });

  await assessmentQueue.add('parse-resume', {
    assessmentId: assessment._id.toString(),
    fileBase64 
  });

  return reply.send({ uploadId: assessment._id });
});

// Polling Route
fastify.get('/status/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  
  const assessment = await Assessment.findById(id).select('status');

  if (!assessment) return reply.status(404).send({ error: 'Not found' });
  return reply.send({ ready: assessment.status === 'ready', status: assessment.status });
});

// Get Questions Route
fastify.get('/test/:id/questions', async (request, reply) => {
  const { id } = request.params as { id: string };

    // Notice we added 'skill' to the select statement
    const questions = await Question.find({ assessmentId: id })
    .select('_id skill text options'); 

  const formattedQuestions = questions.map(q => ({
    id: q._id,
    skill: q.skill, // Pass skill to frontend
    text: q.text,
    options: q.options
  }));

  return reply.send({ questions: formattedQuestions });
});

// Submit Test & Calculate Percentile Route
fastify.post('/test/:id/submit', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { answers } = request.body as { answers: Record<string, string> };

  const questions = await Question.find({ assessmentId: id });
  
  let score = 0;
  // Object to track correct answers per skill
  const skillStats: Record<string, { total: number; correct: number }> = {};

  for (const q of questions) {
    const questionIdStr = q._id.toString();
    const isCorrect = answers[questionIdStr] === q.correctOption;
    const skill = q.skill || 'General';

    // Initialize skill tracking
    if (!skillStats[skill]) {
      skillStats[skill] = { total: 0, correct: 0 };
    }
    skillStats[skill].total += 1;

    if (isCorrect) {
      score += 2; // 2 points per question (50 qs = 100 max)
      skillStats[skill].correct += 1;
    }
    
    await Question.findByIdAndUpdate(q._id, { 
      userAnswer: answers[questionIdStr] || null 
    });
  }

  // --- Dynamic SWOT Generation ---
  const swotAnalysis = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    opportunities: [] as string[],
    threats: [] as string[]
  };

  // Categorize skills based on accuracy
  for (const [skill, stats] of Object.entries(skillStats)) {
    const accuracy = stats.correct / stats.total;
    
    if (accuracy >= 0.8) {
      swotAnalysis.strengths.push(`High proficiency in ${skill} (${Math.round(accuracy * 100)}% accuracy).`);
    } else if (accuracy <= 0.4) {
      swotAnalysis.weaknesses.push(`Struggled with ${skill} concepts (${Math.round(accuracy * 100)}% accuracy).`);
    } else {
      swotAnalysis.opportunities.push(`Review advanced patterns in ${skill} to bridge the gap.`);
    }
  }

  // Add a contextual threat based on performance
  if (swotAnalysis.weaknesses.length > 0) {
    swotAnalysis.threats.push(`Knowledge gaps in these areas may hinder passing senior-level technical interviews.`);
  } else {
    swotAnalysis.threats.push(`Market shift: Competitors are rapidly adopting AI-assisted workflows. Maintain your strong fundamentals while adapting.`);
  }

  // Calculate Percentile
  const totalWithScores = await Assessment.countDocuments({ score: { $ne: null } });
  const lowerOrEqualScores = await Assessment.countDocuments({ score: { $ne: null, $lte: score } });
  const percentile = totalWithScores > 0 ? (lowerOrEqualScores / totalWithScores) * 100 : 100;

  // Update Assessment
  await Assessment.findByIdAndUpdate(id, { 
    score, 
    percentile: Math.round(percentile),
    swotAnalysis, // Save SWOT to DB
    status: 'completed' 
  });
  
  // Return SWOT along with score
  return reply.send({ success: true, score, percentile: Math.round(percentile), swotAnalysis });
});

// Start Server
const start = async () => {
  try {
    await connectDB(); // Connect to MongoDB before starting Fastify
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log(`🚀 Server listening on http://localhost:4000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();