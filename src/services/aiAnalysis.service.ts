import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

interface ResumeScoreParameter {
  id: number;
  parameter: string;
  score: number;
  comments: string;
}

interface ResumeAnalysisResult {
  total_score: number;
  parameters: ResumeScoreParameter[];
  recruiter_report?: {
    strengths: string[];
    weaknesses: string[];
    risk_flags: string[];
    recommendation: string;
  };
  interview_questions?: {
    technical: string[];
    behavioral: string[];
    project_deep_dive: string[];
  };
}

interface ResumeState {
  rawResume: string;
  parsedData?: any;
  evaluations: {
    career?: { parameters: ResumeScoreParameter[] };
    tech?: { parameters: ResumeScoreParameter[] };
    impact?: { parameters: ResumeScoreParameter[] };
    ats?: { parameters: ResumeScoreParameter[] };
  };
  finalScore?: number;
  combinedParameters?: ResumeScoreParameter[];
  recruiter_report?: any;
  interview_questions?: any;
  jobDescription?: string;
}

export async function generateAIResumeAnalysis(
  resumeText: string,
  jobDescription?: string
): Promise<ResumeAnalysisResult | null> {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    let llm: ChatGroq | ChatOpenAI;

    if (groqApiKey) {
      llm = new ChatGroq({
        apiKey: groqApiKey,
        model: "openai/gpt-oss-120b", // High capability Groq model
        temperature: 0.2
      });
    } else if (openAIApiKey) {
      llm = new ChatOpenAI({
        openAIApiKey: openAIApiKey,
        modelName: "gpt-4o-mini", // Fast OpenAI model
        temperature: 0.2
      });
    } else {
      throw new Error("Missing either GROQ_API_KEY or OPENAI_API_KEY in environment variables");
    }

    const jsonParser = new JsonOutputParser();

    const createEvaluator = (prompt: string, stateKey: keyof ResumeState["evaluations"]) => async (state: ResumeState) => {
      const messages = [
        new SystemMessage(prompt),
        new HumanMessage(JSON.stringify(state.parsedData || state.rawResume))
      ];
      // Groq handles JSON mode well if prompted.
      const response = await llm.invoke(messages);

      let parsed = { parameters: [] as ResumeScoreParameter[] };
      try {
        parsed = await jsonParser.parse(response.content as string) as { parameters: ResumeScoreParameter[] };
      } catch (e) {
        console.error(`Failed to parse ${stateKey} eval`, e);
      }

      return { evaluations: { ...state.evaluations, [stateKey]: parsed } };
    };

    async function parserNode(state: ResumeState) {
      const messages = [
        new SystemMessage(`Extract structured data from the resume. Output JSON only. Format: { "basic_info": {}, "years_experience": 0, "skills": [], "experience": [], "education": [] }`),
        new HumanMessage(state.rawResume)
      ];
      const response = await llm.invoke(messages);
      let parsedData = {};
      try {
        parsedData = await jsonParser.parse(response.content as string);
      } catch (e) {
        console.error("Failed to parse resume data", e);
      }
      return { parsedData };
    }

    const careerAgentPrompt = `You are a specialized Career Trajectory AI Agent. You evaluate career progression and overall strength.
${jobDescription ? `CRITICAL: The candidate is applying for the following Job Description. Your scoring MUST heavily weigh how well their career direction and specific experiences align with these exact requirements.\nJOB DESCRIPTION:\n${jobDescription}\n` : ""}
EVALUATE THE FOLLOWING PARAMETERS (Score 0-10):
1. Clarity of Career Direction
3. Relevance to Job Description (or general industry expections)
8. Work Experience Strength
15. Differentiation Factor (What makes this candidate stand out?)

Return ONLY valid JSON in this exact structure:
{
  "parameters": [
    { "id": 1, "parameter": "Clarity of Career Direction", "score": number, "comments": "string" },
    { "id": 3, "parameter": "Relevance to Job Description", "score": number, "comments": "string" },
    { "id": 8, "parameter": "Work Experience Strength", "score": number, "comments": "string" },
    { "id": 15, "parameter": "Differentiation Factor", "score": number, "comments": "string" }
  ]
}
`;

    const techAgentPrompt = `You are a specialized Technical Depth AI Agent. You evaluate technical skills, architecture exposure, projects, and education.
${jobDescription ? `CRITICAL: The candidate is applying for the following Job Description. Your scoring MUST strictly evaluate their technical skills against the specific tech stack, frameworks, and tools mentioned in this description.\nJOB DESCRIPTION:\n${jobDescription}\n` : ""}
EVALUATE THE FOLLOWING PARAMETERS (Score 0-10):
6. Technical Skill Depth
7. Project Quality & Complexity
11. Education & Certifications

Return ONLY valid JSON in this exact structure:
{
  "parameters": [
    { "id": 6, "parameter": "Technical Skill Depth", "score": number, "comments": "string" },
    { "id": 7, "parameter": "Project Quality & Complexity", "score": number, "comments": "string" },
    { "id": 11, "parameter": "Education & Certifications", "score": number, "comments": "string" }
  ]
}
`;

    const impactAgentPrompt = `You are a specialized Achievement & Leadership AI Agent. You look closely at quantified impact, achievements, and leadership signals.
EVALUATE THE FOLLOWING PARAMETERS (Score 0-10):
4. Achievement Orientation
5. Quantification of Impact
9. Problem-Solving & Ownership
10. Leadership & Collaboration

Return ONLY valid JSON in this exact structure:
{
  "parameters": [
    { "id": 4, "parameter": "Achievement Orientation", "score": number, "comments": "string" },
    { "id": 5, "parameter": "Quantification of Impact", "score": number, "comments": "string" },
    { "id": 9, "parameter": "Problem-Solving & Ownership", "score": number, "comments": "string" },
    { "id": 10, "parameter": "Leadership & Collaboration", "score": number, "comments": "string" }
  ]
}
`;

    const atsAgentPrompt = `You are a specialized ATS Optimization AI Agent. You evaluate keyword density, formatting, ATS parsability, and professional language.
EVALUATE THE FOLLOWING PARAMETERS (Score 0-10):
2. Professional Summary Quality
12. Resume Structure & Formatting
13. ATS Optimization
14. Professionalism & Language Quality

Return ONLY valid JSON in this exact structure:
{
  "parameters": [
    { "id": 2, "parameter": "Professional Summary Quality", "score": number, "comments": "string" },
    { "id": 12, "parameter": "Resume Structure & Formatting", "score": number, "comments": "string" },
    { "id": 13, "parameter": "ATS Optimization", "score": number, "comments": "string" },
    { "id": 14, "parameter": "Professionalism & Language Quality", "score": number, "comments": "string" }
  ]
}
`;

    const interviewAgentPrompt = `You are an expert Technical Interviewer and Hiring Manager.
Based on the candidate's resume, generate specific, challenging interview questions.
Return ONLY valid JSON in this exact structure:
{
  "technical": ["question 1", "question 2"],
  "behavioral": ["question 1", "question 2"],
  "project_deep_dive": ["question 1", "question 2"]
}
`;

    const reportAgentPrompt = `You are an Executive Recruiter synthesizing a final candidate report.
Based on the candidate's parsed resume and evaluations, provide a summary report.
Return ONLY valid JSON in this exact structure:
{
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1", "point 2"],
  "risk_flags": ["point 1", "point 2"],
  "recommendation": "string (e.g., Strong Hire, Proceed with Caution, Reject)"
}
`;

    const careerNode = createEvaluator(careerAgentPrompt, "career");
    const techNode = createEvaluator(techAgentPrompt, "tech");
    const impactNode = createEvaluator(impactAgentPrompt, "impact");
    const atsNode = createEvaluator(atsAgentPrompt, "ats");

    async function interviewNode(state: ResumeState) {
        const messages = [
            new SystemMessage(interviewAgentPrompt),
            new HumanMessage(JSON.stringify(state.parsedData || state.rawResume))
        ];
        const response = await llm.invoke(messages);
        let interview_questions = {};
        try {
            interview_questions = await jsonParser.parse(response.content as string);
        } catch (e) {
            console.error("Failed to parse interview questions", e);
        }
        return { interview_questions };
    }

    async function reportNode(state: ResumeState) {
        // Feed the parsed data AND the generated parameters to the report node
        const payload = {
            parsedData: state.parsedData || state.rawResume,
            evaluations: state.evaluations
        };
        const messages = [
            new SystemMessage(reportAgentPrompt),
            new HumanMessage(JSON.stringify(payload))
        ];
        const response = await llm.invoke(messages);
        let recruiter_report = {};
        try {
            recruiter_report = await jsonParser.parse(response.content as string);
        } catch (e) {
            console.error("Failed to parse recruiter report", e);
        }
        return { recruiter_report };
    }

    async function scoreAggregatorNode(state: ResumeState) {
      const evals = state.evaluations;

      const combinedParameters: ResumeScoreParameter[] = [
        ...(evals.career?.parameters || []),
        ...(evals.tech?.parameters || []),
        ...(evals.impact?.parameters || []),
        ...(evals.ats?.parameters || []),
      ];

      combinedParameters.sort((a, b) => a.id - b.id);

      const totalRawScore = combinedParameters.reduce((acc, p) => acc + (p.score || 0), 0);
      const maxPossibleScore = 150;
      const finalScore = Math.round((totalRawScore / maxPossibleScore) * 100);

      return { finalScore, combinedParameters };
    }

    const ResumeStateAnnotation = Annotation.Root({
      rawResume: Annotation<string>({ reducer: (x, y) => y ?? x, default: () => "" }),
      parsedData: Annotation<any>({ reducer: (x, y) => y ?? x }),
      evaluations: Annotation<ResumeState["evaluations"]>({
        reducer: (x, y) => ({ ...x, ...y }),
        default: () => ({})
      }),
      finalScore: Annotation<number>({ reducer: (x, y) => y ?? x }),
      combinedParameters: Annotation<ResumeScoreParameter[]>({ reducer: (x, y) => y ?? x }),
      recruiter_report: Annotation<any>({ reducer: (x, y) => y ?? x }),
      interview_questions: Annotation<any>({ reducer: (x, y) => y ?? x }),
      jobDescription: Annotation<string | undefined>({ reducer: (x, y) => y ?? x }),
    });

    const workflow = new StateGraph(ResumeStateAnnotation)
      .addNode("parser", parserNode)
      .addNode("career", careerNode)
      .addNode("tech", techNode)
      .addNode("impact", impactNode)
      .addNode("ats", atsNode)
      .addNode("aggregator", scoreAggregatorNode)
      .addNode("interview", interviewNode)
      .addNode("report", reportNode)

      .addEdge(START, "parser")
      .addEdge("parser", "career")
      .addEdge("parser", "tech")
      .addEdge("parser", "impact")
      .addEdge("parser", "ats")
      .addEdge(["career", "tech", "impact", "ats"], "aggregator")
      .addEdge("aggregator", "interview")
      .addEdge("aggregator", "report")
      .addEdge("interview", END)
      .addEdge("report", END);

    const app = workflow.compile();

    const result = await app.invoke({ rawResume: resumeText, jobDescription });

    return {
      total_score: (result.finalScore as number) || 0,
      parameters: (result.combinedParameters as ResumeScoreParameter[]) || [],
      recruiter_report: result.recruiter_report as ResumeAnalysisResult["recruiter_report"],
      interview_questions: result.interview_questions as ResumeAnalysisResult["interview_questions"]
    };

  } catch (error: any) {
    console.error("❌ Multi-Agent AI Analysis Error:", error?.message || error);
    throw new Error("Failed to generate AI resume analysis");
  }
}