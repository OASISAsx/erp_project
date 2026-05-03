import { create } from "zustand";
import { apiClient, getAuthHeaders } from "@/lib/api";
import type {
  Customer,
  Product,
  PurchaseForm,
  PurchaseOrder,
  StatusSummary,
} from "@/types/purchase.type";

type PurchaseOrderState = {
  customers: Customer[];
  products: Product[];
  orders: PurchaseOrder[];
  statusSummary: StatusSummary[];
  loading: boolean;
  saving: boolean;
  loadData: (accessToken?: string) => Promise<void>;
  createOrder: (
    values: PurchaseForm,
    accessToken?: string,
  ) => Promise<PurchaseOrder | undefined>;
};

export const usePurchaseOrderStore = create<PurchaseOrderState>((set, get) => ({
  customers: [],
  products: [],
  orders: [],
  statusSummary: [],
  loading: false,
  saving: false,

  async loadData(accessToken) {
    if (!accessToken) {
      set({ customers: [], products: [], orders: [], statusSummary: [] });
      return;
    }

    set({ loading: true });

    try {
      const headers = getAuthHeaders(accessToken);
      const [customerResponse, productResponse, orderResponse, statusResponse] =
        await Promise.all([
          apiClient.get<Customer[]>("/master/customers", { headers }),
          apiClient.get<Product[]>("/master/products", { headers }),
          apiClient.get<PurchaseOrder[]>("/purchase-orders", { headers }),
          apiClient.get<StatusSummary[]>("/purchase-orders/status-summary", {
            headers,
          }),
        ]);

      set({
        customers: customerResponse.data,
        products: productResponse.data,
        orders: orderResponse.data,
        statusSummary: statusResponse.data,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  async createOrder(values, accessToken) {
    if (!accessToken) {
      return undefined;
    }

    set({ saving: true });

    try {
      const created = await apiClient.post<PurchaseOrder>(
        "/purchase-orders",
        values,
        {
          headers: getAuthHeaders(accessToken),
        },
      );
      set({ saving: false });
      await get().loadData(accessToken);
      return created.data;
    } catch (error) {
      set({ saving: false });
      throw error;
    }
  },
}));
