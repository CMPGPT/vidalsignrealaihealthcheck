'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfileCompletionBanner() {
  const { data: session } = useSession();
  
  // Check if user needs to complete profile
  const needsProfileCompletion = session?.user && !(session.user as any)?.profileComplete;
  
  if (!needsProfileCompletion) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-medium text-orange-800">
                Complete Your Profile
              </h3>
              <p className="text-sm text-orange-700">
                Please provide your state and organization information to continue using the platform.
              </p>
            </div>
          </div>
          <Link href="/partners/settings?tab=profile">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
