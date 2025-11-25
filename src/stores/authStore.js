import { create } from 'zustand';
import axios from 'axios';
import BASE_URL from '../common/baseUrl';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  getProfile: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        set({ 
          isLoading: false, 
          isAuthenticated: false,
          user: null 
        });
        return { success: false, error: 'No token found' };
      }

      const response = await axios.get(`${BASE_URL}/user/get_profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, data: response.data };

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get profile';
      
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
      
      return { success: false, error: errorMessage };
    }
  },

  completeProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        set({ 
          isLoading: false, 
          error: 'No token found' 
        });
        return { success: false, error: 'No token found' };
      }

      const response = await axios.put(`${BASE_URL}/user/complete_profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update user data in store
      set(state => ({
        user: { ...state.user, ...profileData },
        isLoading: false,
        error: null
      }));

      return { success: true, data: response.data };

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to complete profile';
      
      set({
        error: errorMessage,
        isLoading: false
      });
      
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;