import { create } from 'zustand';
import apiClient from '../common/apiClient';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  getProfile: async () => {
    set({ isLoading: true, error: null });

    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await apiClient.get('/user/get_profile');

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });

      return { success: false, error: error.message };
    }
  },

  completeProfile: async (profileData) => {
    set({ isLoading: true, error: null });

    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ isLoading: false, error: 'No token found' });
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await apiClient.put('/user/complete_profile', profileData);

      set((state) => ({
        user: { ...state.user, ...profileData },
        isLoading: false,
        error: null,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkProfileCompletion: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return { success: false, is_complete: false, missing_fields: [] };

      const response = await apiClient.get('/user/profile-completion');
      return {
        success: true,
        is_complete: response.data.is_complete,
        missing_fields: response.data.missing_fields || [],
      };
    } catch (error) {
      return { success: false, is_complete: false, missing_fields: [] };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
