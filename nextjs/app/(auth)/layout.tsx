import type { Metadata } from "next";
import "@/components/auth/auth.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <PageTransition>
        <main className="min-h-[calc(100vh-200px)] etis-auth-root">
          {children}
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
