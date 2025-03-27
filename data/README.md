# Mock Data Structure

This directory contains structured mock data for the Vidal Signs application, organized to simulate a MongoDB-like schema structure.

## Directory Structure

- `/schemas`: Contains TypeScript interfaces that define the structure of our data
- `/mock`: Contains the actual mock data organized by entity type

## Schema Files

- `partnerSchema.ts`: Defines the structure for partner data
- `qrCodeSchema.ts`: Defines the structure for QR code batches and individual codes
- `billingSchema.ts`: Defines the structure for billing records
- `analyticsSchema.ts`: Defines the structure for various analytics data points
- `index.ts`: Exports all schemas for easy importing

## Mock Data Files

- `/mock/partners/index.ts`: Mock data for partners
- `/mock/qrcodes/index.ts`: Mock data for QR code batches and individual codes
- `/mock/billing/index.ts`: Mock data for billing records
- `/mock/analytics/index.ts`: Mock data for analytics

## Usage

Import the schemas and mock data in your components:

```typescript
// Import types
import { Partner } from "@/data/schemas/partnerSchema";

// Import mock data
import partners from "@/data/mock/partners";
```

This structure allows us to maintain consistent data shapes throughout the application, while enabling easy replacement with real API calls in the future.

## Extending

To add more mock data, follow these steps:

1. Define the data structure in the appropriate schema file
2. Create the mock data in the corresponding mock data file
3. Export the data in the index.ts file of the entity type
4. Import and use the data in your components

## Real API Integration

When integrating with a real API:

1. Keep the schema files as they define the data structure
2. Replace the imports from mock data with API service calls
3. Ensure the API returns data in the same shape as defined in the schemas 