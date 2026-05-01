import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export const PURCHASE_ORDERS_STATUS_MODULE = "purchase_orders";

@Injectable()
export class MainStatusesService {
  constructor(private readonly prisma: PrismaService) {}

  findByModule(module: string) {
    return this.prisma.mainStatus.findMany({
      where: { module, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
    });
  }

  findPurchaseOrderStatuses() {
    return this.findByModule(PURCHASE_ORDERS_STATUS_MODULE);
  }

  findPurchaseOrderStatus(code: string) {
    return this.prisma.mainStatus.findUnique({
      where: {
        module_code: {
          module: PURCHASE_ORDERS_STATUS_MODULE,
          code
        }
      }
    });
  }
}
