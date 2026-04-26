import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { MenuModule } from "./menu/menu.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/backend/.env", "../../.env"],
    }),
    PrismaModule,
    AdminModule,
    AuthModule,
    MenuModule,
  ],
})
export class AppModule {}
