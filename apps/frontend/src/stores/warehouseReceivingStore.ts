import { create } from "zustand";
import { apiClient, getAuthHeaders } from "@/lib/api";
import type { ReceivingPurchaseOrder } from "@/types/warehouse.type";

type ReceiveSerialPayload = {
  orderId: string;
  purchaseOrderItemId: string;
  serialNumbers: string[];
  warehouseLocation?: string;
};

type WarehouseReceivingState = {
  orders: ReceivingPurchaseOrder[];
  loading: boolean;
  saving: boolean;
  loadOrders: (accessToken?: string) => Promise<void>;
  receiveSerials: (
    payload: ReceiveSerialPayload,
    accessToken?: string,
  ) => Promise<ReceivingPurchaseOrder | undefined>;
  clearOrders: () => void;
};

export const useWarehouseReceivingStore = create<WarehouseReceivingState>(
  (set) => ({
    orders: [],
    loading: false,
    saving: false,

    async loadOrders(accessToken) {
      if (!accessToken) {
        set({ orders: [] });
        return;
      }

      set({ loading: true });

      try {
        const response = await apiClient.get<ReceivingPurchaseOrder[]>(
          "/purchase-orders",
          {
            headers: getAuthHeaders(accessToken),
          },
        );
        set({ orders: response.data, loading: false });
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    async receiveSerials(payload, accessToken) {
      if (!accessToken) {
        return undefined;
      }

      set({ saving: true });

      try {
        const response = await apiClient.post<ReceivingPurchaseOrder>(
          `/purchase-orders/${payload.orderId}/serials`,
          {
            purchaseOrderItemId: payload.purchaseOrderItemId,
            serialNumbers: payload.serialNumbers,
            warehouseLocation: payload.warehouseLocation,
          },
          { headers: getAuthHeaders(accessToken) },
        );

        set((state) => ({
          saving: false,
          orders: state.orders.map((order) =>
            order.id === response.data.id ? response.data : order,
          ),
        }));

        return response.data;
      } catch (error) {
        set({ saving: false });
        throw error;
      }
    },

    clearOrders() {
      set({ orders: [] });
    },
  }),
);
