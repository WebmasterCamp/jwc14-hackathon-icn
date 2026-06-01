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

  // Provider area is gated by the is_provider flag. Admins may also enter (e.g.
  // to inspect a provider's console); everyone else is bounced to login.
  if (!session || !(session.user.isProvider || session.user.role === "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex flex-col md:flex-row">
        <Sidebar variant="provider" />
        <main className="flex-1 p-4 md:p-6 bg-muted/30 min-h-[calc(100vh-4rem)] min-w-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
