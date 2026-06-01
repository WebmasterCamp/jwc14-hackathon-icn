import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import { PageTransition } from "@/components/motion/page-transition";

export default async function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "PROVIDER") {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar variant="provider" />
        <main className="flex-1 p-6 bg-muted/30 min-h-[calc(100vh-4rem)]">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
