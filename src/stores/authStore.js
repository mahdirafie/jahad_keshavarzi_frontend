import { create } from 'zustand';
import apiClient from '../common/apiClient';

const useAuthStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // GET /user/get_profile
  // The httpOnly cookie is sent automatically; no token check needed.
  getProfile: async () => {
    set({ isLoading: true, error: null });
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

  // PUT /user/complete_profile
  completeProfile: async (profileData) => {
    set({ isLoading: true, error: null });
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

  // GET /user/profile-completion
  checkProfileCompletion: async () => {
    try {
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

  // POST /user/logout — server clears the httpOnly cookies
  logout: async () => {
    try {
      await apiClient.post('/user/logout', {});
    } catch (_) {
      // Clear local state regardless of server response
    } finally {
      localStorage.removeItem('isLoggedIn');
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
