import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AskLauncher } from "@/components/ask/ask-launcher";
import { QuoteCartBar } from "@/components/quote/quote-cart-bar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuoteCartBar />
      <AskLauncher />
    </div>
  );
}
