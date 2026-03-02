import Groq from "groq-sdk";

export async function generateAIResumeAnalysis(
  resumeText: string
): Promise<string | null> {
  try {
    // 🔐 Ensure API key exists
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in environment variables");
    }

    // 🔥 Create Groq client ONLY when function runs
    const groq = new Groq({
      apiKey,
    });

    const systemPrompt = `
You are an expert Senior Technical Recruiter and Career Coach. 
Evaluate the provided resume text using the following 15-parameter framework.

You MUST format the 15-parameter breakdown as a STRICT Markdown table.
Use exactly this syntax with the delimiter row (|---|---|---|---|):

| # | Parameter | Score /10 | Comments |
|---|---|---|---|
| 1 | Contact Information | 6 | Your detailed analysis here... |
| 2 | Professional Summary | 5 | Your detailed analysis here... |

Do not skip the table formatting.

After the table, provide:
1. "🏁 Final Evaluation Summary"
2. "📈 What Would Push This to 90+?"
3. "🎯 Market Position"

Keep the tone direct, honest, and constructive.
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are a highly analytical senior resume evaluator. Be structured, precise, and professional.",
        },
        {
          role: "user",
          content: `${systemPrompt}\n\nResume:\n${resumeText}`,
        },
      ],
      temperature: 0.7,
    });

    return completion.choices?.[0]?.message?.content || null;

  } catch (error: any) {
    console.error("❌ AI Analysis Error:", error?.message || error);
    throw new Error("Failed to generate AI resume analysis");
  }
}