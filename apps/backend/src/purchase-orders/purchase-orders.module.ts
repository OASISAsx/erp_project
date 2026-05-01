import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MainStatusesModule } from "../main-statuses/main-statuses.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PurchaseOrdersController } from "./purchase-orders.controller";
import { PurchaseOrdersService } from "./purchase-orders.service";

@Module({
  imports: [AuthModule, PrismaModule, MainStatusesModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService]
})
export class PurchaseOrdersModule {}
