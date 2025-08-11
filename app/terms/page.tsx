import { Layout } from '@/components/layout/Layout';

export default function TermsOfServicePage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-20 max-w-3xl mt-20">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: 08 August 2025</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">1. Data Retention Policy</h2>
        <p>
          When you upload a file or use our chat service, we process it in real-time and delete it within 24 hours. We do not offer file storage services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Partner QR Code Use</h2>
        <p>
          QR codes do not contain stored medical or personal data on our servers — they simply link to the functionality provided during the valid service period.
        </p>
      </section>
      </div>
    </Layout>
  );
}


