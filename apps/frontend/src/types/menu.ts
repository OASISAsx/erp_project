export type MenuItem = {
  key: string;
  label: string;
  description: string;
  path?: string | null;
  children?: MenuItem[];
};
