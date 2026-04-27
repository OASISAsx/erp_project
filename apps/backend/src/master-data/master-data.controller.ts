import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateCustomerDto, CreateProductDto, UpdateCustomerDto, UpdateProductDto } from "./dto";
import { MasterDataService } from "./master-data.service";

@Controller("master")
@UseGuards(JwtAuthGuard)
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get("customers")
  findCustomers() {
    return this.masterDataService.findCustomers();
  }

  @Post("customers")
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.masterDataService.createCustomer(dto);
  }

  @Patch("customers/:id")
  updateCustomer(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.masterDataService.updateCustomer(id, dto);
  }

  @Delete("customers/:id")
  removeCustomer(@Param("id") id: string) {
    return this.masterDataService.removeCustomer(id);
  }

  @Get("products")
  findProducts() {
    return this.masterDataService.findProducts();
  }

  @Post("products")
  createProduct(@Body() dto: CreateProductDto) {
    return this.masterDataService.createProduct(dto);
  }

  @Patch("products/:id")
  updateProduct(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.masterDataService.updateProduct(id, dto);
  }

  @Delete("products/:id")
  removeProduct(@Param("id") id: string) {
    return this.masterDataService.removeProduct(id);
  }
}
