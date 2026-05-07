import { create } from "zustand";
import apiClient from "../common/apiClient";

const useReservationStore = create((set, get) => ({
  // ---------- State ----------
  isLoading: false,
  error: null,
  currentReservations: [],

  // ---------- Actions ----------

  // ------------------------------------------------------------
  // 1. CREATE RESERVATION
  // Endpoint: POST /reservation/create
  // ------------------------------------------------------------
  createReservation: async (product_id, machinery_id, payment_method, authority) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post("/reservation/create", {
        product_id,
        machinery_id,
        payment_method,
        authority,
      });

      const { reservation } = response.data;

      set((state) => ({
        currentReservations: [...state.currentReservations, reservation],
        isLoading: false,
        error: null,
      }));

      return { success: true, data: reservation };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // ------------------------------------------------------------
  // 2. CANCEL RESERVATION
  // Endpoint: POST /reservation/cancel
  // ------------------------------------------------------------
  cancelReservation: async (reservation_id) => {
    set({ isLoading: true, error: null });

    try {
      await apiClient.post("/reservation/cancel", { reservation_id });

      set((state) => ({
        currentReservations: state.currentReservations.filter(
          (r) => r.id !== reservation_id
        ),
        isLoading: false,
        error: null,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // ------------------------------------------------------------
  // 3. VERIFY PAYMENT (called after gateway redirect)
  // Endpoint: GET /reservation/verify?Authority=...&Status=...
  // ------------------------------------------------------------
  verifyPayment: async (Authority, Status) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get("/reservation/verify", {
        params: { Authority, Status },
      });

      set({ isLoading: false, error: null });
      return { success: true, data: response.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      isLoading: false,
      error: null,
      currentReservations: [],
    }),
}));

export default useReservationStore;
