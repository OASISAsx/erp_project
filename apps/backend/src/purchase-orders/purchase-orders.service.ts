import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MainStatusesService } from "../main-statuses/main-statuses.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePurchaseOrderDto, ReceiveSerialsDto } from "./dto";

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mainStatusesService: MainStatusesService
  ) {}

  async findAll(statusCodes?: string[]) {
    const orders = await this.prisma.purchaseOrder.findMany({
      where: statusCodes?.length ? { status: { in: statusCodes } } : undefined,
      include: {
        customer: true,
        mainStatus: true,
        items: {
          include: {
            product: true,
            serials: true
          }
        }
      },
      orderBy: [{ createdAt: "desc" }]
    });

    return orders.map((order) => this.formatOrder(order));
  }

  async statusSummary() {
    const [statuses, counts] = await Promise.all([
      this.mainStatusesService.findPurchaseOrderStatuses(),
      this.prisma.purchaseOrder.groupBy({
        by: ["status"],
        _count: { status: true }
      })
    ]);
    const countByStatus = new Map(counts.map((item) => [item.status, item._count.status]));
    const total = counts.reduce((sum, item) => sum + item._count.status, 0);

    return [
      {
        id: "all",
        code: "all",
        label: "All",
        color: "default",
        sortOrder: 0,
        count: total
      },
      ...statuses.map((status) => ({
        ...status,
        count: countByStatus.get(status.code) ?? 0
      }))
    ];
  }

  async findOne(id: string) {
    const order = await this.getPurchaseOrderEntity(id);

    if (!order) {
      throw new NotFoundException("Purchase order not found");
    }

    return this.formatOrder(order);
  }

  async create(dto: CreatePurchaseOrderDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, isActive: true }
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true }
    });
    const foundProductIds = new Set(products.map((product) => product.id));

    if (productIds.some((productId) => !foundProductIds.has(productId))) {
      throw new BadRequestException("Some products are not available");
    }

    const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const number = await this.nextPurchaseOrderNumber();
    const waitingPickingStatus = await this.getStatusOrThrow("waiting_picking");

    const created = await this.prisma.purchaseOrder.create({
      data: {
        number,
        customerId: dto.customerId,
        status: waitingPickingStatus.code,
        mainStatusId: waitingPickingStatus.id,
        note: dto.note?.trim() || null,
        subtotal,
        total: subtotal,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice
          }))
        }
      }
    });

    return this.findOne(created.id);
  }

  async receiveSerials(id: string, dto: ReceiveSerialsDto) {
    const order = await this.getPurchaseOrderEntity(id);

    if (!order) {
      throw new NotFoundException("Purchase order not found");
    }

    const item = order.items.find((orderItem) => orderItem.id === dto.purchaseOrderItemId);

    if (!item) {
      throw new NotFoundException("Purchase order item not found");
    }

    const serialNumbers = [...new Set(dto.serialNumbers.map((serial) => serial.trim()).filter(Boolean))];

    if (!serialNumbers.length) {
      throw new BadRequestException("Serial numbers are required");
    }

    const remainingQuantity = item.quantity - item.serials.length;

    if (serialNumbers.length > remainingQuantity) {
      throw new BadRequestException("Serial quantity exceeds purchase order item quantity");
    }

    const existingSerials = await this.prisma.productSerial.findMany({
      where: { serialNumber: { in: serialNumbers } },
      select: { serialNumber: true }
    });

    if (existingSerials.length) {
      throw new BadRequestException(`Duplicate serial number: ${existingSerials[0].serialNumber}`);
    }

    await this.prisma.$transaction([
      this.prisma.productSerial.createMany({
        data: serialNumbers.map((serialNumber) => ({
          serialNumber,
          productId: item.productId,
          purchaseOrderId: order.id,
          purchaseOrderItemId: item.id,
          warehouseLocation: dto.warehouseLocation?.trim() || null
        }))
      }),
      this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: serialNumbers.length } }
      })
    ]);

    const refreshed = await this.getPurchaseOrderEntity(id);

    if (refreshed) {
      const isFullyReceived = refreshed.items.every((orderItem) => orderItem.serials.length >= orderItem.quantity);

      if (isFullyReceived && refreshed.status !== "closed") {
        await this.updateOrderStatus(id, "closed");
      }
    }

    return this.findOne(id);
  }

  private async nextPurchaseOrderNumber() {
    const now = new Date();
    const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const key = `PO-${period}`;
    const counter = await this.prisma.documentCounter.upsert({
      where: { key },
      create: { key, lastNumber: 1 },
      update: { lastNumber: { increment: 1 } }
    });

    return `${key}-${String(counter.lastNumber).padStart(4, "0")}`;
  }

  private getPurchaseOrderEntity(id: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        mainStatus: true,
        items: {
          include: {
            product: true,
            serials: true
          },
          orderBy: [{ createdAt: "asc" }]
        }
      }
    });
  }

  private formatOrder(order: any) {
    return {
      ...order,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      items: order.items.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        amount: Number(item.amount),
        receivedQuantity: item.serials.length,
        remainingQuantity: item.quantity - item.serials.length,
        product: {
          ...item.product,
          price: Number(item.product.price)
        }
      }))
    };
  }

  private async updateOrderStatus(id: string, code: string) {
    const status = await this.getStatusOrThrow(code);

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: status.code,
        mainStatusId: status.id
      }
    });
  }

  private async getStatusOrThrow(code: string) {
    const status = await this.mainStatusesService.findPurchaseOrderStatus(code);

    if (!status) {
      throw new BadRequestException(`Purchase order status is not configured: ${code}`);
    }

    return status;
  }
}
