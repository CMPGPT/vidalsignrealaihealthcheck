'use client';

import { Layout } from "@/components/layout/Layout";
import { LogOut, Home, QrCode, BarChart3, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Montserrat } from 'next/font/google';

// Load Montserrat font
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
});

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Add CSS for Montserrat font
  const montserratStyles = `
    .font-montserrat {
      font-family: 'Montserrat', sans-serif;
    }
    .font-montserrat * {
      font-family: 'Montserrat', sans-serif;
    }
  `;

  const tabs = [
    { name: "Overview", href: "/partners", icon: Home },
    { name: "QR Code Batches", href: "/partners/qrcodes", icon: QrCode },
    { name: "Analytics", href: "/partners/analytics", icon: BarChart3 },
    { name: "Settings", href: "/partners/settings", icon: Settings },
    { name: "Help", href: "/partners/help", icon: HelpCircle },
  ];

  return (
    <Layout hideNavbar hideFooter className="bg-background">
      <style dangerouslySetInnerHTML={{ __html: montserratStyles }} />
      <div className={`min-h-screen relative font-montserrat ${montserrat.className}`}>
        {/* Header with tabs and logout */}
        <header className="border-b border-border pb-2">
          <div className="container mx-auto px-4 py-4 flex flex-col">
          <div className="mb-2" />
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Partner Dashboard</h1>
              <div onClick={() => signOut({ callbackUrl: '/' })}>
                <Button  variant="ghost" size="sm" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>

            <div className="mb-2" />

            {/* Tab navigation */}
            <div className="flex space-x-1 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = 
                  tab.href === "/partners" 
                    ? pathname === "/partners" 
                    : pathname.startsWith(tab.href);
                
                return (
                  <Link 
                    key={tab.href} 
                    href={tab.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </Layout>
  );
} 