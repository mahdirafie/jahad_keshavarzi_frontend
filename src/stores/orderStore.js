import { create } from "zustand";
import apiClient from "../common/apiClient";
import adminApiClient from "../common/adminApiClient";

const useOrderStore = create((set, get) => ({
  // ---------- State ----------
  orders: [],
  currentOrder: null,
  allUsersOrders: [],
  ordersCount: { cash: 0, installment: 0, total: 0, today: 0 },
  ordersPagination: { currentPage: 1, limit: 10, total: 0, pages: 1 },
  appliedFilters: { payment_method: null, status: null, search: null },
  isLoading: false,
  error: null,
  isLoadingAll: false,
  errorAll: null,

  // ---------- Actions ----------

  // ------------------------------------------------------------
  // 1. SUBMIT ORDER (after successful payment)
  // Endpoint: POST /order/submit
  // ------------------------------------------------------------
  submitOrder: async (orderData) => {
    set({ isLoading: true, error: null });

    try {
      const required = ["product_id", "machinery_id", "payment_method", "paid", "authority", "ref_id"];
      for (const field of required) {
        if (!orderData[field]) {
          set({ isLoading: false, error: `فیلد ${field} الزامی است` });
          return { success: false, error: `Missing field: ${field}` };
        }
      }

      const response = await apiClient.post("/order/submit", orderData);
      const { order } = response.data;

      set((state) => ({
        orders: [order, ...state.orders],
        currentOrder: order,
        isLoading: false,
        error: null,
      }));

      return { success: true, data: order };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // ------------------------------------------------------------
  // 2. FETCH USER ORDERS
  // Endpoint: GET /order/user-orders
  // ------------------------------------------------------------
  fetchOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get("/order/user-orders");

      set({
        orders: response.data.orders || [],
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data.orders };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // ------------------------------------------------------------
  // 3. FETCH ALL USERS ORDERS (admin)
  // ------------------------------------------------------------
  fetchAllUsersOrders: async ({ query = "", page = 1, limit = 10, payment_method, status } = {}) => {
    set({ isLoadingAll: true, errorAll: null });
    try {
      const params = { query: query || undefined, page, limit };
      if (payment_method) params.payment_method = payment_method;
      if (status) params.status = status;

      const response = await adminApiClient.get("/order/all-users-orders", { params });

      set({
        allUsersOrders: response.data.info || [],
        ordersCount: response.data.count || { cash: 0, installment: 0, total: 0, today: 0 },
        ordersPagination: response.data.pagination || { currentPage: 1, limit: 10, total: 0, pages: 1 },
        appliedFilters: response.data.appliedFilters || { payment_method: null, status: null, search: null },
        isLoadingAll: false,
      });
      return { success: true, data: response.data.info };
    } catch (error) {
      set({ errorAll: error.message, isLoadingAll: false });
      return { success: false, error: error.message };
    }
  },

  // ------------------------------------------------------------
  // 4. CHANGE ORDER PAYMENT METHOD (admin)
  // ------------------------------------------------------------
  changeOrderPaymentMethod: async (orderId, refreshFn) => {
    try {
      await adminApiClient.patch(`/order/change-payment-method/${orderId}`, {});
      if (typeof refreshFn === "function") refreshFn();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ------------------------------------------------------------
  // 5. CHANGE ORDER STATUS (admin)
  // ------------------------------------------------------------
  changeOrderStatus: async (orderId, status, phone, refreshFn) => {
    try {
      await adminApiClient.patch(`/order/change-status/${orderId}`, { status, phone });
      if (typeof refreshFn === "function") refreshFn();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null, errorAll: null }),

  reset: () =>
    set({
      orders: [],
      currentOrder: null,
      allUsersOrders: [],
      ordersCount: { cash: 0, installment: 0, total: 0, today: 0 },
      ordersPagination: { currentPage: 1, limit: 10, total: 0, pages: 1 },
      appliedFilters: { payment_method: null, status: null, search: null },
      isLoading: false,
      error: null,
      isLoadingAll: false,
      errorAll: null,
    }),
}));

export default useOrderStore;
