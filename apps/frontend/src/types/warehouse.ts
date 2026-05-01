import type { Customer } from "./purchase";

export type ReceivingProduct = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  stock: number;
};

export type Serial = {
  id: string;
  serialNumber: string;
  warehouseLocation?: string | null;
};

export type ReceivingOrderItem = {
  id: string;
  quantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  product: ReceivingProduct;
  serials: Serial[];
};

export type ReceivingPurchaseOrder = {
  id: string;
  number: string;
  status: string;
  mainStatus?: {
    code: string;
    label: string;
    color: string;
  } | null;
  createdAt: string;
  customer: Customer;
  items: ReceivingOrderItem[];
};

export type ScanTarget = {
  order: ReceivingPurchaseOrder;
  item: ReceivingOrderItem;
};
