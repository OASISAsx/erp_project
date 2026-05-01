import type { ReactNode } from "react";

export type MasterField = {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "textarea" | "number" | "switch";
  width?: number;
  render?: (value: unknown, record: MasterRecord) => ReactNode;
};

export type MasterRecord = {
  id: string;
  [key: string]: unknown;
};
