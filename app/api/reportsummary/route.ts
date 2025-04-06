// File: app/api/reportsummary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import path from 'path';
import { promises as fs } from 'fs';
import { fromPath } from 'pdf2pic';
import dbConnect from '@/lib/dbConnect';
import { Report } from '@/models/Report';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const uploadDir = path.join(process.cwd(), 'tmp/uploads');
const convertedDir = path.join(uploadDir, 'converted');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

async function analyzeDocument(filePath: string, mimeType: string): Promise<{
  summary: string;
  suggestedQuestions: string[];
  recommendationQuestions: string[];
}> {
  try {
    let imagePaths: string[] = [];

    if (mimeType === 'application/pdf') {
      await fs.mkdir(convertedDir, { recursive: true });

      const converter = fromPath(filePath, {
        density: 150,
        savePath: convertedDir,
        saveFilename: path.basename(filePath, path.extname(filePath)),
        format: 'jpeg',
        width: 1024,
        height: 1024,
      });

      const result = await converter(1);
      // @ts-ignore
      imagePaths = [result.path];
    } else {
      imagePaths = [filePath];
    }

    const imageMessages = await Promise.all(
      imagePaths.map(async (imgPath) => {
        const base64 = await fs.readFile(imgPath, { encoding: 'base64' });
        return {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64}`,
          },
        };
      })
    );

    // First request: Get the report summary
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical assistant specialized in analyzing and summarizing medical reports.

Format your response with markdown:

## Medical Report Analysis

### Laboratory Results
- **Test Name:** Value (Normal range)

### Abnormal Findings
- **Show abnormal things**

### Summary
- **Write two or three line sammary**

### Recommendations
- Recommendation list

Use double asterisks **bold** for important values.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Please analyze this medical document and extract the relevant medical information:' },
            // @ts-ignore
            ...imageMessages,
          ],
        },
      ],
      max_tokens: 1500,
    });

    const summary = summaryResponse.choices[0].message.content || 'No meaningful content extracted.';

    // Second request: Generate dynamic suggested questions
    const questionsResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical assistant helping patients understand their medical reports.

Based on the summary of a medical report, generate 3–5 relevant and specific questions a patient might ask, including about abnormal values or next steps.

Return the result as **valid JSON** with no extra text or markdown.

Example:
{
  "questions": ["What does my elevated creatinine level mean?", "Is the white blood cell count normal?"],
  "recommendationQuestions": ["Do I need to change my diet?", "Should I schedule another test soon?"]
}`,
        },
        {
          role: 'user',
          content: `Here is the medical report summary: ${summary}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    let suggestedQuestions: string[] = [];
    let recommendationQuestions: string[] = [];

    try {
      const questionsContent = questionsResponse.choices[0].message.content || '{}';
      const parsedQuestions = JSON.parse(questionsContent);

      if (!Array.isArray(parsedQuestions.questions) || !Array.isArray(parsedQuestions.recommendationQuestions)) {
        throw new Error('Invalid format from OpenAI');
      }

      suggestedQuestions = parsedQuestions.questions;
      recommendationQuestions = parsedQuestions.recommendationQuestions;
    } catch (error) {
      console.error('Error parsing OpenAI questions JSON:', error);
      throw new Error('Failed to generate questions from OpenAI');
    }

    console.log('Generated suggested questions:', suggestedQuestions);
    console.log('Generated recommendation questions:', recommendationQuestions);

    // Cleanup temp image files
    await Promise.all(imagePaths.map((imgPath) => fs.unlink(imgPath).catch(() => {})));

    return {
      summary,
      suggestedQuestions,
      recommendationQuestions,
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    await fs.mkdir(uploadDir, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chat ID.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Upload PDF, JPEG, or PNG only.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max size is 10MB.' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const fileName = `${timestamp}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    try {
      console.log(`Processing file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

      const { summary, suggestedQuestions, recommendationQuestions } = await analyzeDocument(filePath, file.type);

      const report = {
        id: `REP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        title: path.basename(file.name, ext),
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        summary,
        suggestedQuestions,
        recommendationQuestions,
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      // Save to MongoDB
      await dbConnect();
      await Report.create({
        chatId,
        title: report.title,
        date: report.date,
        summary: report.summary,
        suggestedQuestions: report.suggestedQuestions,
        recommendationQuestions: report.recommendationQuestions,
        expiryTime: report.expiryTime,
      });

      return NextResponse.json(report);
    } finally {
      await fs.unlink(filePath).catch((err) =>
        console.error('Failed to delete uploaded file:', err)
      );
    }
  } catch (error: any) {
    console.error('Unexpected server error:', error);

    if (error.statusCode === 429) {
      return NextResponse.json(
        { error: 'OpenAI rate limit reached. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}
