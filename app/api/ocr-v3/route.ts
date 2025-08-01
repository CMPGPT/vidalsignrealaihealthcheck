import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Report } from '@/models/Report';

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileName, chatId } = await request.json();

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { success: false, error: 'File URL and name are required' },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.MISTRAL_API_KEY) {
      console.error('Missing MISTRAL_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Mistral API not configured' },
        { status: 500 }
      );
    }

    console.log('Processing file with OCR v3:', fileUrl);

    // Process PDF with Mistral's OCR API
    console.log('Sending PDF to Mistral AI OCR API for text extraction');
    let extractedText = '';
    let pageCount = 0;

    try {
      // Use Mistral OCR API to extract text
      const ocrResponse = await fetch('https://api.mistral.ai/v1/ocr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-ocr-latest',
          document: {
            type: 'document_url',
            document_url: fileUrl
          },
          include_image_base64: false
        })
      });

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        console.error('Mistral OCR error response:', errorText);
        throw new Error(`Mistral OCR error: ${errorText.substring(0, 100)}`);
      }

      const ocrData = await ocrResponse.json();
      
      // Extract text from all pages and combine
      extractedText = ocrData.pages.map((page: any) => page.markdown).join('\n\n');
      pageCount = ocrData.pages.length;
      
      console.log(`OCR extraction complete: ${pageCount} pages processed`);
      
      if (!extractedText) {
        console.error('No text extracted from PDF by Mistral OCR');
        return NextResponse.json({ 
          success: false, 
          error: 'No text extracted from PDF by Mistral OCR',
          status: 'failed'
        }, { status: 400 });
      }
      
      console.log('Text extraction successful with Mistral OCR, text length:', extractedText.length);
      
      // First, validate if this is a medical report
      console.log('Validating if document is a medical report...');
      const validationResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: `You are a medical document validator. Your job is to determine if the given text is a medical report or medical document.

Look for these indicators of a medical report:
- Patient information (name, age, sex)
- Medical test results (lab values, blood tests, etc.)
- Medical terminology (diagnoses, procedures)
- Healthcare provider information
- Medical report structure

Return ONLY "YES" if it's a medical report, or "NO" if it's not a medical report.`
            },
            {
              role: 'user',
              content: `Is this a medical report or medical document?

${extractedText.substring(0, 1000)}

Answer with only "YES" or "NO".`
            }
          ],
          max_tokens: 10
        })
      });

      if (!validationResponse.ok) {
        const errorText = await validationResponse.text();
        console.error('Validation error response:', errorText);
        throw new Error(`Validation error: ${errorText.substring(0, 100)}`);
      }

      const validationData = await validationResponse.json();
      const validationResult = validationData.choices[0].message.content?.trim().toUpperCase() || 'NO';
      
      console.log('Validation result:', validationResult);
      
      if (validationResult !== 'YES') {
        console.log('Document is not a medical report');
        return NextResponse.json({
          success: false,
          error: 'This document does not appear to be a medical report. Please upload a medical lab report, test results, or other medical document.',
          status: 'not_medical'
        }, { status: 400 });
      }
      
      console.log('Document validated as medical report, proceeding with analysis...');
      
      // Now send the extracted text to Mistral for comprehensive medical analysis formatting
      console.log('Sending extracted text to Mistral for comprehensive medical analysis...');
      const analysisResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: `You are a medical assistant specialized in analyzing and summarizing medical reports.

Extract ALL information from the medical report and format it beautifully with markdown:

## Medical Report Analysis

### Patient Information
- **Name:** [Patient Name]
- **Age/Sex:** [Age and Gender]
- **Date:** [Report Date]
- **Lab No.:** [Laboratory Number]
- **Reg. No.:** [Registration Number]
- **Panel Name:** [Test Panel Name]
- **Ref. Dr.:** [Referring Doctor]
- **Sample Collection Date:** [Collection Date]
- **Barcode No.:** [Barcode Number]
- **Report Status:** [Status if available]

### Laboratory Results
- **Test Name:** Value (Normal range: X-Y)

### Abnormal Findings
- **Test Name:** Value (Status - Elevated/Below normal)

### Summary
- **Write a comprehensive summary of all findings**

### Recommendations
- Recommendation list

Use double asterisks **bold** for important values and test names. 
For normal values, use green color: <span style="color: green;">**Test Name:** Value</span>
For abnormal values, use red color: <span style="color: red;">**Test Name:** Value (Elevated/Below normal)</span>

Do NOT use #### or extra markdown symbols. Use clean ### for section headers.`
            },
            {
              role: 'user',
              content: `Please analyze this medical document text and extract ALL information including patient details, dates, lab numbers, and test results. Provide a comprehensive, beautifully formatted analysis:

${extractedText}

Please extract and format ALL the information from the report, including patient details, dates, lab numbers, and all test results. Make sure to highlight abnormal values in red and normal values in green. Use clean markdown formatting without extra symbols.`
            }
          ],
          max_tokens: 3000
        })
      });

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        console.error('Mistral analysis error response:', errorText);
        throw new Error(`Mistral analysis error: ${errorText.substring(0, 100)}`);
      }

      const analysisData = await analysisResponse.json();
      const formattedSummary = analysisData.choices[0].message.content;
      console.log('Comprehensive medical analysis completed');

      // Generate suggested questions based on the analysis
      const questionsResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: `You are a medical assistant helping patients understand their medical reports.

Based on the comprehensive summary of a medical report, generate exactly 3 relevant and specific questions a patient might ask, including about abnormal values or next steps.

Return the result as **valid JSON** with no extra text or markdown.

Example:
{
  "questions": ["What does my elevated creatinine level mean?", "Is the white blood cell count normal?", "What lifestyle changes should I consider?"],
  "recommendationQuestions": ["Do I need to change my diet?", "Should I schedule another test soon?"]
}`
            },
            {
              role: 'user',
              content: `Here is the comprehensive medical report summary: ${formattedSummary}`,
            },
          ],
          max_tokens: 500
        })
      });

      if (!questionsResponse.ok) {
        const errorText = await questionsResponse.text();
        console.error('Questions generation error response:', errorText);
        // Use default questions if generation fails
        return NextResponse.json({
          success: true,
          summary: formattedSummary,
          suggestedQuestions: [
            "What do these specific lab values mean for my health?",
            "Are there any values outside the normal range?",
            "What lifestyle changes should I consider based on these results?"
          ],
          recommendationQuestions: [
            "What lifestyle changes should I consider?",
            "Do I need to follow up with my doctor?",
            "Are there any dietary recommendations based on these results?"
          ],
          pageCount: pageCount,
          textLength: extractedText.length
        });
      }

      const questionsData = await questionsResponse.json();
      let suggestedQuestions = [
        "What do these specific lab values mean for my health?",
        "Are there any values outside the normal range?",
        "What lifestyle changes should I consider based on these results?"
      ];
      let recommendationQuestions = [
        "What lifestyle changes should I consider?",
        "Do I need to follow up with my doctor?",
        "Are there any dietary recommendations based on these results?"
      ];

      try {
        const questionsContent = questionsData.choices[0].message.content;
        const parsedQuestions = JSON.parse(questionsContent);
        if (parsedQuestions.questions) {
          suggestedQuestions = parsedQuestions.questions;
        }
        if (parsedQuestions.recommendationQuestions) {
          recommendationQuestions = parsedQuestions.recommendationQuestions;
        }
      } catch (parseError) {
        console.error('Failed to parse questions JSON:', parseError);
        // Use default questions if parsing fails
      }

      // Create report object
      const report = {
        id: `REP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        title: fileName.split('.').slice(0, -1).join('.'), // Remove file extension
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        summary: formattedSummary,
        suggestedQuestions: suggestedQuestions,
        recommendationQuestions: recommendationQuestions,
      };

      // Save to MongoDB
      console.log('Saving report to database...');
      await dbConnect();
      await Report.create({
        chatId,
        fileUrl, // Save the UploadThing URL
        title: report.title,
        date: report.date,
        summary: report.summary,
        suggestedQuestions: report.suggestedQuestions,
        recommendationQuestions: report.recommendationQuestions,
      });
      console.log('Report saved to database successfully');
      
      // Return in the same format as reportsummary API
      return NextResponse.json({
        success: true,
        ...report,
        pageCount: pageCount,
        textLength: extractedText.length
      });

    } catch (error) {
      console.error('OCR processing error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'OCR processing failed',
          status: 'failed'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('OCR v3 error:', error);

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
