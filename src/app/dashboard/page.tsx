import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Neutral dashboard entry point. Middleware sends logged-in users here (it can't
// read the role from the opaque cookie), and this server component routes them to
// the dashboard matching their role — avoiding a redirect loop when an
// admin/provider lands on a customer-only route.
export default async function DashboardIndex() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  switch (session.user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "PROVIDER":
      redirect("/dashboard/provider");
    default:
      redirect("/dashboard/customer");
  }
}
