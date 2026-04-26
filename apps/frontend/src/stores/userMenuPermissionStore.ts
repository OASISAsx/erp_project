import { create } from "zustand";
import { apiClient, getAuthHeaders } from "@/lib/api";
import type { Department, DepartmentForm, MenuPermission, UserRow } from "@/types/admin";

type StoreState = {
  departments: Department[];
  users: UserRow[];
  menuPermissions: MenuPermission[];
  selectedDepartmentId?: string;
  loading: boolean;
  saving: boolean;
  error?: string;
  setSelectedDepartmentId: (departmentId?: string) => void;
  setMenuPermission: (menuKey: string, canView: boolean) => void;
  loadData: (accessToken?: string) => Promise<void>;
  loadPermissions: (departmentId: string, accessToken?: string) => Promise<void>;
  createDepartment: (values: DepartmentForm, accessToken?: string) => Promise<void>;
  assignDepartment: (userId: string, departmentId: string | undefined, accessToken?: string) => Promise<void>;
  saveMenuPermissions: (accessToken?: string) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }

  return "เกิดข้อผิดพลาดในการเชื่อมต่อ API";
}

export const useUserMenuPermissionStore = create<StoreState>((set, get) => ({
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
      menuPermissions: state.menuPermissions.map((item) =>
        item.key === menuKey ? { ...item, canView } : item
      )
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
        apiClient.get<UserRow[]>("/admin/users", { headers })
      ]);

      const currentDepartmentId = get().selectedDepartmentId;
      const nextDepartmentId = currentDepartmentId ?? departmentResponse.data[0]?.id;

      set({
        departments: departmentResponse.data,
        users: userResponse.data,
        selectedDepartmentId: nextDepartmentId,
        loading: false
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
      const response = await apiClient.get<MenuPermission[]>("/admin/menu-permissions", {
        headers: getAuthHeaders(accessToken),
        params: { departmentId }
      });

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
        headers: getAuthHeaders(accessToken)
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
        { headers: getAuthHeaders(accessToken) }
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
      const menuKeys = get()
        .menuPermissions.filter((item) => item.canView)
        .map((item) => item.key);
      const response = await apiClient.put<MenuPermission[]>(
        `/admin/menu-permissions/${departmentId}`,
        { menuKeys },
        { headers: getAuthHeaders(accessToken) }
      );

      set({ saving: false, menuPermissions: response.data });
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  clearError() {
    set({ error: undefined });
  }
}));
