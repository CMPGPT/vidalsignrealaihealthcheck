// File: app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { question, reportSummary } = body;
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }
    
    // Create system message with report context
    const systemMessage = reportSummary 
      ? `You are a helpful medical assistant analyzing a medical report. Here is the report summary to reference when answering questions:\n\n${reportSummary}`
      : 'You are a helpful medical assistant. The user has not uploaded a medical report yet.';
    
    // Generate response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    // Extract response text
    const responseText = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    
    // Return response
    return NextResponse.json({ response: responseText });
    
  } catch (error: any) {
    console.error('Error in chat API:', error);
    
    // Check if it's an OpenAI error
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI rate limit reached. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process your request', details: error.message },
      { status: 500 }
    );
  }
}