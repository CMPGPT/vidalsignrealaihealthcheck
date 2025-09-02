'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, UploadCloud, ActivitySquare, ArrowDownToLine, Microscope, FileText, Dna, Dumbbell, HeartPulse, Plus, Twitter, CheckCircle2, Mail, X } from 'lucide-react';

export default function Home() {
  const [isUploadView, setIsUploadView] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [geminiOutput, setGeminiOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [wellnessPlanGenerated, setWellnessPlanGenerated] = useState(false);
  
  // Email modal states (from existing Hero.tsx)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentEmail, setPaymentEmail] = useState('');
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        // Instead of directly setting the file, show email modal first
        setSelectedFile(file);
        setShowEmailModal(true);
      } else {
        alert("Please upload a PDF or image file.");
      }
    }
  };

  // Email submission logic (from existing Hero.tsx)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setLimitReached(false);
    
    try {
      const response = await fetch('/api/send-chat-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitting(false);
        // Beautiful success popup
        toast.success('Check your email', {
          description: `We sent a secure chat link to ${email}. It expires in 30 minutes.`,
        });
        setIsSuccess(true);
        // Keep the modal open so the user clearly sees the success message.
      } else {
        // Handle limit reached case
        if (data.limitReached) {
          setLimitReached(true);
          setRemainingDays(data.remainingDays);
          setIsSubmitting(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to send chat link');
      }
    } catch (error) {
      console.error('Error sending chat link:', error);
      setIsSubmitting(false);
      
      // Get specific error message
      let errorMessage = 'Failed to send chat link. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show error in modal instead of alert
      setEmail('');
      alert(errorMessage);
    }
  };

  const callGemini = async (prompt: string, isChat = false) => {
    setIsLoading(true);
    setGeminiOutput('');
    
    const simulatedResults = "Cholesterol (Total): 210 mg/dL (Slightly Elevated), Vitamin D: 25 ng/mL (Low), Glucose: 95 mg/dL (Normal)";
    const personaSelect = document.getElementById('persona-select') as HTMLSelectElement;
    const selectedPersona = personaSelect?.options[personaSelect.selectedIndex]?.text.replace('AI Persona: ', '') || 'Supportive Coach';

    let systemInstruction = `You are an AI assistant for VidalSigns. Your persona is: ${selectedPersona}. Your goal is to answer questions about a user's health report in a clear, supportive, and non-alarming way. Always include the disclaimer 'This is not medical advice. Please consult a healthcare professional.' at the end of your response. Here is the user's report summary: "${simulatedResults}". Now, please answer the user's question.`;

    const newChatHistory = isChat ? [...chatHistory] : [];
    if (newChatHistory.length === 0) {
      newChatHistory.push({ role: "user", parts: [{ text: systemInstruction }] });
    }
    newChatHistory.push({ role: "user", parts: [{ text: prompt }] });

    // Simulate API call with setTimeout
    setTimeout(() => {
      let simulatedResponse = '';
      
      if (prompt.includes("Generate a simple, 1-week wellness plan")) {
        simulatedResponse = `Here's your personalized 1-week wellness plan:

**WEEK 1 WELLNESS PLAN**

**Cholesterol Management:**
- Breakfast: Oatmeal with berries and walnuts
- Lunch: Grilled salmon salad with olive oil dressing
- Dinner: Lean chicken with steamed vegetables

**Vitamin D Support:**
- Get 15-20 minutes of morning sunlight daily
- Include vitamin D rich foods: fatty fish, egg yolks
- Consider discussing supplements with your doctor

**Lifestyle Recommendations:**
1. Take a 30-minute walk daily
2. Practice stress-reduction techniques
3. Aim for 7-8 hours of quality sleep
4. Stay hydrated with 8 glasses of water daily

*This is not medical advice. Please consult a healthcare professional.*`;
        setWellnessPlanGenerated(true);
        setShowDownload(true);
      } else {
        simulatedResponse = `Based on your results, here are some insights:

Your slightly elevated cholesterol (210 mg/dL) is manageable through dietary changes. Focus on foods rich in omega-3 fatty acids like salmon, walnuts, and flaxseeds. 

For your low vitamin D (25 ng/mL), consider spending more time outdoors and eating vitamin D-rich foods like fatty fish and fortified dairy products.

Your glucose levels are excellent at 95 mg/dL - keep up whatever you're doing there!

*This is not medical advice. Please consult a healthcare professional.*`;
      }
      
      setGeminiOutput(simulatedResponse);
      setChatHistory([...newChatHistory, { role: "model", parts: [{ text: simulatedResponse }] }]);
      setIsLoading(false);
    }, 2000);
  };

  const askQuestion = () => {
    const input = chatInputRef.current;
    const question = input?.value.trim();
    if (question) {
      callGemini(question, true);
      if (input) input.value = '';
    }
  };

  const generateWellnessPlan = () => {
    const prompt = "Generate a simple, 1-week wellness plan with diet suggestions for breakfast, lunch, and dinner, and 3-4 lifestyle recommendations. The plan should focus on improving slightly elevated cholesterol and low vitamin D levels. Present it in a clear, easy-to-read format.";
    callGemini(prompt, true);
  };

  const downloadReport = () => {
    showModal('Downloading Report', 'In a real application, this would generate and download a PDF of your Full Clarity Report™ + Wellness Plan.');
  };

  const showModal = (title: string, text: string) => {
    setModalText(text);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Define pricing plans
  const pricingPlans = [
    {
      name: "Single QR Code",
      price: "$29",
      priceNumber: 29,
      quantity: 1,
      description: "Perfect for a one-time check-in.",
      features: ["1 QR Code"]
    },
    {
      name: "Two QR Codes", 
      price: "$49",
      priceNumber: 49,
      quantity: 2,
      originalPrice: "$58",
      description: "Ideal for follow-up comparisons.",
      features: ["2 QR Codes"],
      popular: true
    },
    {
      name: "Three QR Codes",
      price: "$79", 
      priceNumber: 79,
      quantity: 3,
      originalPrice: "$87",
      description: "Best value for tracking progress.",
      features: ["3 QR Codes"]
    }
  ];

  // Handle plan selection
  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  // Handle payment flow using the starter payment system
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentEmail || !selectedPlan) return;
    
    setIsPaymentSubmitting(true);
    
    try {
      console.log('🔍 PAYMENT: Creating checkout session for:', {
        plan: selectedPlan.name,
        price: selectedPlan.priceNumber,
        quantity: selectedPlan.quantity,
        email: paymentEmail
      });

      // Use the starter checkout system which handles direct payments
      const response = await fetch('/api/create-starter-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: paymentEmail,
          plan: selectedPlan.name,
          amount: selectedPlan.priceNumber * 100, // Convert to cents
          quantity: selectedPlan.quantity
        }),
      });

      const data = await response.json();
      console.log('🔍 PAYMENT: Response:', data);

      if (!response.ok) {
        console.error('❌ PAYMENT: Response error:', data);
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      console.log('✅ PAYMENT: Redirecting to Stripe checkout');
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error('❌ PAYMENT: Error:', error);
      setIsPaymentSubmitting(false);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  // Slider functionality
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handle = slider.querySelector('.handle') as HTMLElement;
    const after = slider.querySelector('.after') as HTMLElement;
    let isDragging = false;

    const startDrag = (e: Event) => {
      e.preventDefault();
      isDragging = true;
    };

    const stopDrag = () => {
      isDragging = false;
    };

    const onDrag = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const rect = slider.getBoundingClientRect();
      let x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      let pos = (x - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      
      if (after && handle) {
        after.style.width = `${pos * 100}%`;
        handle.style.left = `${pos * 100}%`;
      }
    };

    handle?.addEventListener('mousedown', startDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mousemove', onDrag);
    handle?.addEventListener('touchstart', startDrag);
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('touchmove', onDrag);

    return () => {
      handle?.removeEventListener('mousedown', startDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('mousemove', onDrag);
      handle?.removeEventListener('touchstart', startDrag);
      document.removeEventListener('touchend', stopDrag);
      document.removeEventListener('touchmove', onDrag);
    };
  }, []);

  return (
    <div className="text-gray-800 antialiased" style={{ scrollBehavior: 'smooth' }}>
      {/* HIPAA Compliance Banner */}
      <div className="bg-blue-50 text-blue-800 text-sm font-semibold p-2 text-center">
        <div className="container mx-auto flex items-center justify-center space-x-2">
          <ShieldCheck className="h-5 w-5" />
          <span>HIPAA Compliant Medical Platform</span>
        </div>
      </div>

      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ActivitySquare className="h-8 w-8 text-blue-600" />
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

      <main>
        {/* Hero Section */}
        <section id="how-it-works" className="hero-bg text-center py-20 sm:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Understand Your Lab Results
              <span className="block gradient-text mt-2">In Plain English.</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
              Stop guessing what your health reports mean. Upload your file securely and get instant, easy-to-understand insights from our AI.
            </p>
            
            <div id="upload-section" className="mt-12 max-w-2xl mx-auto">
              {/* Upload View */}
              {isUploadView && (
                <div
                  className="upload-area bg-white p-6 sm:p-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer shadow-sm"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowEmailModal(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowEmailModal(true); }}
                >
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 font-semibold text-blue-600">Click to upload your lab report</p>
                  <p className="text-xs text-gray-500 mt-1">Enter your email to receive a secure chat link.</p>
                </div>
              )}
              
              {/* Results View */}
              {!isUploadView && (
                <div id="results-view" className="text-left bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Your AI-Powered Analysis</h3>
                  <div className="prose max-w-none text-gray-700">
                    <h4 className="font-semibold">Key Findings:</h4>
                    <ul>
                      <li><strong>Cholesterol (Total):</strong> 210 mg/dL (Slightly Elevated)</li>
                      <li><strong>Vitamin D:</strong> 25 ng/mL (Low)</li>
                      <li><strong>Glucose:</strong> 95 mg/dL (Normal)</li>
                      <li className="text-gray-500">All other markers appear within normal ranges.</li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">This is a simulated analysis for demo purposes. This is not medical advice.</p>
                  </div>
                  
                  {/* Interactive Section */}
                  <div className="mt-6 border-t border-gray-200 pt-6 space-y-6">
                    {/* Ask Question */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800">✨ Have a question about your results?</p>
                        <select id="persona-select" className="block appearance-none bg-white border border-gray-300 px-3 py-1 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs">
                          <option value="coach">AI Persona: Supportive Coach</option>
                          <option value="clinical">Clinical & Precise</option>
                          <option value="simple">Simple & Direct</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <input 
                          ref={chatInputRef}
                          type="text" 
                          placeholder="e.g., 'What foods are good for cholesterol?'" 
                          className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                        />
                        <button onClick={askQuestion} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                          Ask
                        </button>
                      </div>
                    </div>
                    
                    {/* Generate Wellness Plan */}
                    <button 
                      onClick={generateWellnessPlan} 
                      disabled={wellnessPlanGenerated}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${wellnessPlanGenerated ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 border-blue-200'}`}
                    >
                      <p className="font-semibold text-blue-800">✨ Generate My Wellness Plan</p>
                      <p className="text-sm text-blue-700">Get a sample 1-week plan with diet and lifestyle suggestions based on your results.</p>
                    </button>
                  </div>

                  {/* Gemini Output */}
                  {(isLoading || geminiOutput) && (
                    <div className="mt-6">
                      {isLoading && <div className="loader"></div>}
                      {geminiOutput && (
                        <>
                          <div className="p-4 rounded-lg gemini-output">{geminiOutput}</div>
                          {showDownload && (
                            <div className="mt-4">
                              <button onClick={downloadReport} className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                                <ArrowDownToLine className="h-5 w-5" />
                                <span>Download Full Clarity Report™ + Wellness Plan (PDF)</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">See the Difference Instantly</h3>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 mb-12">From a confusing medical document to a clear, simple summary. Just slide to compare.</p>
            
            <div className="comparison-slider" ref={sliderRef}>
              <div className="before">
                <div className="report-content bg-gray-100 p-6 font-mono text-xs text-gray-700 overflow-hidden leading-relaxed">
                  <h4 className="text-sm font-bold mb-4 text-center">STANDARD LABORATORY REPORT</h4>
                  <p><strong>PATIENT:</strong> DOE, JANE</p>
                  <p><strong>ACCESSION:</strong> 123456789</p>
                  <p><strong>COLLECTED:</strong> 06/20/2025 08:30</p>
                  <hr className="my-2 border-gray-300" />
                  <p><strong>TEST NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RESULT&nbsp;&nbsp;&nbsp;&nbsp;FLAG&nbsp;&nbsp;&nbsp;&nbsp;UNITS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;REFERENCE RANGE</strong></p>
                  <hr className="my-2 border-gray-300" />
                  <p>COMPREHENSIVE METABOLIC PANEL</p>
                  <p>GLUCOSE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;95&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mg/dL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;65-99</p>
                  <p>...</p>
                  <p>LIPID PANEL</p>
                  <p>CHOLESTEROL, TOTAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;210&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;H&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mg/dL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;200</p>
                  <p>TRIGLYCERIDES&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;130&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mg/dL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;150</p>
                  <p>HDL CHOLESTEROL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;55&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mg/dL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&gt;39</p>
                  <p>...</p>
                  <p>VITAMIN D, 25-HYDROXY&nbsp;&nbsp;&nbsp;25&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;L&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ng/mL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;30-100</p>
                  <p className="mt-4 text-gray-400">--- END OF REPORT ---</p>
                </div>
              </div>
              <div className="after">
                <div className="report-content bg-white p-6">
                  <div className="w-full max-w-[800px] h-full p-4 sm:p-6 text-left">
                    <h4 className="text-lg font-bold text-gray-900 mb-6">Your Clarity Report™</h4>
                    <ul className="space-y-5">
                      <li className="flex items-start">
                        <span className="flex h-3 w-3 mt-1.5 mr-4">
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">Vitamin D <span className="text-sm font-normal text-gray-500 ml-2">25 ng/mL</span></p>
                          <p className="text-gray-600">This level is considered **low** and may impact bone health and immunity.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="flex h-3 w-3 mt-1.5 mr-4">
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">Total Cholesterol <span className="text-sm font-normal text-gray-500 ml-2">210 mg/dL</span></p>
                          <p className="text-gray-600">This is **slightly elevated**. Focusing on diet and exercise is often recommended.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="flex h-3 w-3 mt-1.5 mr-4">
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">Glucose <span className="text-sm font-normal text-gray-500 ml-2">95 mg/dL</span></p>
                          <p className="text-gray-600">Your blood sugar is within a **healthy, normal range**.</p>
                        </div>
                      </li>
                    </ul>
                    <p className="text-sm text-gray-400 mt-8 italic">...plus clear explanations for all other markers.</p>
                  </div>
                </div>
              </div>
              <div className="handle"></div>
            </div>
          </div>
        </section>

        {/* Grounded in Science Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Microscope className="h-5 w-5 mr-2 -ml-1" />
                Grounded in Science
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Our AI doesn&apos;t guess.</h3>
            <p className="mt-4 text-lg text-gray-600">
              Every analysis is grounded in trusted medical literature — including <span className="font-semibold text-blue-600">PubMed</span>, <span className="font-semibold text-blue-600">NIH guidelines</span>, and evidence-based clinical publications used by licensed providers. We translate complex data into understandable insights based on a foundation of credible science.
            </p>
          </div>
        </section>
        
        {/* Report Types Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">One Platform for All Your Health Data</h3>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">From standard blood work to complex genetic reports, our AI is trained to provide clear insights across a wide range of health data.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="report-type-card bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Standard Lab Reports</h4>
                  <p className="mt-1 text-sm text-gray-600">Clear explanations for reports from Quest, LabCorp, and more.</p>
                </div>
              </div>
              
              <div className="report-type-card bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Dna className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">DNA & Genomic Reports</h4>
                  <p className="mt-1 text-sm text-gray-600">Insights for GeneSight, 23andMe, and pharmacogenomic results.</p>
                </div>
              </div>
              
              <div className="report-type-card bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Wellness & Coach Panels</h4>
                  <p className="mt-1 text-sm text-gray-600">Actionable advice for fitness assessments and health coaching.</p>
                </div>
              </div>
              
              <div className="report-type-card bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Functional Medicine</h4>
                  <p className="mt-1 text-sm text-gray-600">Context for hormone panels, gut health, and micronutrient tests.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Frequently Asked Questions</h3>
              <p className="mt-4 text-lg text-gray-600">Quick answers to common questions about our service.</p>
            </div>
            <div className="space-y-4">
              <div className="faq-item bg-white border border-gray-200 rounded-lg p-5">
                <details>
                  <summary className="flex justify-between items-center font-semibold text-gray-900">
                    Is my health data secure?
                    <Plus className="w-5 h-5 text-gray-500" />
                  </summary>
                  <p className="mt-3 text-gray-600">
                    Absolutely. We use bank-level encryption and are a fully HIPAA-compliant platform. Your data is anonymized and never shared or sold. Security and privacy are our top priorities.
                  </p>
                </details>
              </div>
              
              <div className="faq-item bg-white border border-gray-200 rounded-lg p-5">
                <details>
                  <summary className="flex justify-between items-center font-semibold text-gray-900">
                    How accurate is the AI analysis?
                    <Plus className="w-5 h-5 text-gray-500" />
                  </summary>
                  <p className="mt-3 text-gray-600">
                    Our AI is trained on a vast corpus of peer-reviewed medical literature and clinical guidelines. While it provides high-quality, evidence-based insights, it is not a substitute for a licensed medical professional. Always consult your doctor.
                  </p>
                </details>
              </div>
              
              <div className="faq-item bg-white border border-gray-200 rounded-lg p-5">
                <details>
                  <summary className="flex justify-between items-center font-semibold text-gray-900">
                    Can I share my results with my doctor?
                    <Plus className="w-5 h-5 text-gray-500" />
                  </summary>
                  <p className="mt-3 text-gray-600">
                    Yes! We encourage it. After generating your wellness plan, you can download a comprehensive PDF—The Clarity Report™—that includes both the simplified analysis and the original data, making it easy to discuss with your healthcare provider.
                  </p>
                </details>
              </div>
              
              <div className="faq-item bg-white border border-gray-200 rounded-lg p-5">
                <details>
                  <summary className="flex justify-between items-center font-semibold text-gray-900">
                    Is this a medical diagnosis?
                    <Plus className="w-5 h-5 text-gray-500" />
                  </summary>
                  <p className="mt-3 text-gray-600">
                    No. VidalSigns provides educational information to help you understand your health data. It is not a diagnostic tool and does not provide medical advice. All health decisions should be made in consultation with a qualified doctor.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Your Privacy & Security</h3>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">We take your health data seriously with enterprise-grade security and HIPAA compliance.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">HIPAA Compliant</h4>
                <p className="text-gray-600">Full compliance with healthcare privacy regulations and industry standards.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <ActivitySquare className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Bank-Level Encryption</h4>
                <p className="text-gray-600">Your data is encrypted in transit and at rest using military-grade security.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Never Shared</h4>
                <p className="text-gray-600">Your health information is never sold, shared, or used for marketing purposes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, One-Time Pricing</h3>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Get the answers you need without a subscription. Perfect for individuals.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div key={index} className={`pricing-card border ${plan.popular ? 'border-2 border-blue-600' : 'border-gray-200'} bg-white rounded-xl p-8 flex flex-col ${plan.popular ? 'relative' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max flex justify-center">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">Most Popular</span>
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                  <p className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="ml-2 text-gray-500 line-through">{plan.originalPrice}</span>
                    )}
                  </p>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                  <ul className="mt-6 space-y-4 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handlePlanSelect(plan)} 
                    className="mt-8 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Choose Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3">
                <ActivitySquare className="h-8 w-8 text-blue-500" />
                <h2 className="text-2xl font-bold">VidalSigns</h2>
              </div>
              <p className="mt-4 text-sm text-gray-400">Your health, in plain English. Empowering individuals and wellness brands with accessible, understandable lab analysis.</p>
            </div>
            <div className="grid grid-cols-2 md:col-span-3 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Platform</h3>
                <ul className="mt-4 space-y-3">
                  <li><button onClick={() => scrollToSection('how-it-works')} className="text-gray-400 hover:text-white transition-colors text-left">How It Works</button></li>
                  <li><button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white transition-colors text-left">Pricing</button></li>
                  <li><button onClick={() => scrollToSection('security')} className="text-gray-400 hover:text-white transition-colors text-left">Security</button></li>
                </ul>
              </div>
              {/* <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Company</h3>
                <ul className="mt-4 space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div> */}
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
              <a href="#" className="text-gray-500 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Email Modal (preserved from existing Hero.tsx) */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowEmailModal(false);
                setLimitReached(false);
                setEmail('');
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {!isSuccess && !limitReached ? (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Chat Link</h2>
                  <p className="text-gray-600">Enter your email to receive a secure link for uploading and analyzing your lab results.</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block"></div>
                        Sending...
                      </>
                    ) : (
                      'Get Chat Link'
                    )}
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  We'll send you a secure link to upload and analyze your lab results.
                </p>
              </>
            ) : limitReached ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Limit Reached</h2>
                <p className="text-gray-600 mb-4">You have already used your limit for this email address.</p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <p className="text-orange-800 font-medium">
                    Please wait <strong>{remainingDays} more day{remainingDays !== 1 ? 's' : ''}</strong> before requesting another link.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h2>
                <p className="text-gray-600 mb-4">
                  We've sent a secure chat link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">The link will expire in 30 minutes for your security.</p>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmail('');
                    setIsSuccess(false);
                  }}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  OK, got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedPlan(null);
                setPaymentEmail('');
                setIsPaymentSubmitting(false);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
              <p className="text-gray-600">
                You've selected <strong>{selectedPlan.name}</strong> for <strong>{selectedPlan.price}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">Enter your email to proceed to payment.</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label htmlFor="payment-email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="payment-email"
                  value={paymentEmail}
                  onChange={(e) => setPaymentEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPaymentSubmitting || !paymentEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaymentSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block"></div>
                    Processing...
                  </>
                ) : (
                  `Proceed to Payment - ${selectedPlan.price}`
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              You'll be redirected to Stripe for secure payment processing.
            </p>
          </div>
        </div>
      )}
      
      {/* Modal */}
      {modalVisible && (
        <div className="modal-bg" style={{ display: 'flex' }} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold">Plan Selected!</h3>
            <p className="my-4 text-gray-700">{modalText}</p>
            <button onClick={closeModal} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
