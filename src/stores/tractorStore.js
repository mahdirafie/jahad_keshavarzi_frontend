import { create } from "zustand";
import axios from "axios";
import BASE_URL from "../common/baseUrl";

const useTractorStore = create((set, get) => ({
  // State - ensure tractors is always an array
  tractors: [],
  price: null,
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

      // Ensure we always set an array, even if response.data is null/undefined
      const tractorsData = Array.isArray(response.data.tractors) ? response.data.tractors : [];

      set({
        tractors: tractorsData,
        isLoading: false,
        error: null,
        price: response.data.price ? response.data.price: null
      });

      return { success: true, data: tractorsData };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to get tractors";

      set({
        error: errorMessage,
        isLoading: false,
        tractors: [], // Reset to empty array on error
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

      // Ensure proper data types in the request body
      const requestBody = {
        model: tractorData.model,
        production_year: tractorData.production_year, // string
        ...(tractorData.power && { power: parseInt(tractorData.power) }), // number
        ...(tractorData.cylinder_no && {
          cylinder_no: parseInt(tractorData.cylinder_no),
        }), // number
      };

      const response = await axios.post(
        `${BASE_URL}/tractor/create`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Add the new tractor to the list - ensure state.tractors is always an array
      const newTractor = response.data;
      set((state) => {
        const currentTractors = Array.isArray(state.tractors)
          ? state.tractors
          : [];
        return {
          tractors: [...currentTractors, newTractor],
          isLoading: false,
          error: null,
        };
      });

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

  deleteTractor: async (tractorId) => {
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

      const response = await axios.delete(
        `${BASE_URL}/tractor/delete/${tractorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the tractor from the list - ensure state.tractors is always an array
      set((state) => {
        const currentTractors = Array.isArray(state.tractors)
          ? state.tractors
          : [];
        return {
          tractors: currentTractors.filter(
            (tractor) => tractor.id !== tractorId
          ),
          isLoading: false,
          error: null,
        };
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete tractor";

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
