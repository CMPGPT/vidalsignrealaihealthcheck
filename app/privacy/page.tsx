import { FooterForAll } from '@/components/FooterForAll';
import {HeaderForAll} from '@/components/HeaderForAll';
import { Layout } from '@/components/layout/Layout';

export default function PrivacyPolicyPage() {
  return (
    <>
    <HeaderForAll />
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-3xl mt-10">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: 08 August 2025</p>

        <section className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            VidalSigns (“we,” “our,” “us”) respects your privacy. This Privacy Policy explains how we handle your personal
            data when you upload reports, use our chat-with-PDF feature, and interact with QR codes purchased from our partners.
          </p>
          <p>
            We follow a strict no-permanent-storage policy — all uploaded files and related chat data are deleted within 24 hours.
          </p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Basic Account Details:</strong> Name, email address, and login credentials.
            </li>
            <li>
              <strong>Uploaded Files:</strong> Reports or PDFs you choose to process (automatically deleted within 24 hours).
            </li>
            <li>
              <strong>Partner Data:</strong> For clinics, gyms, and partners — company and contact details for QR code management.
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, device information, and cookies.
            </li>
          </ul>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide chat-with-PDF functionality.</li>
            <li>Fulfill partner QR code transactions.</li>
            <li>Maintain platform security.</li>
          </ul>
          <p>We do not store or retain any uploaded file or chat content beyond 24 hours.</p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">4. How We Share Your Data</h2>
          <p>
            We do not sell or share your uploaded content. Limited sharing may occur with service providers strictly for processing purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Data Storage & Deletion</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All uploads are encrypted in transit.</li>
            <li>Files and chat records are automatically deleted within 24 hours.</li>
            <li>We retain only minimal account and payment records as legally required.</li>
          </ul>
        </section>
      </div>

      <FooterForAll />
    </>
  );
}


