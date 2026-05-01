import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MainStatusesService, PURCHASE_ORDERS_STATUS_MODULE } from "./main-statuses.service";

@Controller("main-statuses")
@UseGuards(JwtAuthGuard)
export class MainStatusesController {
  constructor(private readonly mainStatusesService: MainStatusesService) {}

  @Get()
  findByModule(@Query("module") module = PURCHASE_ORDERS_STATUS_MODULE) {
    return this.mainStatusesService.findByModule(module);
  }
}
