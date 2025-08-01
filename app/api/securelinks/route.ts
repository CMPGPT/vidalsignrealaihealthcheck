import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const partnerId = request.nextUrl.searchParams.get('partnerId');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const status = request.nextUrl.searchParams.get('status'); // 'used', 'unused', or 'all'
    
    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }

    // Build filter based on status
    let filter: any = { partnerId };
    if (status === 'used') {
      filter.isUsed = true;
    } else if (status === 'unused') {
      filter.isUsed = false;
      filter['metadata.sold'] = { $ne: true }; // Only show unsold unused links
    } else if (status === 'sold') {
      filter['metadata.sold'] = true;
    } else if (status === 'unsold') {
      filter.isUsed = false;
      filter['metadata.sold'] = { $ne: true }; // Show unsold unused links
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total counts for statistics
    const [totalCount, usedCount, unusedCount, soldCount, unsoldCount] = await Promise.all([
      SecureLink.countDocuments({ partnerId }),
      SecureLink.countDocuments({ partnerId, isUsed: true }),
      SecureLink.countDocuments({ partnerId, isUsed: false }),
      SecureLink.countDocuments({ partnerId, 'metadata.sold': true }),
      SecureLink.countDocuments({ partnerId, $or: [{ 'metadata.sold': { $ne: true } }, { 'metadata.sold': { $exists: false } }] })
    ]);

    // Get paginated secure links
    const secureLinks = await SecureLink.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate total pages for current filter
    const totalFiltered = await SecureLink.countDocuments(filter);
    const totalPages = Math.ceil(totalFiltered / limit);

    return NextResponse.json({ 
      secureLinks,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalFiltered,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      statistics: {
        total: totalCount,
        used: usedCount,
        unused: unusedCount,
        sold: soldCount,
        unsold: unsoldCount
      }
    });
  } catch (error) {
    console.error('Error fetching secure links:', error);
    return NextResponse.json({ error: 'Failed to fetch secure links' }, { status: 500 });
  }
} 