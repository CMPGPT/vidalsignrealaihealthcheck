// app/api/reportsummary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/lib/dbConnect';
import { Report } from '@/models/Report';
import axios from 'axios';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

async function analyzeDocument(fileUrl: string, fileType: string): Promise<{
  summary: string;
  suggestedQuestions: string[];
  recommendationQuestions: string[];
}> {
  try {
    // Download the file to a buffer
    const { data } = await axios.get(fileUrl, {
      responseType: 'arraybuffer'
    });
    
    // Convert buffer to base64
    const base64 = Buffer.from(data).toString('base64');
    
    // Determine MIME type for the base64 image URL
    const mimeType = fileType === 'application/pdf' ? 'application/pdf' : 
                     fileType === 'image/png' ? 'image/png' : 'image/jpeg';
    
    // Create the image message
    const imageMessage = {
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${base64}`,
      },
    };

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
            imageMessage,
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

Based on the summary of a medical report, generate exactly 3 relevant and specific questions a patient might ask, including about abnormal values or next steps.

Return the result as **valid JSON** with no extra text or markdown.

Example:
{
  "questions": ["What does my elevated creatinine level mean?", "Is the white blood cell count normal?", "What lifestyle changes should I consider?"],
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
    const data = await request.json();
    const { fileUrl, fileType, fileName, chatId } = data;

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided.' }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chat ID.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}. Upload PDF, JPEG, or PNG only.` },
        { status: 400 }
      );
    }

    try {
      console.log(`Processing file: ${fileName}, Type: ${fileType}, URL: ${fileUrl}`);

      const { summary, suggestedQuestions, recommendationQuestions } = await analyzeDocument(fileUrl, fileType);

      const report = {
        id: `REP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        title: fileName.split('.').slice(0, -1).join('.'), // Remove file extension
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        summary,
        suggestedQuestions,
        recommendationQuestions,
        // Remove expiryTime - will use database time instead
      };

      // Save to MongoDB
      await dbConnect();
      await Report.create({
        chatId,
        fileUrl, // Save the UploadThing URL
        title: report.title,
        date: report.date,
        summary: report.summary,
        suggestedQuestions: report.suggestedQuestions,
        recommendationQuestions: report.recommendationQuestions,
        // Remove expiryTime from database save - will use PublicLink time
      });

      return NextResponse.json(report);
    } catch (error: any) {
      console.error('Error in analysis process:', error);
      return NextResponse.json(
        { error: 'Analysis failed', detail: error.message },
        { status: 500 }
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