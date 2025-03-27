'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  type: "login" | "signup";
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [name, setName] = useState("");
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would handle authentication here
    console.log("Form submitted", { email, password, organizationName, name });
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {type === "login" ? "Sign In to VidalSigns" : "Create Your Account"}
        </h1>
        <p className="text-muted-foreground">
          {type === "login" 
            ? "Enter your credentials to access your account" 
            : "Join thousands of healthcare providers using VidalSigns"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {type === "signup" && (
          <>
            <div>
              <label htmlFor="organization-name" className="block text-sm font-medium mb-2">
                Organization Name
              </label>
              <input
                id="organization-name"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your clinic or hospital name"
                className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            {type === "login" && (
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={toggleShowPassword}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit"
          className="w-full py-6 rounded-lg bg-primary hover:bg-primary/90 text-white"
        >
          {type === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>
      
      <div className="mt-8 text-center">
        {type === "login" ? (
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </GlassCard>
  );
};

export default AuthForm;
