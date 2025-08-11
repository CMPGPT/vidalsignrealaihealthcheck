import { Layout } from '@/components/layout/Layout';

export default function CookiePolicyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-20 mt-20 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: 08 August 2025</p>

      <p className="mb-4">
        Cookies help us operate the site. They do not store your uploaded files or personal content.
      </p>
      <p>
        Your uploaded documents never leave secure processing and are deleted within 24 hours.
      </p>
      </div>
    </Layout>
  );
}


