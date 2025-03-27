'use client';

import { Layout } from "@/components/layout/Layout";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, QrCode, Building2, BarChart3, Settings, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout hideNavbar hideFooter className="bg-background">
      <div className="flex min-h-screen relative">
        {/* Mobile sidebar */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Toggle Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[85%] max-w-[300px] overflow-y-auto">
              <div className="h-full bg-[hsl(var(--sidebar-background))]">
                <nav className="h-full">
                  <div className="px-6 py-4 border-b border-[hsl(var(--sidebar-border))]">
                    <span className="text-2xl font-bold text-[hsl(var(--sidebar-primary))]">
                      VidalSigns Admin
                    </span>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      <li>
                        <a href="/admin" className="flex items-center p-2 rounded-md hover:bg-[hsl(var(--sidebar-accent))]">
                          <Home className="w-5 h-5 mr-3" />
                          <span>Overview</span>
                        </a>
                      </li>
                      <li>
                        <a href="/admin/qrcodes" className="flex items-center p-2 rounded-md hover:bg-[hsl(var(--sidebar-accent))]">
                          <QrCode className="w-5 h-5 mr-3" />
                          <span>QR Codes</span>
                        </a>
                      </li>
                      <li>
                        <a href="/admin/partners" className="flex items-center p-2 rounded-md hover:bg-[hsl(var(--sidebar-accent))]">
                          <Building2 className="w-5 h-5 mr-3" />
                          <span>Partners</span>
                        </a>
                      </li>
                      <li>
                        <a href="/admin/analytics" className="flex items-center p-2 rounded-md hover:bg-[hsl(var(--sidebar-accent))]">
                          <BarChart3 className="w-5 h-5 mr-3" />
                          <span>Analytics</span>
                        </a>
                      </li>
                      <li className="pt-4 mt-4 border-t border-[hsl(var(--sidebar-border))]">
                        <a href="/admin/settings" className="flex items-center p-2 rounded-md hover:bg-[hsl(var(--sidebar-accent))]">
                          <Settings className="w-5 h-5 mr-3" />
                          <span>Settings</span>
                        </a>
                      </li>
                      <li>
                        <a href="/admin/help" className="flex items-center p-2 rounded-md hover:bg-[hsl(var(--sidebar-accent))]">
                          <HelpCircle className="w-5 h-5 mr-3" />
                          <span>Help & Support</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[hsl(var(--sidebar-border))]">
                    <Link href="/" className="flex items-center p-2 rounded-md hover:bg-[hsl(var(--sidebar-accent))]">
                      <LogOut className="w-5 h-5 mr-3" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 md:pt-6">
            <div className="md:mt-0 mt-8">
              <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
              {children}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
} 