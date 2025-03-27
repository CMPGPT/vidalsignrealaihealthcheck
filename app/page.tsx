import { Layout } from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <Layout>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
    </Layout>
  );
}
