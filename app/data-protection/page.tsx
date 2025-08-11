import { Layout } from '@/components/layout/Layout';

export default function DataProtectionPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-20 mt-20 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Data Protection Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: 08 August 2025</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold">1. Data Minimization & Retention</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Uploaded PDFs and chat content: Deleted within 24 hours.</li>
          <li>No permanent storage of personal health or document data.</li>
          <li>Minimal account and billing info is kept only to fulfill transactions and meet legal requirements.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Security Measures</h2>
        <p>
          Even during the short storage period, all data is encrypted and isolated from unauthorized access.
        </p>
      </section>
      </div>
    </Layout>
  );
}


