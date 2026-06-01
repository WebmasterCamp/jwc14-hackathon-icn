import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AskLauncher } from "@/components/ask/ask-launcher";
import { PageTransition } from "@/components/motion/page-transition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <AskLauncher />
    </div>
  );
}
