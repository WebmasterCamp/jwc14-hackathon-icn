import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";
import { th } from "date-fns/locale";

// GET /api/analytics - Get dashboard analytics
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const monthsToFetch = 12;

    if (session.user.role === "ADMIN") {
      // Admin analytics - platform-wide stats
      const [
        totalUsers,
        totalProviders,
        totalCustomers,
        totalEquipment,
        activeContracts,
        pendingProviders,
        contractsByStatus,
        paymentsByStatus,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.provider.count(),
        prisma.customer.count(),
        prisma.equipment.count({ where: { isActive: true } }),
        prisma.contract.count({ where: { status: "ACTIVE" } }),
        prisma.provider.count({ where: { verified: false } }),
        prisma.contract.groupBy({
          by: ["status"],
          _count: true,
        }),
        prisma.payment.groupBy({
          by: ["status"],
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      // Monthly revenue - optimized single query
      const startDate = startOfMonth(subMonths(now, monthsToFetch - 1));
      const allPayments = await prisma.payment.findMany({
        where: {
          status: "PAID",
          paidAt: {
            gte: startDate,
          },
        },
        select: {
          amount: true,
          paidAt: true,
        },
      });

      // Group by month in application code
      const monthlyData: { month: string; revenue: number }[] = [];
      for (let i = monthsToFetch - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = startOfMonth(subMonths(now, i - 1));

        const monthRevenue = allPayments
          .filter((p) => p.paidAt && p.paidAt >= monthStart && p.paidAt < monthEnd)
          .reduce((sum, p) => sum + p.amount, 0);

        monthlyData.push({
          month: format(monthStart, "MMM", { locale: th }),
          revenue: monthRevenue,
        });
      }

      return NextResponse.json({
        overview: {
          totalUsers,
          totalProviders,
          totalCustomers,
          totalEquipment,
          activeContracts,
          pendingProviders,
        },
        contracts: contractsByStatus,
        payments: paymentsByStatus,
        monthlyRevenue: monthlyData,
      });
    }

    if (session.user.role === "USER") {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
        include: {
          contracts: {
            include: {
              items: true,
              payments: true,
            },
          },
        },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      const activeContracts = customer.contracts.filter(
        (c) => c.status === "ACTIVE"
      ).length;
      const totalEquipment = customer.contracts
        .filter((c) => c.status === "ACTIVE")
        .reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0);

      const totalPaid = customer.contracts.reduce(
        (sum, c) =>
          sum +
          c.payments
            .filter((p) => p.status === "PAID")
            .reduce((s, p) => s + p.amount, 0),
        0
      );

      const totalPending = customer.contracts.reduce(
        (sum, c) =>
          sum +
          c.payments
            .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
            .reduce((s, p) => s + p.amount, 0),
        0
      );

      return NextResponse.json({
        overview: {
          activeContracts,
          totalEquipment,
          totalPaid,
          totalPending,
        },
      });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
