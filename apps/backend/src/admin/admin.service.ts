import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import {
  AssignUserDepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentMenuPermissionsDto
} from "./dto";

const defaultMenus = [
  { key: "sales", label: "ขาย", description: "ใบเสนอราคา ใบสั่งขาย และลูกค้า", sortOrder: 10 },
  { key: "inventory", label: "คลังสินค้า", description: "สินค้า สต็อก และการโอนย้าย", sortOrder: 20 },
  { key: "purchase", label: "จัดซื้อ", description: "ผู้ขาย ใบสั่งซื้อ และรับสินค้า", sortOrder: 30 },
  { key: "accounting", label: "บัญชี", description: "รายรับ รายจ่าย และรายงานบัญชี", sortOrder: 40 },
  { key: "hr", label: "บุคคล", description: "พนักงาน สิทธิ์ และเวลาทำงาน", sortOrder: 50 },
  { key: "reports", label: "รายงาน", description: "แดชบอร์ดและตัวชี้วัด", sortOrder: 60 }
];

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findUsers(user?: AuthenticatedUser) {
    this.assertAdmin(user);

    const users = await this.prisma.user.findMany({
      include: { department: true },
      orderBy: [{ name: "asc" }, { email: "asc" }]
    });

    return users.map((item) => ({
      id: item.id,
      email: item.email,
      name: item.name,
      role: item.role,
      departmentId: item.departmentId,
      departmentName: item.department?.name ?? null,
      isActive: item.isActive
    }));
  }

  async assignUserDepartment(user: AuthenticatedUser | undefined, userId: string, dto: AssignUserDepartmentDto) {
    this.assertAdmin(user);

    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId }
      });

      if (!department) {
        throw new NotFoundException("Department not found");
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { departmentId: dto.departmentId || null },
      include: { department: true }
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      departmentId: updatedUser.departmentId,
      departmentName: updatedUser.department?.name ?? null
    };
  }

  async findDepartments(user?: AuthenticatedUser) {
    this.assertAdmin(user);

    return this.prisma.department.findMany({
      orderBy: [{ name: "asc" }]
    });
  }

  async createDepartment(user: AuthenticatedUser | undefined, dto: CreateDepartmentDto) {
    this.assertAdmin(user);

    return this.prisma.department.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        description: dto.description?.trim()
      }
    });
  }

  async findMenuPermissions(user: AuthenticatedUser | undefined, departmentId: string) {
    this.assertAdmin(user);
    await this.ensureDefaultMenus();

    const menus = await this.prisma.erpMenu.findMany({
      where: { isActive: true },
      include: {
        permissions: {
          where: { departmentId }
        }
      },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
    });

    return menus.map((menu) => ({
      key: menu.key,
      label: menu.label,
      description: menu.description,
      canView: Boolean(menu.permissions[0]?.canView)
    }));
  }

  async updateMenuPermissions(
    user: AuthenticatedUser | undefined,
    departmentId: string,
    dto: UpdateDepartmentMenuPermissionsDto
  ) {
    this.assertAdmin(user);
    await this.ensureDefaultMenus();

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      throw new NotFoundException("Department not found");
    }

    const menus = await this.prisma.erpMenu.findMany({
      where: { isActive: true }
    });
    const allowedKeys = new Set(dto.menuKeys);

    await this.prisma.$transaction(
      menus.map((menu) =>
        this.prisma.departmentMenuPermission.upsert({
          where: {
            departmentId_menuId: {
              departmentId,
              menuId: menu.id
            }
          },
          create: {
            departmentId,
            menuId: menu.id,
            canView: allowedKeys.has(menu.key)
          },
          update: {
            canView: allowedKeys.has(menu.key)
          }
        })
      )
    );

    return this.findMenuPermissions(user, departmentId);
  }

  private async ensureDefaultMenus() {
    await this.prisma.$transaction(
      defaultMenus.map((menu) =>
        this.prisma.erpMenu.upsert({
          where: { key: menu.key },
          create: menu,
          update: {
            label: menu.label,
            description: menu.description,
            sortOrder: menu.sortOrder,
            isActive: true
          }
        })
      )
    );
  }

  private assertAdmin(user?: AuthenticatedUser) {
    if (user?.role !== "super_admin") {
      throw new ForbiddenException("Admin permission required");
    }
  }
}
