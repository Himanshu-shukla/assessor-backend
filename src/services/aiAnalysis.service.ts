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
    career_trajectory?: {
      skill_gaps: string[];
      career_paths?: {
        role: string;
        salary: string;
      }[];
      rejection_simulation?: {
        rejection_time_seconds: number;
        rejection_reasons: string[];
      };
      salary_growth_prediction?: {
        current_expected_3yr: string;
        target_expected_3yr: string;
        skills_to_learn: string[];
      };
      strategic_career_guidance?: {
        current_path_growth_probability: number;
        better_paths: {
          current_role: string;
          target_role: string;
          salary_growth_percentage: number;
        }[];
      };
    };
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

CRITICAL INSTRUCTION: For "comments", DO NOT provide explanations or long paragraphs. Provide ONLY 1-2 short, impactful bullet points.

Return ONLY valid JSON in this exact structure:
{
  "parameters": [
    { "id": 1, "parameter": "Clarity of Career Direction", "score": number, "comments": "• Short point 1" },
    { "id": 3, "parameter": "Relevance to Job Description", "score": number, "comments": "• Short point 1" },
    { "id": 8, "parameter": "Work Experience Strength", "score": number, "comments": "• Short point 1" },
    { "id": 15, "parameter": "Differentiation Factor", "score": number, "comments": "• Short point 1" }
  ]
}
`;

    const techAgentPrompt = `You are a specialized Technical Depth AI Agent. You evaluate technical skills, architecture exposure, projects, and education.
${jobDescription ? `CRITICAL: The candidate is applying for the following Job Description. Your scoring MUST strictly evaluate their technical skills against the specific tech stack, frameworks, and tools mentioned in this description.\nJOB DESCRIPTION:\n${jobDescription}\n` : ""}
EVALUATE THE FOLLOWING PARAMETERS (Score 0-10):
6. Technical Skill Depth
7. Project Quality & Complexity
11. Education & Certifications

CRITICAL INSTRUCTION: For "comments", DO NOT provide explanations or long paragraphs. Provide ONLY 1-2 short, impactful bullet points.

Return ONLY valid JSON in this exact structure:
{
  "parameters": [
    { "id": 6, "parameter": "Technical Skill Depth", "score": number, "comments": "• Short point 1" },
    { "id": 7, "parameter": "Project Quality & Complexity", "score": number, "comments": "• Short point 1" },
    { "id": 11, "parameter": "Education & Certifications", "score": number, "comments": "• Short point 1" }
  ]
}
`;

    const impactAgentPrompt = `You are a specialized Achievement & Leadership AI Agent. You look closely at quantified impact, achievements, and leadership signals.
EVALUATE THE FOLLOWING PARAMETERS (Score 0-10):
4. Achievement Orientation
5. Quantification of Impact
9. Problem-Solving & Ownership
10. Leadership & Collaboration

CRITICAL INSTRUCTION: For "comments", DO NOT provide explanations or long paragraphs. Provide ONLY 1-2 short, impactful bullet points.

Return ONLY valid JSON in this exact structure:
{
  "parameters": [
    { "id": 4, "parameter": "Achievement Orientation", "score": number, "comments": "• Short point 1" },
    { "id": 5, "parameter": "Quantification of Impact", "score": number, "comments": "• Short point 1" },
    { "id": 9, "parameter": "Problem-Solving & Ownership", "score": number, "comments": "• Short point 1" },
    { "id": 10, "parameter": "Leadership & Collaboration", "score": number, "comments": "• Short point 1" }
  ]
}
`;

    const atsAgentPrompt = `You are a specialized ATS Optimization AI Agent. You evaluate keyword density, formatting, ATS parsability, and professional language.
EVALUATE THE FOLLOWING PARAMETERS (Score 0-10):
2. Professional Summary Quality
12. Resume Structure & Formatting
13. ATS Optimization
14. Professionalism & Language Quality

CRITICAL INSTRUCTION: For "comments", DO NOT provide explanations or long paragraphs. Provide ONLY 1-2 short, impactful bullet points.

Return ONLY valid JSON in this exact structure:
{
  "parameters": [
    { "id": 2, "parameter": "Professional Summary Quality", "score": number, "comments": "• Short point 1" },
    { "id": 12, "parameter": "Resume Structure & Formatting", "score": number, "comments": "• Short point 1" },
    { "id": 13, "parameter": "ATS Optimization", "score": number, "comments": "• Short point 1" },
    { "id": 14, "parameter": "Professionalism & Language Quality", "score": number, "comments": "• Short point 1" }
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
Identify missing skills required for target roles (Skill Gap Detection) and suggest skills that improve employability. Look for missing technologies or skills like "Missing SQL optimization", "No dashboard projects", "No measurable impact metrics".
Predict the best career moves based on the candidate's current role and profile. Provide roles and estimated Median salary (e.g. "₹22 LPA" or "$110k").
Simulate an overworked, cynical recruiter. Calculate the exact time in seconds it would take to reject this resume (e.g., 4.8). Provide brutal, realistic reasons for rejection in "rejection_simulation" (like "Weak first bullet points", "No measurable impact", "Skills not aligned with JD"). Keep times typically under 10 seconds.
Predict salary growth after 3 years. Estimate "current_expected_3yr" (e.g., "₹12 LPA" or "$80k") based on current trajectory. Then, predict a "target_expected_3yr" (e.g., "₹18 LPA" or "$120k") IF they learn a specific set of 3 "skills_to_learn".
Provide "strategic_career_guidance" including "current_path_growth_probability" (0-100) and 2 "better_paths" with "current_role", "target_role", and a "salary_growth_percentage" (e.g., 65).
Return ONLY valid JSON in this exact structure:
{
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1", "point 2"],
  "risk_flags": ["point 1", "point 2"],
  "career_trajectory": {
    "skill_gaps": ["gap 1", "gap 2"],
    "career_paths": [{ "role": "string", "salary": "string" }],
    "rejection_simulation": { "rejection_time_seconds": 4.8, "rejection_reasons": ["reason 1", "reason 2"] },
    "salary_growth_prediction": { "current_expected_3yr": "string", "target_expected_3yr": "string", "skills_to_learn": ["skill 1", "skill 2", "skill 3"] },
    "strategic_career_guidance": { "current_path_growth_probability": 42, "better_paths": [{ "current_role": "Data Analyst", "target_role": "Product Analyst", "salary_growth_percentage": 65 }] }
  },
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
      rawResume: Annotation<string>({ reducer: (x: string, y: string) => y ?? x, default: () => "" }),
      parsedData: Annotation<any>({ reducer: (x: any, y: any) => y ?? x }),
      evaluations: Annotation<ResumeState["evaluations"]>({
        reducer: (x: ResumeState["evaluations"], y: ResumeState["evaluations"]) => ({ ...x, ...y }),
        default: () => ({})
      }),
      finalScore: Annotation<number>({ reducer: (x: number, y: number) => y ?? x }),
      combinedParameters: Annotation<ResumeScoreParameter[]>({ reducer: (x: ResumeScoreParameter[], y: ResumeScoreParameter[]) => y ?? x }),
      recruiter_report: Annotation<any>({ reducer: (x: any, y: any) => y ?? x }),
      interview_questions: Annotation<any>({ reducer: (x: any, y: any) => y ?? x }),
      jobDescription: Annotation<string | undefined>({ reducer: (x: string | undefined, y: string | undefined) => y ?? x }),
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
      .addEdge("career", "aggregator")
      .addEdge("tech", "aggregator")
      .addEdge("impact", "aggregator")
      .addEdge("ats", "aggregator")
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