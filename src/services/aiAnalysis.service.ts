import Groq from "groq-sdk";

interface ResumeScoreParameter {
  id: number;
  parameter: string;
  score: number;
  comments: string;
}

interface ResumeAnalysisResult {
  total_score: number;
  parameters: ResumeScoreParameter[];
}

export async function generateAIResumeAnalysis(
  resumeText: string
): Promise<ResumeAnalysisResult | null> {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in environment variables");
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = `
You are an expert Senior Technical Recruiter and Career Coach.

Evaluate the provided resume using a 15 parameter framework.

SCORING RULES
- Score each parameter from 0–10
- Provide direct, honest recruiter-level feedback
- Avoid generic comments
- Focus on impact, clarity, ATS readiness and technical strength

IMPORTANT OUTPUT RULES
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations outside JSON
- Ensure JSON is parseable

JSON STRUCTURE

{
  "total_score": number,
  "parameters": [
    {
      "id": 1,
      "parameter": "Clarity of Career Direction",
      "score": number,
      "comments": string
    }
  ]
}

PARAMETERS

1. Clarity of Career Direction
2. Professional Summary Quality
3. Relevance to Job Description
4. Achievement Orientation
5. Quantification of Impact
6. Technical Skill Depth
7. Project Quality & Complexity
8. Work Experience Strength
9. Problem-Solving & Ownership
10. Leadership & Collaboration
11. Education & Certifications
12. Resume Structure & Formatting
13. ATS Optimization
14. Professionalism & Language Quality
15. Differentiation Factor
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a highly analytical senior resume evaluator. Always return strict JSON.",
        },
        {
          role: "user",
          content: `${systemPrompt}\n\nResume:\n${resumeText}`,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) return null;

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      console.error("⚠️ JSON Parse Failed. Raw Output:", content);
      throw new Error("Model returned invalid JSON");
    }

  } catch (error: any) {
    console.error("❌ AI Analysis Error:", error?.message || error);
    throw new Error("Failed to generate AI resume analysis");
  }
}