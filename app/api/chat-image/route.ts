import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileName } = await request.json();

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { success: false, error: 'File URL and name are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'OpenAI API not configured' },
        { status: 500 }
      );
    }

    console.log('Processing image for chat:', fileUrl);

    try {
      // Download the file
      console.log('Downloading file from:', fileUrl);
      const fileResponse = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      console.log('File downloaded, size:', fileResponse.data.length);

      // Send to OpenAI for image analysis
      console.log('Sending image to OpenAI for chat response...');
      
      // Convert image to base64
      const base64Image = Buffer.from(fileResponse.data).toString('base64');
      const mimeType = fileResponse.headers['content-type'] || 'image/jpeg';
      
      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant. When a user uploads an image, provide a friendly, conversational response describing what you see in the image. Be helpful and engaging, but keep it casual and conversational. Don't provide medical analysis unless specifically asked.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `I've uploaded an image called "${fileName}". Can you tell me what you see in this image?`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      console.log('Analysis response status:', analysisResponse.status);

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        console.error('Mistral analysis error response:', errorText);
        throw new Error(`Mistral analysis error: ${errorText.substring(0, 100)}`);
      }

      let response = '';
      try {
        const analysisData = await analysisResponse.json();
        response = analysisData.choices[0].message.content;
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        response = "I can see you've uploaded an image! What would you like to know about it? Feel free to ask me any questions.";
      }

      console.log('Chat response completed');

      return NextResponse.json({
        success: true,
        response: response
      });

    } catch (processingError) {
      console.error('File processing error:', processingError);
      
      // Provide a friendly fallback response
      const fallbackResponse = "I can see you've uploaded an image! What would you like to know about it? Feel free to ask me any questions.";
     
      return NextResponse.json({
        success: true,
        response: fallbackResponse
      });
    }

  } catch (error) {
    console.error('Chat image error:', error);

    let errorMessage = 'Failed to process image';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 