import Link from "next/link";
import { Layout } from "@/components/layout/Layout";

export default function NotFound() {
  return (
    
    <Layout hideFooter>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md focus:ring-2 focus:ring-primary/20">
            Back to Home
          </button>
        </Link>
      </div>
    </Layout>
  );
} 