"use client";

import { Download } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3">
              <Download className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-display font-bold">VidalSigns</h2>
            </div>
            <p className="mt-4 text-sm text-muted">
              Your health, in plain English. Empowering individuals and wellness brands with 
              accessible, understandable lab analysis.
            </p>
          </div>
          <div className="grid grid-cols-2 md:col-span-3 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Platform
              </h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-muted hover:text-background transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="text-muted hover:text-background transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted hover:text-background transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-muted hover:text-background transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted hover:text-background transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted hover:text-background transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                For Professionals
              </h3>
              <ul className="mt-4 space-y-3">
                <li><a href="http://partners.vidalsigns.com" className="text-muted hover:text-background transition-colors">Partner with Us</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-muted-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted">
            &copy; 2025 VidalSigns. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted hover:text-background">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

