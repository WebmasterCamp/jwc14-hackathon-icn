import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Neutral dashboard entry point. Middleware sends logged-in users here (it can't
// read the role from the opaque cookie), and this server component routes them to
// the dashboard matching their role — avoiding a redirect loop when an
// admin/provider lands on a customer-only route.
export default async function DashboardIndex() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // ADMIN = shop operator/platform admin; everyone else (USER) is a customer
  // whose area lives in the public /account frontend.
  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin");
  }
  redirect("/account");
}
