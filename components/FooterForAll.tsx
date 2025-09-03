"use client";

import { ActivitySquare, Download } from "lucide-react";
import Image from "next/image";

export const FooterForAll = () => {


  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3">
              <Image src="/mainlogo.png" alt="VidalSigns Logo" className="rounded-lg" width={40} height={40} />
              <h2 className="text-2xl font-bold">VidalSigns</h2>
            </div>
            <p className="mt-4 text-sm text-gray-400">Your health, in plain English. Empowering individuals and wellness brands with accessible, understandable lab analysis.</p>
          </div>
          <div className="grid grid-cols-2 md:col-span-3 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Platform</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors text-left">How It Works</a></li>
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors text-left">Pricing</a></li>
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors text-left">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">For Professionals</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="http://partners.vidalsigns.com" target='_' className="text-gray-400 hover:text-white transition-colors">Partner with Us</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; 2025 VidalSigns. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <div className="flex space-x-6 text-sm text-white/60">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/data-protection" className="hover:text-white transition-colors">Data Protection</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>

  );
};

