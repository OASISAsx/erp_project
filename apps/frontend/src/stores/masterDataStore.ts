import { create } from "zustand";
import { apiClient, getAuthHeaders } from "@/lib/api";
import type { MasterRecord } from "@/types/master.type";

type MasterDataState = {
  endpoint?: string;
  records: MasterRecord[];
  loading: boolean;
  saving: boolean;
  loadRecords: (endpoint: string, accessToken?: string) => Promise<void>;
  createRecord: (
    endpoint: string,
    values: Record<string, unknown>,
    accessToken?: string,
  ) => Promise<void>;
  updateRecord: (
    endpoint: string,
    id: string,
    values: Record<string, unknown>,
    accessToken?: string,
  ) => Promise<void>;
  deleteRecord: (
    endpoint: string,
    id: string,
    accessToken?: string,
  ) => Promise<void>;
  clearRecords: () => void;
};

export const useMasterDataStore = create<MasterDataState>((set) => ({
  endpoint: undefined,
  records: [],
  loading: false,
  saving: false,

  async loadRecords(endpoint, accessToken) {
    if (!accessToken) {
      set({ endpoint, records: [] });
      return;
    }

    set({ endpoint, loading: true });

    try {
      const response = await apiClient.get<MasterRecord[]>(endpoint, {
        headers: getAuthHeaders(accessToken),
      });
      set({ records: response.data, loading: false });
    } catch (error) {
      set({ records: [], loading: false });
      throw error;
    }
  },

  async createRecord(endpoint, values, accessToken) {
    if (!accessToken) {
      return;
    }

    set({ saving: true });

    try {
      await apiClient.post(endpoint, values, {
        headers: getAuthHeaders(accessToken),
      });
      set({ saving: false });
    } catch (error) {
      set({ saving: false });
      throw error;
    }
  },

  async updateRecord(endpoint, id, values, accessToken) {
    if (!accessToken) {
      return;
    }

    set({ saving: true });

    try {
      await apiClient.patch(`${endpoint}/${id}`, values, {
        headers: getAuthHeaders(accessToken),
      });
      set({ saving: false });
    } catch (error) {
      set({ saving: false });
      throw error;
    }
  },

  async deleteRecord(endpoint, id, accessToken) {
    if (!accessToken) {
      return;
    }

    await apiClient.delete(`${endpoint}/${id}`, {
      headers: getAuthHeaders(accessToken),
    });
  },

  clearRecords() {
    set({ records: [] });
  },
}));
