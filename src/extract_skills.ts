import { PDFExtract } from 'pdf.js-extract';
import { Groq } from 'groq-sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY 
});

/**
 * Reads a PDF file using pdf.js-extract and compiles its text.
 * @param filePath - The path to the PDF file.
 * @returns A promise that resolves to the extracted text string.
 */
async function getPdfText(filePath: string): Promise<string> {
    const pdfExtract = new PDFExtract();
    
    return new Promise((resolve, reject) => {
        pdfExtract.extract(filePath, {}, (err, data) => {
            if (err) {
                return reject(err);
            }
            if (!data || !data.pages) {
                return resolve("");
            }

            let fullText = "";
            
            // Loop through each page and extract the text strings
            for (const page of data.pages) {
                for (const contentItem of page.content) {
                    fullText += contentItem.str + " ";
                }
                fullText += "\n"; // Add a line break at the end of each page
            }
            
            console.log("PDF text extraction successful. Sample text:\n", fullText.substring(0, 150), "...\n");
            resolve(fullText);
        });
    });
}

/**
 * Extracts technical and soft skills from a resume using Groq.
 */
async function extractSkills(): Promise<void> {
    console.log("--- 1. Reading PDF ---");
    
    try {
        // Ensure the path matches where your PDF actually is!
        const resumeText: string = await getPdfText('./src/resume.pdf');
        
        // Simple truncation to ensure we don't exceed token limits
        const truncatedText: string = resumeText.substring(0, 20000); 

        console.log("--- 2. Sending to Groq ---");

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert HR parser. Your job is to extract a list of professional skills from resume text. Return ONLY a comma-separated list of skills. Do not include introductory text like 'Here are the skills'."
                },
                {
                    role: "user",
                    content: `Extract the technical and soft skills from the following resume text:\n\n${truncatedText}`
                }
            ],
            // Standard Groq model
            model: "llama-3.1-8b-instant", 
            temperature: 0.5, 
            max_tokens: 1024, 
            top_p: 1,
            stream: true,
            stop: null
        });

        console.log("--- 3. Extracted Skills ---\n");
        
        // Stream the response to the console
        for await (const chunk of chatCompletion) {
            process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }
        console.log("\n\n--- Done ---");

    } catch (error: any) {
        console.error("\nError during execution:", error.message);
    }
}

// Execute the function
extractSkills();