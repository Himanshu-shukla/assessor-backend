import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function generateAIResumeAnalysis(resumeText: string) {
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
3. "🎯 Market Position".

Keep the tone direct, honest, and constructive.
`;

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b", // 🔥 Best for analysis
        messages: [
            {
                role: "system",
                content:
                    "You are a highly analytical senior resume evaluator. Be structured, precise, and professional.",
            },
            {
                role: "user",
                content: systemPrompt + resumeText,
            },
        ],
        temperature: 0.7,
    });

    return completion.choices?.[0]?.message?.content || null;
}