# Vidal Signs Platform

## Overview

Vidal Signs is a QR code management platform that allows healthcare providers and wellness centers to generate and track QR codes for patient engagement.

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React Context API
- **Deployment**: Vercel

## Directory Structure

- `/app`: Next.js app router pages
- `/components`: React components
- `/data`: Mock data and schemas (simulating a database)
- `/public`: Static assets
- `/styles`: Global CSS styles

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd vidalsigns-test

# Install dependencies
npm install
# or
yarn
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000.

### Build

```bash
# Create production build
npm run build
# or
yarn build
```

## Deployment on Vercel

This project is optimized for deployment on Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Sign up for a Vercel account at https://vercel.com.
3. Import your Git repository in Vercel.
4. Vercel will detect the Next.js project and configure builds automatically.
5. Click "Deploy" to deploy your application.

### Environment Variables

For basic functionality, you'll need to configure these environment variables:

#### Required for Contact Form:
- `EMAIL_USER`: Your Gmail address (e.g., your-email@gmail.com)
- `EMAIL_PASS`: Your Gmail app password (not your regular password)

#### Other API Keys:
- `MISTRAL_API_KEY`: Your Mistral AI API key
- `OPENAI_API_KEY`: Your OpenAI API key
- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_SECRET`: Your NextAuth secret
- `NEXTAUTH_URL`: Your application URL (e.g., http://localhost:3000)
- `UPLOADTHING_SECRET`: Your UploadThing secret
- `UPLOADTHING_APP_ID`: Your UploadThing app ID

#### Email Configuration Setup:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Add to your `.env.local` file**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### Deployment Configuration

The project includes:

- Optimized images
- Proper ESLint rules
- Typescript configuration
- CSS modules for component styles
- Server-side rendering where appropriate

## Features

- **Admin Dashboard**: Manage partners, QR codes, and analytics
- **QR Code Management**: Generate, track, and manage QR code batches
- **Analytics**: View usage metrics and partner performance
- **Partner Management**: Add and manage healthcare providers
- **Settings**: Configure system settings and branding

## Mock Data

The application uses structured mock data found in the `/data` directory. See [data/README.md](./data/README.md) for details on the mock data structure.

## License

Copyright © 2023 Vidal Signs. All rights reserved.
