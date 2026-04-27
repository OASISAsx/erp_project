import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

type MenuRecord = {
  id: string;
  key: string;
  label: string;
  description: string;
  path: string | null;
  parentId: string | null;
};

export type MenuResponse = {
  key: string;
  label: string;
  description: string;
  path?: string | null;
  children?: MenuResponse[];
};

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
      return this.buildMenuTree(menus);
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

    return this.buildMenuTree(permissions.map((permission) => permission.menu));
  }

  private buildMenuTree(menus: MenuRecord[]): MenuResponse[] {
    const menuById = new Map<string, MenuResponse & { parentId?: string | null }>();

    menus.forEach((menu) => {
      menuById.set(menu.id, {
        key: menu.key,
        label: menu.label,
        description: menu.description,
        path: menu.path,
        parentId: menu.parentId,
        children: []
      });
    });

    const roots: (MenuResponse & { parentId?: string | null })[] = [];

    menuById.forEach((menu) => {
      if (menu.parentId && menuById.has(menu.parentId)) {
        menuById.get(menu.parentId)?.children?.push(menu);
        return;
      }

      roots.push(menu);
    });

    const clean = (menu: MenuResponse & { parentId?: string | null }): MenuResponse => {
      const { parentId: _parentId, children, ...rest } = menu;
      return children?.length ? { ...rest, children: children.map(clean) } : rest;
    };

    return roots.map(clean);
  }

  private fallbackMenus(): MenuResponse[] {
    return [
      {
        key: "master",
        label: "ข้อมูลหลัก",
        description: "ข้อมูลหลัก",
        children: [
          {
            key: "master.customers",
            label: "ลูกค้า",
            description: "สร้างและจัดการข้อมูลลูกค้า",
            path: "/master/customers"
          },
          {
            key: "master.products",
            label: "สินค้า",
            description: "สร้างและจัดการข้อมูลสินค้า",
            path: "/master/products"
          }
        ]
      }
    ];
  }
}
