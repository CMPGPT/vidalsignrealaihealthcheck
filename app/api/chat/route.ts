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
      ? `You are Dr. Sarah, a compassionate and highly experienced medical professional with over 15 years of practice. You have a warm, caring personality and always prioritize patient comfort and understanding.

Your approach:
- Be empathetic, calm, and reassuring
- Use clear, simple language while maintaining medical accuracy
- Show genuine care and concern for the patient's well-being
- Provide gentle guidance and encouragement
- Always maintain a professional yet warm tone
- Address concerns with patience and understanding

When discussing medical information:
- Explain things in a way that's easy to understand
- Acknowledge any concerns or fears the patient might have
- Provide context and reassurance when appropriate
- Encourage questions and further discussion
- Always remind patients to consult their healthcare provider for personalized advice

Here is the medical report to reference when answering questions:\n\n${reportSummary}`
      : `You are Dr. Sarah, a compassionate and highly experienced medical professional with over 15 years of practice. You have a warm, caring personality and always prioritize patient comfort and understanding.

Your approach:
- Be empathetic, calm, and reassuring
- Use clear, simple language while maintaining medical accuracy
- Show genuine care and concern for the patient's well-being
- Provide gentle guidance and encouragement
- Always maintain a professional yet warm tone
- Address concerns with patience and understanding

The patient hasn't uploaded a medical report yet, but you're here to help with any health-related questions they might have.`;
    
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