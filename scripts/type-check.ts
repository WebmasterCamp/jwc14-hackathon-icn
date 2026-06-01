// Quick type check to verify schema changes compile correctly
import type { Prisma } from "../src/generated/prisma/client";
import { ContractStatus } from "../src/generated/prisma/enums";

// Test 1: MaintenanceRequest can include equipment
const maintenanceWithEquipment: Prisma.MaintenanceRequestInclude = {
  equipment: true,
  customer: true,
};

// Test 2: Equipment can include maintenanceRequests
const equipmentWithMaintenance: Prisma.EquipmentInclude = {
  maintenanceRequests: true,
  provider: true,
  category: true,
};

// Test 3: ContractStatus has new enum values
const suspendedStatus = ContractStatus.SUSPENDED;
const terminatedStatus = ContractStatus.TERMINATED;

// Test 4: Contract can filter by type
const contractByType: Prisma.ContractWhereInput = {
  type: "RENT",
  status: "ACTIVE",
};

// Test 5: Payment status is PAID (not COMPLETED)
const paidPayment: Prisma.PaymentWhereInput = {
  status: "PAID",
};

console.log("✅ All TypeScript type checks passed!");
console.log("✅ Schema changes are correctly reflected in generated types");
