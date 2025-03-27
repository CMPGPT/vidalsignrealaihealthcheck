'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div>
      { /* <h2 className="text-xl font-semibold mb-6">Help & Support</h2> */}
      <Card>
        <CardHeader>
          <CardTitle>Support Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Find help resources and contact support.</p>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-medium">Contact Support</h3>
              <p className="text-muted-foreground mt-1">
                Email us at <a href="mailto:support@vidalsigns.com" className="text-primary hover:underline">support@vidalsigns.com</a> or call <a href="tel:+18005551234" className="text-primary hover:underline">1-800-555-1234</a>.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
              <div className="mt-2 space-y-3">
                <div className="border-b pb-3">
                  <p className="font-medium">How do I add more QR codes to my account?</p>
                  <p className="text-muted-foreground mt-1">
                    You can purchase additional QR codes from the Overview page by clicking the &ldquo;Buy New Batch&rdquo; button.
                  </p>
                </div>
                <div className="border-b pb-3">
                  <p className="font-medium">How do I track QR code scans?</p>
                  <p className="text-muted-foreground mt-1">
                    QR code scan analytics are available in the Analytics section of your dashboard.
                  </p>
                </div>
                <div className="border-b pb-3">
                  <p className="font-medium">How do I update my billing information?</p>
                  <p className="text-muted-foreground mt-1">
                    You can update your billing information in the Settings page under the Billing tab.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 