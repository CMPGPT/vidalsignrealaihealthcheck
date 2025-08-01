import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Report } from '@/models/Report';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting report for chatId:', chatId);

    // Delete the report from the database
    const result = await Report.deleteMany({ chatId });

    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No report found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
} 