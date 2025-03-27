'use client';

import React, { useState, useEffect } from 'react';

const SLIDE_INTERVAL = 5000; // 5 seconds

// Sample carousel items
const carouselItems = [
  {
    title: "Seamless Health Report Sharing",
    description: "Share medical reports securely with your patients with just a few clicks",
    image: "/images/auth/report-sharing.jpg"
  },
  {
    title: "HIPAA Compliant Security",
    description: "Your patients' data is protected with enterprise-grade security",
    image: "/images/auth/security.jpg"
  },
  {
    title: "Patient Tracking and Analytics",
    description: "Track who viewed reports and gain insights into patient engagement",
    image: "/images/auth/analytics.jpg"
  }
];

const AuthCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselItems.length);
    }, SLIDE_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex relative overflow-hidden bg-primary/10">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-12 text-center">
        <div className="glass-morphism px-10 py-12 rounded-lg max-w-md backdrop-blur-md">
          <h2 className="text-3xl font-bold text-foreground mb-4">{carouselItems[activeSlide].title}</h2>
          <p className="text-muted-foreground text-lg">{carouselItems[activeSlide].description}</p>
          
          <div className="flex justify-center mt-8 space-x-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === activeSlide ? "bg-primary" : "bg-border"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Use a div with background image as fallback if images aren't available */}
      <div 
        className="absolute inset-0 bg-cover bg-center transform transition-transform duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070')`,
          transform: `scale(${activeSlide === 0 ? 1.05 : 1})`,
          opacity: activeSlide === 0 ? 1 : 0
        }}
      />
      <div 
        className="absolute inset-0 bg-cover bg-center transform transition-transform duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=2070')`,
          transform: `scale(${activeSlide === 1 ? 1.05 : 1})`,
          opacity: activeSlide === 1 ? 1 : 0
        }}
      />
      <div 
        className="absolute inset-0 bg-cover bg-center transform transition-transform duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070')`,
          transform: `scale(${activeSlide === 2 ? 1.05 : 1})`,
          opacity: activeSlide === 2 ? 1 : 0
        }}
      />
      
      {/* Optional overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/30 z-[5]" />
    </div>
  );
};

export default AuthCarousel; 