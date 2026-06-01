import { prisma } from '@/lib/prisma';

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: RevenueData[];
  growthRate: number;
  averageContractValue: number;
}

export async function calculateAdminRevenue(months: number = 12): Promise<RevenueStats> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Get all completed payments
  const payments = await prisma.payment.findMany({
    where: {
      status: 'PAID',
      paidAt: {
        gte: startDate,
      },
    },
    select: {
      amount: true,
      paidAt: true,
    },
    orderBy: {
      paidAt: 'asc',
    },
  });

  // Calculate total revenue
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Group by month
  const monthlyMap = new Map<string, number>();
  payments.forEach((payment) => {
    if (payment.paidAt) {
      const monthKey = payment.paidAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + payment.amount);
    }
  });

  // Convert to array and fill missing months
  const monthlyRevenue: RevenueData[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyRevenue.push({
      month: monthName,
      revenue: monthlyMap.get(monthKey) || 0,
    });
  }

  // Calculate growth rate (current month vs previous month)
  let growthRate = 0;
  if (monthlyRevenue.length >= 2) {
    const currentMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const previousMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    if (previousMonth > 0) {
      growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;
    }
  }

  // Calculate average contract value
  const contractCount = await prisma.contract.count({
    where: {
      status: {
        in: ['ACTIVE', 'COMPLETED'],
      },
    },
  });
  const averageContractValue = contractCount > 0 ? totalRevenue / contractCount : 0;

  return {
    totalRevenue,
    monthlyRevenue,
    growthRate,
    averageContractValue,
  };
}

export async function calculateProviderRevenue(
  providerId: string,
  months: number = 12
): Promise<RevenueStats> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Get payments for this provider's contracts
  const payments = await prisma.payment.findMany({
    where: {
      status: 'PAID',
      paidAt: {
        gte: startDate,
      },
      contract: {
        providerId,
      },
    },
    select: {
      amount: true,
      paidAt: true,
    },
    orderBy: {
      paidAt: 'asc',
    },
  });

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const monthlyMap = new Map<string, number>();
  payments.forEach((payment) => {
    if (payment.paidAt) {
      const monthKey = payment.paidAt.toISOString().slice(0, 7);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + payment.amount);
    }
  });

  const monthlyRevenue: RevenueData[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyRevenue.push({
      month: monthName,
      revenue: monthlyMap.get(monthKey) || 0,
    });
  }

  let growthRate = 0;
  if (monthlyRevenue.length >= 2) {
    const currentMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const previousMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    if (previousMonth > 0) {
      growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;
    }
  }

  const contractCount = await prisma.contract.count({
    where: {
      status: {
        in: ['ACTIVE', 'COMPLETED'],
      },
      providerId,
    },
  });
  const averageContractValue = contractCount > 0 ? totalRevenue / contractCount : 0;

  return {
    totalRevenue,
    monthlyRevenue,
    growthRate,
    averageContractValue,
  };
}

export async function calculateCustomerSpending(
  customerId: string,
  months: number = 12
): Promise<RevenueStats> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const payments = await prisma.payment.findMany({
    where: {
      status: 'PAID',
      paidAt: {
        gte: startDate,
      },
      contract: {
        customerId,
      },
    },
    select: {
      amount: true,
      paidAt: true,
    },
    orderBy: {
      paidAt: 'asc',
    },
  });

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const monthlyMap = new Map<string, number>();
  payments.forEach((payment) => {
    if (payment.paidAt) {
      const monthKey = payment.paidAt.toISOString().slice(0, 7);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + payment.amount);
    }
  });

  const monthlyRevenue: RevenueData[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyRevenue.push({
      month: monthName,
      revenue: monthlyMap.get(monthKey) || 0,
    });
  }

  let growthRate = 0;
  if (monthlyRevenue.length >= 2) {
    const currentMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const previousMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    if (previousMonth > 0) {
      growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;
    }
  }

  const contractCount = await prisma.contract.count({
    where: {
      status: {
        in: ['ACTIVE', 'COMPLETED'],
      },
      customerId,
    },
  });
  const averageContractValue = contractCount > 0 ? totalRevenue / contractCount : 0;

  return {
    totalRevenue,
    monthlyRevenue,
    growthRate,
    averageContractValue,
  };
}
