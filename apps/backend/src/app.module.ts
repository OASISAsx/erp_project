import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { MasterDataModule } from "./master-data/master-data.module";
import { MenuModule } from "./menu/menu.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PurchaseOrdersModule } from "./purchase-orders/purchase-orders.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/backend/.env", "../../.env"],
    }),
    PrismaModule,
    AdminModule,
    AuthModule,
    MasterDataModule,
    MenuModule,
    PurchaseOrdersModule,
  ],
})
export class AppModule {}
