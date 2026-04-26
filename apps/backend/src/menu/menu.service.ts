import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user?: AuthenticatedUser) {
    if (user?.role === "super_admin") {
      return this.findAllActiveMenus();
    }

    if (user?.id) {
      return this.findMenusByUserDepartment(user.id);
    }

    return this.findAllActiveMenus();
  }

  private async findAllActiveMenus() {
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

  private async findMenusByUserDepartment(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        departmentId: true,
        department: {
          select: { isActive: true }
        }
      }
    });

    if (!user?.departmentId || !user.department?.isActive) {
      return [];
    }

    const permissions = await this.prisma.departmentMenuPermission.findMany({
      where: {
        departmentId: user.departmentId,
        canView: true,
        menu: { isActive: true }
      },
      include: { menu: true },
      orderBy: [{ menu: { sortOrder: "asc" } }, { menu: { label: "asc" } }]
    });

    return permissions.map((permission) => ({
      key: permission.menu.key,
      label: permission.menu.label,
      description: permission.menu.description
    }));
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
