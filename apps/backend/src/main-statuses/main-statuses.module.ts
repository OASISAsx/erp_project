import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MainStatusesController } from "./main-statuses.controller";
import { MainStatusesService } from "./main-statuses.service";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [MainStatusesController],
  providers: [MainStatusesService],
  exports: [MainStatusesService]
})
export class MainStatusesModule {}
