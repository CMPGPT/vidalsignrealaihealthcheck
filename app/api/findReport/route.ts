import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Report } from '@/models/Report';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get the chatId
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
    }

    // Connect to the database
    await dbConnect();

    // Fetch the report based on chatId
    const report = await Report.findOne({ chatId }).sort({ createdAt: -1 });

    if (!report) {
      return NextResponse.json({ found: false });
    }

    // Return the found report data
    return NextResponse.json({
      found: true,
      report: {
        id: report._id.toString(),
        title: report.title,
        date: report.date,
        summary: report.summary,
        expiryTime: report.expiryTime,
        suggestedQuestions: report.suggestedQuestions,
      },
    });
  } catch (error) {
    console.error("POST Report Error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
