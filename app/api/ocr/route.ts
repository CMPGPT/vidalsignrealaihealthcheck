import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check if environment variables are set
    if (!process.env.MISTRAL_API_KEY) {
      console.error('Missing MISTRAL_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Mistral API not configured' },
        { status: 500 }
      );
    }

    console.log('Processing file:', file.name, 'Type:', file.type);

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process file based on type
    if (file.type === 'application/pdf') {
      // Handle PDF files - convert to base64 and send to Mistral for analysis
      console.log('Processing PDF file...');
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      // Send PDF to Mistral for analysis
      const analysisResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large',
          messages: [
            {
              role: 'system',
              content: `You are a medical AI assistant specializing in analyzing lab reports and medical documents. Your role is to:
1. Extract and interpret medical data from lab reports
2. Identify abnormal values and their clinical significance
3. Provide clear, patient-friendly explanations
4. Suggest relevant questions for further discussion
5. Offer general health recommendations based on the results

Always maintain medical accuracy while being accessible to non-medical professionals.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Please analyze this medical PDF document and provide a comprehensive summary. Please provide:
1. A clear summary of the key findings
2. Identification of any abnormal values
3. Clinical significance of the results
4. Suggested questions for further discussion
5. General health recommendations

Format your response in a clear, structured manner.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 2000
        })
      });

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        console.error('Mistral analysis error response:', errorText);
        throw new Error(`Mistral analysis error: ${errorText.substring(0, 100)}`);
      }

      const analysisData = await analysisResponse.json();
      const analysis = analysisData.choices[0].message.content;

      // Create expiry time (30 minutes from now)
      const expiryTime = new Date(Date.now() + 30 * 60 * 1000);

      return NextResponse.json({
        success: true,
        summary: analysis,
        expiryTime: expiryTime,
        suggestedQuestions: [
          "What are the key findings in my lab results?",
          "Are there any values outside the normal range?",
          "What do these results mean for my health?",
          "Should I be concerned about any specific values?",
          "What lifestyle changes should I consider?",
          "Do I need to follow up with my doctor?",
          "Are there any dietary recommendations based on these results?"
        ],
        recommendationQuestions: [
          "What lifestyle changes should I consider?",
          "Do I need to follow up with my doctor?",
          "Are there any dietary recommendations based on these results?"
        ]
      });
    } else if (file.type.startsWith('image/')) {
      // For images, we'll need to use a different approach
      // For now, we'll convert to base64 and send to Mistral
      console.log('Processing image file...');
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      // Send image to Mistral for analysis
      const analysisResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large',
          messages: [
            {
              role: 'system',
              content: `You are a medical AI assistant specializing in analyzing lab reports and medical documents. Your role is to:
1. Extract and interpret medical data from lab reports
2. Identify abnormal values and their clinical significance
3. Provide clear, patient-friendly explanations
4. Suggest relevant questions for further discussion
5. Offer general health recommendations based on the results

Always maintain medical accuracy while being accessible to non-medical professionals.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Please analyze this medical document image and provide a comprehensive summary. Please provide:
1. A clear summary of the key findings
2. Identification of any abnormal values
3. Clinical significance of the results
4. Suggested questions for further discussion
5. General health recommendations

Format your response in a clear, structured manner.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 2000
        })
      });

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        console.error('Mistral analysis error response:', errorText);
        throw new Error(`Mistral analysis error: ${errorText.substring(0, 100)}`);
      }

      const analysisData = await analysisResponse.json();
      const analysis = analysisData.choices[0].message.content;

      // Create expiry time (30 minutes from now)
      const expiryTime = new Date(Date.now() + 30 * 60 * 1000);

      return NextResponse.json({
        success: true,
        summary: analysis,
        expiryTime: expiryTime,
        suggestedQuestions: [
          "What are the key findings in my lab results?",
          "Are there any values outside the normal range?",
          "What do these results mean for my health?",
          "Should I be concerned about any specific values?",
          "What lifestyle changes should I consider?",
          "Do I need to follow up with my doctor?",
          "Are there any dietary recommendations based on these results?"
        ],
        recommendationQuestions: [
          "What lifestyle changes should I consider?",
          "Do I need to follow up with my doctor?",
          "Are there any dietary recommendations based on these results?"
        ]
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload PDF or image files.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('OCR error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process file with OCR';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 