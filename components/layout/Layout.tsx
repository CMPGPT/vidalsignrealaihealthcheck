'use client';

import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
  hideNavbar?: boolean;
}

export function Layout({
  children,
  className,
  hideFooter = false,
  hideNavbar = false,
}: LayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)} suppressHydrationWarning>
      {!hideNavbar && <Navbar />}
      <main className="flex-grow" suppressHydrationWarning>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
