import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const menus = await this.prisma.erpMenu
      .findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
      })
      .catch(() => []);

    if (menus.length > 0) {
      return menus.map((menu) => ({
        key: menu.key,
        label: menu.label,
        description: menu.description
      }));
    }

    return this.fallbackMenus();
  }

  private fallbackMenus() {
    return [
      { key: "sales", label: "ขาย", description: "ใบเสนอราคา ใบสั่งขาย และลูกค้า" },
      { key: "inventory", label: "คลังสินค้า", description: "สินค้า สต็อก และการโอนย้าย" },
      { key: "purchase", label: "จัดซื้อ", description: "ผู้ขาย ใบสั่งซื้อ และรับสินค้า" },
      { key: "accounting", label: "บัญชี", description: "รายรับ รายจ่าย และรายงานบัญชี" },
      { key: "hr", label: "บุคคล", description: "พนักงาน สิทธิ์ และเวลาทำงาน" },
      { key: "reports", label: "รายงาน", description: "แดชบอร์ดและตัวชี้วัด" }
    ];
  }
}
