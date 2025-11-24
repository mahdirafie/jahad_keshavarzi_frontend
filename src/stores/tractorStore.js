import { create } from "zustand";
import axios from "axios";
import { BASE_URL } from "../common/config";

const useTractorStore = create((set, get) => ({
  // State
  tractors: [],
  isLoading: false,
  error: null,

  // Actions
  getTractorsByUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        set({
          isLoading: false,
          error: "No token found",
        });
        return { success: false, error: "No token found" };
      }

      const response = await axios.get(`${BASE_URL}/tractor/by_user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        tractors: response.data,
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to get tractors";

      set({
        error: errorMessage,
        isLoading: false,
        tractors: [],
      });

      return { success: false, error: errorMessage };
    }
  },

  createTractor: async (tractorData) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        set({
          isLoading: false,
          error: "No token found",
        });
        return { success: false, error: "No token found" };
      }

      const response = await axios.post(
        `${BASE_URL}/tractor/create`,
        tractorData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Add the new tractor to the list
      const newTractor = response.data;
      set((state) => ({
        tractors: [...state.tractors, newTractor],
        isLoading: false,
        error: null,
      }));

      return { success: true, data: newTractor };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create tractor";

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useTractorStore;
