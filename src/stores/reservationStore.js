import { create } from "zustand";
import axios from "axios";
import BASE_URL from "../common/baseUrl";

const useReservationStore = create((set, get) => ({
  // ---------- State ----------
  isLoading: false,
  error: null,
  currentReservations: [], // array of reservations created in the current session

  // ---------- Actions ----------

  // ------------------------------------------------------------
  // 1. CREATE RESERVATION
  // Endpoint: POST /reservation/create
  // Required: product_id, machinery_id, payment_method, authority
  // ------------------------------------------------------------
  createReservation: async (
    product_id,
    machinery_id,
    payment_method,
    authority
  ) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        set({ isLoading: false, error: "لطفاً وارد حساب کاربری خود شوید" });
        return { success: false, error: "No token found" };
      }

      const response = await axios.post(
        `${BASE_URL}/reservation/create`,
        {
          product_id,
          machinery_id,
          payment_method,
          authority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Backend returns { message, reservation: { id, authority, amount, expiresAt, machinery_id } }
      const { reservation } = response.data;

      // Add to list of current reservations
      set((state) => ({
        currentReservations: [...state.currentReservations, reservation],
        isLoading: false,
        error: null,
      }));

      return {
        success: true,
        data: reservation, // reservation object without gateway_url
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "خطا در ایجاد رزرو";

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // ------------------------------------------------------------
  // 2. CANCEL RESERVATION
  // Endpoint: POST /reservation/cancel
  // Required: reservation_id
  // ------------------------------------------------------------
  cancelReservation: async (reservation_id) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        set({ isLoading: false, error: "لطفاً وارد حساب کاربری خود شوید" });
        return { success: false, error: "No token found" };
      }

      await axios.post(
        `${BASE_URL}/reservation/cancel`,
        { reservation_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Remove the reservation from currentReservations
      set((state) => ({
        currentReservations: state.currentReservations.filter(
          (r) => r.id !== reservation_id
        ),
        isLoading: false,
        error: null,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "خطا در لغو رزرو";

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // ------------------------------------------------------------
  // 3. VERIFY PAYMENT (called after gateway redirect)
  // Endpoint: GET /reservation/verify?Authority=...&Status=...
  // ------------------------------------------------------------
  verifyPayment: async (Authority, Status) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        set({ isLoading: false, error: "لطفاً وارد حساب کاربری خود شوید" });
        return { success: false, error: "No token found" };
      }

      const response = await axios.get(`${BASE_URL}/reservation/verify`, {
        params: { Authority, Status },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend returns { status, message, ref_id?, amount?, code? }
      set({ isLoading: false, error: null });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "خطا در تأیید پرداخت";

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // ------------------------------------------------------------
  // Utility: clear any stored error
  // ------------------------------------------------------------
  clearError: () => set({ error: null }),

  // ------------------------------------------------------------
  // Reset the store (e.g., on logout)
  // ------------------------------------------------------------
  reset: () =>
    set({
      isLoading: false,
      error: null,
      currentReservations: [],
    }),
}));

export default useReservationStore;
