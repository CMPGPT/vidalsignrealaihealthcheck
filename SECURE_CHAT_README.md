# Secure Chat System

This document explains the secure chat functionality that allows partners to generate one-time use links for their customers.

## Overview

The secure chat system consists of:
1. **Secure Link Generation**: Partners can generate one-time use links from the QR codes page
2. **Secure Chat Page**: A protected chat interface that validates links before allowing access
3. **Link Validation**: API endpoints that validate and mark links as used

## How It Works

### 1. Generating Secure Links

Partners can generate secure links from `/partners/qrcodes`:
- Click the "Generate Secure Link" button
- A unique link is created with a 24-hour expiry
- The link is automatically copied to clipboard
- Each link can only be used once

### 2. Secure Chat Access

Users access the secure chat via `/secure/chat/[linkId]`:
- The system validates the link ID
- Checks if the link has expired
- Verifies the link hasn't been used before
- If valid, marks the link as used and allows access
- If invalid, shows an error message

### 3. Link States

Links can be in the following states:
- **Valid**: Link exists, not expired, not used
- **Expired**: Link has passed its expiry time
- **Used**: Link has already been accessed once
- **Not Found**: Link ID doesn't exist

## API Endpoints

### Generate Secure Link
```
POST /api/generate-secure-link
Body: { partnerId, chatId, expiryHours }
Response: { success, linkId, secureUrl, expiresAt }
```

### Validate Secure Link
```
POST /api/validate-secure-link
Body: { linkId }
Response: { success, chatId, partnerId }
```

## Database Schema

### SecureLink Model
```typescript
{
  linkId: String (unique),
  partnerId: String,
  chatId: String,
  isUsed: Boolean,
  usedAt: Date,
  expiresAt: Date,
  createdAt: Date
}
```

## Usage Flow

1. **Partner generates link**: Goes to `/partners/qrcodes` and clicks "Generate Secure Link"
2. **Link is created**: System generates unique link with 24-hour expiry
3. **Partner shares link**: Sends the secure URL to customer
4. **Customer accesses link**: Visits `/secure/chat/[linkId]`
5. **System validates**: Checks link validity and marks as used
6. **Chat access granted**: Customer can now use the chat interface

## Security Features

- **One-time use**: Each link can only be accessed once
- **Time expiry**: Links automatically expire after 24 hours
- **Unique IDs**: Each link has a cryptographically secure unique ID
- **Database cleanup**: Expired links are automatically removed via TTL index

## Error Handling

The system handles various error scenarios:
- Invalid link IDs
- Expired links
- Already used links
- Network errors
- Database connection issues

## Testing

To test the system:
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/partners/qrcodes`
3. Click "Generate Secure Link"
4. Copy the generated link and open it in a new tab
5. Try accessing the same link again - it should show "Link has already been used"
6. Wait 24 hours and try again - it should show "Link has expired" 