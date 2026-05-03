import { create } from "zustand";
import { apiClient, getAuthHeaders } from "@/lib/api";
import { Department, MenuPermission, UserRow } from "@/types/admin.type";
import { StoreMenu } from "@/types/menu.type";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }

  return "เกิดข้อผิดพลาดในการเชื่อมต่อ API";
}

function setPermission(
  items: MenuPermission[],
  menuKey: string,
  canView: boolean,
): MenuPermission[] {
  const nextItems = items.map((item) => {
    if (item.key === menuKey) {
      return {
        ...item,
        canView,
        children: item.children?.map((child) => ({ ...child, canView })),
      };
    }

    return {
      ...item,
      children: item.children
        ? setPermission(item.children, menuKey, canView)
        : undefined,
    };
  });

  return nextItems.map((item) =>
    item.children?.some((child) => child.canView)
      ? { ...item, canView: true }
      : item,
  );
}

function collectVisibleKeys(items: MenuPermission[]): string[] {
  return items.flatMap((item) => [
    ...(item.canView ? [item.key] : []),
    ...collectVisibleKeys(item.children ?? []),
  ]);
}

export const useUserMenuPermissionStore = create<StoreMenu>((set, get) => ({
  departments: [],
  users: [],
  menuPermissions: [],
  loading: false,
  saving: false,
  error: undefined,

  setSelectedDepartmentId(departmentId) {
    set({ selectedDepartmentId: departmentId });
  },

  setMenuPermission(menuKey, canView) {
    set((state) => ({
      menuPermissions: setPermission(state.menuPermissions, menuKey, canView),
    }));
  },

  async loadData(accessToken) {
    if (!accessToken) {
      return;
    }

    set({ loading: true, error: undefined });

    try {
      const headers = getAuthHeaders(accessToken);
      const [departmentResponse, userResponse] = await Promise.all([
        apiClient.get<Department[]>("/admin/departments", { headers }),
        apiClient.get<UserRow[]>("/admin/users", { headers }),
      ]);

      const currentDepartmentId = get().selectedDepartmentId;
      const nextDepartmentId =
        currentDepartmentId ?? departmentResponse.data[0]?.id;

      set({
        departments: departmentResponse.data,
        users: userResponse.data,
        selectedDepartmentId: nextDepartmentId,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  async loadPermissions(departmentId, accessToken) {
    if (!accessToken) {
      return;
    }

    set({ error: undefined });

    try {
      const response = await apiClient.get<MenuPermission[]>(
        "/admin/menu-permissions",
        {
          headers: getAuthHeaders(accessToken),
          params: { departmentId },
        },
      );

      set({ menuPermissions: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  async createDepartment(values, accessToken) {
    if (!accessToken) {
      return;
    }

    set({ saving: true, error: undefined });

    try {
      await apiClient.post("/admin/departments", values, {
        headers: getAuthHeaders(accessToken),
      });
      set({ saving: false });
      await get().loadData(accessToken);
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  async assignDepartment(userId, departmentId, accessToken) {
    if (!accessToken) {
      return;
    }

    set({ saving: true, error: undefined });

    try {
      await apiClient.patch(
        `/admin/users/${userId}/department`,
        { departmentId: departmentId ?? null },
        { headers: getAuthHeaders(accessToken) },
      );
      set({ saving: false });
      await get().loadData(accessToken);
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  async saveMenuPermissions(accessToken) {
    const departmentId = get().selectedDepartmentId;

    if (!departmentId || !accessToken) {
      return;
    }

    set({ saving: true, error: undefined });

    try {
      const menuKeys = collectVisibleKeys(get().menuPermissions);
      const response = await apiClient.put<MenuPermission[]>(
        `/admin/menu-permissions/${departmentId}`,
        { menuKeys },
        { headers: getAuthHeaders(accessToken) },
      );

      set({ saving: false, menuPermissions: response.data });
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  clearError() {
    set({ error: undefined });
  },
}));
