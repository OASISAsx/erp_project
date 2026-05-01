export type Customer = {
  id: string;
  code: string;
  name: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
};

export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  receivedQuantity: number;
  remainingQuantity: number;
  product: Product;
  serials: {
    id: string;
    serialNumber: string;
    warehouseLocation?: string | null;
  }[];
};

export type MainStatus = {
  id: string;
  code: string;
  label: string;
  color: string;
  sortOrder: number;
};

export type PurchaseOrder = {
  id: string;
  number: string;
  status: string;
  mainStatus?: MainStatus | null;
  note?: string | null;
  total: number;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
};

export type StatusSummary = MainStatus & {
  count: number;
};

export type FormItem = {
  productId?: string;
  quantity?: number;
  unitPrice?: number;
};

export type PurchaseForm = {
  customerId: string;
  note?: string;
  items: FormItem[];
};
