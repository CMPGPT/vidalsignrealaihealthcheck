import { Layout } from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import CTA from "@/components/home/CTA";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function HomePage() {
  return (
    <Layout className={`${poppins.className}`}>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
    </Layout>
  );
}
