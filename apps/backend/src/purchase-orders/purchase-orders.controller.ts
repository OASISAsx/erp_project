import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreatePurchaseOrderDto, ReceiveSerialsDto } from "./dto";
import { PurchaseOrdersService } from "./purchase-orders.service";

@Controller("purchase-orders")
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  findAll(@Query("status") status?: string | string[]) {
    const statusCodes = Array.isArray(status) ? status : status ? [status] : undefined;

    return this.purchaseOrdersService.findAll(statusCodes);
  }

  @Get("status-summary")
  statusSummary() {
    return this.purchaseOrdersService.statusSummary();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(dto);
  }

  @Post(":id/serials")
  receiveSerials(@Param("id") id: string, @Body() dto: ReceiveSerialsDto) {
    return this.purchaseOrdersService.receiveSerials(id, dto);
  }
}
