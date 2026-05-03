import {
  Department,
  DepartmentForm,
  MenuPermission,
  UserRow,
} from "./admin.type";

export type MenuItem = {
  key: string;
  label: string;
  description: string;
  path?: string | null;
  children?: MenuItem[];
};

export type StoreMenu = {
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
  loadPermissions: (
    departmentId: string,
    accessToken?: string,
  ) => Promise<void>;
  createDepartment: (
    values: DepartmentForm,
    accessToken?: string,
  ) => Promise<void>;
  assignDepartment: (
    userId: string,
    departmentId: string | undefined,
    accessToken?: string,
  ) => Promise<void>;
  saveMenuPermissions: (accessToken?: string) => Promise<void>;
  clearError: () => void;
};
