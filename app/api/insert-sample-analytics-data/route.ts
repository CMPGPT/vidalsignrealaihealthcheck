import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { QRCode } from '@/models/QRCode';
import { SecureLink } from '@/models/SecureLink';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Use the correct partner ID (MongoDB _id) from the logged-in user
    const partnerId = "686aa71d7848ed9baed37c7f";
    
    // Clear existing sample data for this partner
    await QRCode.deleteMany({ partnerId });
    await SecureLink.deleteMany({ partnerId });
    
    // Insert sample QR codes with different usage patterns
    const sampleQRCodes = [];
    const now = new Date();
    
    // Create 50 QR codes with various usage patterns
    for (let i = 0; i < 50; i++) {
      const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date in last 30 days
      const isUsed = Math.random() > 0.7; // 30% usage rate
      const isScanned = isUsed && Math.random() > 0.3; // 70% of used are scanned
      const isRedeemed = isScanned && Math.random() > 0.5; // 50% of scanned are redeemed
      
      const qrCode = {
        id: `QR-${Date.now()}-${i}`,
        partnerId,
        batchId: `BATCH-${Math.floor(i / 10)}`,
        createdAt,
        expiresAt: new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        url: `https://example.com/qr/${i}`,
        assigned: isUsed,
        customerName: isUsed ? `Customer ${i}` : null,
        customerId: isUsed ? `CUST-${i}` : null,
        assignedDate: isUsed ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
        scanned: isScanned,
        scanDate: isScanned ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
        redeemed: isRedeemed,
        redemptionDate: isRedeemed ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
        used: isUsed,
        usedDate: isUsed ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
        usedBy: isUsed ? `user-${i}` : null,
        generated: `QR-${i}`,
        metadata: {
          location: isUsed ? `Location ${i}` : null,
          device: isUsed ? `Device ${i}` : null
        }
      };
      
      sampleQRCodes.push(qrCode);
    }
    
    await QRCode.insertMany(sampleQRCodes);
    
    // Insert sample secure links
    const sampleSecureLinks = [];
    
    // Create 25 secure links with various usage patterns
    for (let i = 0; i < 25; i++) {
      const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date in last 30 days
      const isUsed = Math.random() > 0.6; // 40% usage rate
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hour expiry
      
      const secureLink = {
        linkId: `LINK-${Date.now()}-${i}`,
        partnerId,
        chatId: `CHAT-${i}`,
        isUsed,
        usedAt: isUsed ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
        expiresAt,
        createdAt,
        metadata: {
          customerEmail: isUsed ? `customer${i}@example.com` : null,
          ipAddress: isUsed ? `192.168.1.${i}` : null,
          userAgent: isUsed ? `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/${i}` : null
        }
      };
      
      sampleSecureLinks.push(secureLink);
    }
    
    await SecureLink.insertMany(sampleSecureLinks);
    
    return NextResponse.json({
      success: true,
      message: 'Sample analytics data inserted successfully for correct partner ID',
      data: {
        partnerId,
        qrCodesInserted: sampleQRCodes.length,
        secureLinksInserted: sampleSecureLinks.length
      }
    });
    
  } catch (error) {
    console.error('❌ SAMPLE DATA: Error inserting sample analytics data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to insert sample analytics data' 
    }, { status: 500 });
  }
} 