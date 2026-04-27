import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto, CreateProductDto, UpdateCustomerDto, UpdateProductDto } from "./dto";

@Injectable()
export class MasterDataService {
  constructor(private readonly prisma: PrismaService) {}

  async findCustomers() {
    return this.prisma.customer.findMany({
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }]
    });
  }

  async createCustomer(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        code: dto.code,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        isActive: dto.isActive ?? true
      }
    });
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    await this.ensureCustomer(id);

    return this.prisma.customer.update({
      where: { id },
      data: dto
    });
  }

  async removeCustomer(id: string) {
    await this.ensureCustomer(id);
    await this.prisma.customer.delete({ where: { id } });

    return { id };
  }

  async findProducts() {
    const products = await this.prisma.product.findMany({
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }]
    });

    return products.map((product) => ({
      ...product,
      price: Number(product.price)
    }));
  }

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        unit: dto.unit || "ชิ้น",
        price: dto.price,
        stock: dto.stock,
        isActive: dto.isActive ?? true
      }
    });

    return { ...product, price: Number(product.price) };
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.ensureProduct(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: dto
    });

    return { ...product, price: Number(product.price) };
  }

  async removeProduct(id: string) {
    await this.ensureProduct(id);
    await this.prisma.product.delete({ where: { id } });

    return { id };
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private async ensureProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });

    if (!product) {
      throw new NotFoundException("Product not found");
    }
  }
}
