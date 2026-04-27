import { Injectable } from "@nestjs/common";
import { AuthenticatedUser } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

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
    if (!user?.id) {
      return [];
    }

    return this.findMenusByUserDepartment(user.id);
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

    const menuPermissions = await this.prisma.departmentMenuPermission.findMany({
      where: {
        departmentId: user.departmentId,
        canView: true,
        menu: { isActive: true }
      },
      include: {
        menu: {
          include: {
            subMenus: {
              where: {
                isActive: true,
                permissions: {
                  some: {
                    departmentId: user.departmentId,
                    canView: true
                  }
                }
              },
              orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
            }
          }
        }
      },
      orderBy: [{ menu: { sortOrder: "asc" } }, { menu: { label: "asc" } }]
    });

    return menuPermissions.map((permission) => ({
      key: permission.menu.key,
      label: permission.menu.label,
      description: permission.menu.description,
      path: this.getMainMenuPath(permission.menu.key),
      children: permission.menu.subMenus.map((subMenu) => ({
        key: subMenu.key,
        label: subMenu.label,
        description: subMenu.description,
        path: subMenu.path
      }))
    }));
  }

  private getMainMenuPath(key: string) {
    if (key === "master") {
      return "/master";
    }

    return null;
  }
}
