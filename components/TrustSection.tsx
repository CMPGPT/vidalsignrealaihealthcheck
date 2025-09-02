"use client";

import { Shield, BookOpen, Award } from "lucide-react";

export const TrustSection = () => {
  return (
    <section className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="px-6 py-3 text-base bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Grounded in Science
          </div>
        </div>
        
        <h3 className="text-4xl font-bold text-gray-900 mb-6">
          Our AI doesn&apos;t guess.
        </h3>
        
        <p className="text-xl text-gray-600 leading-relaxed mb-12">
          Every analysis is grounded in trusted medical literature — including{' '}
          <span className="font-semibold text-blue-600">PubMed</span>,{' '}
          <span className="font-semibold text-blue-600">NIH guidelines</span>, and evidence-based 
          clinical publications used by licensed providers. We translate complex data into 
          understandable insights based on a foundation of credible science.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="glass-card p-8 rounded-xl hover-lift">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4">Evidence-Based</h4>
            <p className="text-gray-600">
              Trained on peer-reviewed medical literature and clinical guidelines.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl hover-lift">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4">HIPAA Compliant</h4>
            <p className="text-gray-600">
              Your health data is encrypted and protected according to medical standards.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl hover-lift">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-4">Clinically Reviewed</h4>
            <p className="text-gray-600">
              Our AI models are validated by healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
