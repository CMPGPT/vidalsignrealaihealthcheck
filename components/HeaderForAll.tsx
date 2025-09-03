"use client";

import { ActivitySquare, Download } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export const HeaderForAll = () => {

  const [showEmailModal, setShowEmailModal] = useState(false);

  return (

    <>
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image src="/mainlogo.png" alt="VidalSigns Logo" className="rounded-lg" width={40} height={40} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">VidalSigns</h1>
              <p className="text-xs text-gray-500 mt-0.5">Clarity You Can Trust. Answers You Can Understand.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => setShowEmailModal(true)} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              Upload Report
            </button>
          </div>
        </div>
      </header>
    </>

  );
};

