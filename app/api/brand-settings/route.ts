import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt, doubleDecrypt } from '@/lib/encryption';

// GET - Get brand settings for the authenticated user
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 GET BRAND SETTINGS: Starting fetch');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ GET BRAND SETTINGS: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ GET BRAND SETTINGS: Token found for email:', token.email);

    await dbConnect();

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 GET BRAND SETTINGS: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 GET BRAND SETTINGS: Encryption failed, trying to decrypt all emails');
        const allUsers = await PartnerUser.find();
        
        for (const potentialUser of allUsers) {
          try {
            const decryptedEmail = doubleDecrypt(potentialUser.email);
            if (decryptedEmail === token.email) {
              user = potentialUser;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    if (!user) {
      console.log('❌ GET BRAND SETTINGS: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ GET BRAND SETTINGS: User found:', user._id);

    // Find brand settings for this user
    const brandSettings = await BrandSettings.findOne({ userId: String(user._id) });

    if (!brandSettings) {
      console.log('🔍 GET BRAND SETTINGS: No brand settings found, returning defaults');
      return NextResponse.json({ 
        success: true,
        brandSettings: {
          brandName: '',
          logoUrl: '',
          selectedTheme: 'medical',
          websiteStyle: 'classic',
          customColors: {
            primary: '#3B82F6',
            secondary: '#10B981',
            accent: '#06b6d4'
          },
          heroSection: {
            headline: 'Understand Your Lab Results In Plain English',
            subheadline: 'Translate complex lab reports into clear, easy-to-understand explanations using advanced AI technology—no medical knowledge required.',
            ctaText: 'Upload Your Labs',
            secondaryCtaText: 'Learn More',
            stats: [
              { value: '100K+', label: 'Healthcare Providers' },
              { value: '500K+', label: 'Patients Served' },
              { value: '4.9/5', label: 'Satisfaction Score' },
              { value: 'HIPAA', label: 'Compliant' }
            ]
          },
          featuresSection: {
            title: 'Two Simple Ways to Access',
            subtitle: 'Flexible access options for individuals and businesses, with no complex dashboards or management required.',
            features: [
              {
                title: 'Simple Upload Process',
                description: 'Upload your lab reports as PDFs or images in seconds. Our AI automatically recognizes test results.',
                icon: 'upload'
              },
              {
                title: 'AI-Powered Explanations', 
                description: 'Receive clear explanations of your lab results with actionable insights in plain language.',
                icon: 'brain'
              },
              {
                title: 'HIPAA Compliant',
                description: 'All data is processed securely with full HIPAA compliance and encryption standards.',
                icon: 'shield'
              }
            ]
          },
          pricingSection: {
            enabled: true,
            title: 'Partner With Us',
            subtitle: 'Offer AI-powered lab report translations to your clients and patients with our partner program.',
            plans: [
              {
                name: 'Professional',
                price: '$99',
                period: 'per month',
                description: 'Ideal for growing clinics and wellness facilities.',
                features: [
                  '200 QR codes per month',
                  'Fully branded patient experience',
                  'Detailed usage analytics',
                  'Priority support',
                  'Customizable marketing kit',
                  'API access for integration'
                ],
                popular: true,
                buttonText: 'Get Started'
              }
            ]
          },
          isDeployed: false,
          websiteUrl: ''
        }
      }, { status: 200 });
    }

    console.log('✅ GET BRAND SETTINGS: Brand settings found');

    return NextResponse.json({ 
      success: true,
      brandSettings: {
        brandName: brandSettings.brandName,
        logoUrl: brandSettings.logoUrl || '',
        selectedTheme: brandSettings.selectedTheme,
        websiteStyle: brandSettings.websiteStyle,
        customColors: brandSettings.customColors,
        heroSection: brandSettings.heroSection,
        featuresSection: brandSettings.featuresSection,
        pricingSection: brandSettings.pricingSection,
        isDeployed: brandSettings.isDeployed,
        websiteUrl: brandSettings.websiteUrl || '',
        lastDeployedAt: brandSettings.lastDeployedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ GET BRAND SETTINGS: Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch brand settings' }, 
      { status: 500 }
    );
  }
}

// POST - Create brand settings for the authenticated user
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 CREATE BRAND SETTINGS: Starting creation');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ CREATE BRAND SETTINGS: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ CREATE BRAND SETTINGS: Token found for email:', token.email);

    const body = await req.json();
    const { brandName } = body;

    if (!brandName) {
      return NextResponse.json({ message: 'Brand name is required' }, { status: 400 });
    }

    await dbConnect();

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 CREATE BRAND SETTINGS: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 CREATE BRAND SETTINGS: Encryption failed, trying to decrypt all emails');
        const allUsers = await PartnerUser.find();
        
        for (const potentialUser of allUsers) {
          try {
            const decryptedEmail = doubleDecrypt(potentialUser.email);
            if (decryptedEmail === token.email) {
              user = potentialUser;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    if (!user) {
      console.log('❌ CREATE BRAND SETTINGS: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ CREATE BRAND SETTINGS: User found:', user._id);

    // Check if brand settings already exist
    const existingSettings = await BrandSettings.findOne({ userId: String(user._id) });
    
    if (existingSettings) {
      console.log('❌ CREATE BRAND SETTINGS: Brand settings already exist');
      return NextResponse.json({ message: 'Brand settings already exist. Use PUT to update.' }, { status: 400 });
    }

    // Create new brand settings with all the new fields
    const brandSettings = new BrandSettings({
      userId: String(user._id),
      brandName,
      logoUrl: body.logoUrl || '',
      logoPublicId: body.logoPublicId || '',
      selectedTheme: body.selectedTheme || 'medical',
      websiteStyle: body.websiteStyle || 'classic',
      customColors: body.customColors || {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#06b6d4'
      },
      heroSection: body.heroSection || {
        headline: 'Understand Your Lab Results In Plain English',
        subheadline: 'Translate complex lab reports into clear, easy-to-understand explanations using advanced AI technology—no medical knowledge required.',
        ctaText: 'Upload Your Labs',
        secondaryCtaText: 'Learn More',
        stats: [
          { value: '100K+', label: 'Healthcare Providers' },
          { value: '500K+', label: 'Patients Served' },
          { value: '4.9/5', label: 'Satisfaction Score' },
          { value: 'HIPAA', label: 'Compliant' }
        ]
      },
      featuresSection: body.featuresSection || {
        title: 'Two Simple Ways to Access',
        subtitle: 'Flexible access options for individuals and businesses, with no complex dashboards or management required.',
        features: [
          {
            title: 'Simple Upload Process',
            description: 'Upload your lab reports as PDFs or images in seconds. Our AI automatically recognizes test results.',
            icon: 'upload'
          },
          {
            title: 'AI-Powered Explanations', 
            description: 'Receive clear explanations of your lab results with actionable insights in plain language.',
            icon: 'brain'
          },
          {
            title: 'HIPAA Compliant',
            description: 'All data is processed securely with full HIPAA compliance and encryption standards.',
            icon: 'shield'
          }
        ]
      },
      pricingSection: body.pricingSection || {
        enabled: true,
        title: 'Partner With Us',
        subtitle: 'Offer AI-powered lab report translations to your clients and patients with our partner program.',
        plans: [
          {
            name: 'Professional',
            price: '$99',
            period: 'per month',
            description: 'Ideal for growing clinics and wellness facilities.',
            features: [
              '200 QR codes per month',
              'Fully branded patient experience',
              'Detailed usage analytics',
              'Priority support',
              'Customizable marketing kit',
              'API access for integration'
            ],
            popular: true,
            buttonText: 'Get Started'
          }
        ]
      },
      isDeployed: false
    });

    await brandSettings.save();

    console.log('✅ CREATE BRAND SETTINGS: Brand settings created successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Brand settings created successfully',
      brandSettings: {
        brandName: brandSettings.brandName,
        logoUrl: brandSettings.logoUrl,
        selectedTheme: brandSettings.selectedTheme,
        websiteStyle: brandSettings.websiteStyle,
        customColors: brandSettings.customColors,
        heroSection: brandSettings.heroSection,
        featuresSection: brandSettings.featuresSection,
        pricingSection: brandSettings.pricingSection,
        isDeployed: brandSettings.isDeployed
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ CREATE BRAND SETTINGS: Error:', error);
    return NextResponse.json(
      { message: 'Failed to create brand settings' }, 
      { status: 500 }
    );
  }
}

// PUT - Update brand settings for the authenticated user
export async function PUT(req: NextRequest) {
  try {
    console.log('🔍 UPDATE BRAND SETTINGS: Starting update');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ UPDATE BRAND SETTINGS: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ UPDATE BRAND SETTINGS: Token found for email:', token.email);

    const body = await req.json();
    console.log('🔍 UPDATE BRAND SETTINGS: Request body received:', JSON.stringify(body, null, 2));

    await dbConnect();

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 UPDATE BRAND SETTINGS: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 UPDATE BRAND SETTINGS: Encryption failed, trying to decrypt all emails');
        const allUsers = await PartnerUser.find();
        
        for (const potentialUser of allUsers) {
          try {
            const decryptedEmail = doubleDecrypt(potentialUser.email);
            if (decryptedEmail === token.email) {
              user = potentialUser;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    if (!user) {
      console.log('❌ UPDATE BRAND SETTINGS: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ UPDATE BRAND SETTINGS: User found:', user._id);

    // Prepare update data - accept all fields from the new structure
    const updateData: any = {};
    
    if (body.brandName !== undefined) updateData.brandName = body.brandName;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.logoPublicId !== undefined) updateData.logoPublicId = body.logoPublicId;
    if (body.selectedTheme !== undefined) updateData.selectedTheme = body.selectedTheme;
    if (body.websiteStyle !== undefined) updateData.websiteStyle = body.websiteStyle;
    if (body.customColors !== undefined) updateData.customColors = body.customColors;
    if (body.heroSection !== undefined) updateData.heroSection = body.heroSection;
    if (body.featuresSection !== undefined) updateData.featuresSection = body.featuresSection;
    if (body.pricingSection !== undefined) updateData.pricingSection = body.pricingSection;
    if (body.isDeployed !== undefined) updateData.isDeployed = body.isDeployed;
    if (body.websiteUrl !== undefined) updateData.websiteUrl = body.websiteUrl;
    if (body.lastDeployedAt !== undefined) updateData.lastDeployedAt = body.lastDeployedAt;

    console.log('🔍 UPDATE BRAND SETTINGS: Updating fields:', Object.keys(updateData));
    console.log('🔍 UPDATE BRAND SETTINGS: Update data:', JSON.stringify(updateData, null, 2));

    // Update or create brand settings
    const brandSettings = await BrandSettings.findOneAndUpdate(
      { userId: String(user._id) },
      updateData,
      { new: true, upsert: true }
    );

    if (!brandSettings) {
      console.log('❌ UPDATE BRAND SETTINGS: Failed to update brand settings');
      return NextResponse.json({ message: 'Failed to update brand settings' }, { status: 500 });
    }

    console.log('✅ UPDATE BRAND SETTINGS: Brand settings updated successfully');
    console.log('🔍 UPDATE BRAND SETTINGS: Final brand settings:', {
      selectedTheme: brandSettings.selectedTheme,
      customColors: brandSettings.customColors,
      brandName: brandSettings.brandName
    });

    return NextResponse.json({ 
      success: true,
      message: 'Brand settings updated successfully',
      brandSettings: {
        brandName: brandSettings.brandName,
        logoUrl: brandSettings.logoUrl,
        selectedTheme: brandSettings.selectedTheme,
        websiteStyle: brandSettings.websiteStyle,
        customColors: brandSettings.customColors,
        heroSection: brandSettings.heroSection,
        featuresSection: brandSettings.featuresSection,
        pricingSection: brandSettings.pricingSection,
        isDeployed: brandSettings.isDeployed,
        websiteUrl: brandSettings.websiteUrl,
        lastDeployedAt: brandSettings.lastDeployedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ UPDATE BRAND SETTINGS: Error:', error);
    return NextResponse.json(
      { message: 'Failed to update brand settings' }, 
      { status: 500 }
    );
  }
} 