import { create } from "zustand";
import axios from "axios";
import BASE_URL from "../common/baseUrl";

const useOrderStore = create((set, get) => ({
  // ---------- State ----------
  orders: [], // list of user's orders with product & machinery details
  currentOrder: null, // the last submitted order (optional)
  isLoading: false,
  error: null,

  // ---------- Actions ----------

  // ------------------------------------------------------------
  // 1. SUBMIT ORDER (after successful payment)
  // Endpoint: POST /order/submit
  // Required: product_id, machinery_id, payment_method, paid, authority, ref_id, status (optional)
  // ------------------------------------------------------------
  submitOrder: async (orderData) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        set({ isLoading: false, error: "لطفاً وارد حساب کاربری خود شوید" });
        return { success: false, error: "No token found" };
      }

      // Validate required fields
      const required = [
        "product_id",
        "machinery_id",
        "payment_method",
        "paid",
        "authority",
        "ref_id",
      ];
      for (const field of required) {
        if (!orderData[field]) {
          set({ isLoading: false, error: `فیلد ${field} الزامی است` });
          return { success: false, error: `Missing field: ${field}` };
        }
      }

      const response = await axios.post(`${BASE_URL}/order/submit`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Backend returns { message, order }
      const { order } = response.data;

      set((state) => ({
        orders: [order, ...state.orders], // add to list
        currentOrder: order,
        isLoading: false,
        error: null,
      }));

      return { success: true, data: order };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "خطا در ثبت سفارش";

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // ------------------------------------------------------------
  // 2. FETCH USER ORDERS
  // Endpoint: GET /order/user-orders   (returns orders with product & machinery details)
  // ------------------------------------------------------------
  fetchOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        set({ isLoading: false, error: "لطفاً وارد حساب کاربری خود شوید" });
        return { success: false, error: "No token found" };
      }

      const response = await axios.get(`${BASE_URL}/order/user-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend returns { orders: [...] } with full details including product & machinery
      set({
        orders: response.data.orders || [],
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data.orders };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "خطا در دریافت سفارش‌ها";

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // ------------------------------------------------------------
  // 3. UTILITY: clear error
  // ------------------------------------------------------------
  clearError: () => set({ error: null }),

  // ------------------------------------------------------------
  // 4. RESET STORE (e.g., on logout)
  // ------------------------------------------------------------
  reset: () =>
    set({
      orders: [],
      currentOrder: null,
      isLoading: false,
      error: null,
    }),
}));

export default useOrderStore;
