export type Department = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

export type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string | null;
  departmentName?: string | null;
  isActive: boolean;
};

export type MenuPermission = {
  key: string;
  label: string;
  description: string;
  canView: boolean;
};

export type DepartmentForm = {
  code: string;
  name: string;
};
