import { create } from 'zustand';
import axios from 'axios';
import BASE_URL from '../common/baseUrl';

const useMachineryStore = create((set, get) => ({
  // State
  machines: [],
  product: null,
  isLoading: false,
  error: null,

  // ------------------------------------------------------------
  // Fetch all machines of the logged‑in user
  // Endpoint: GET /agricultural_machinery/machines
  // ------------------------------------------------------------
  fetchMachines: async () => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        set({ isLoading: false, error: 'لطفاً وارد حساب کاربری خود شوید' });
        return { success: false, error: 'No token found' };
      }

      const response = await axios.get(`${BASE_URL}/agricultural_machinery/machines`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend returns { message, machines: [...] }
      set({
        machines: response.data.machines || [],
        product: response.data.product || null, 
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data.machines };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'خطا در دریافت اطلاعات ماشین‌آلات';

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // ------------------------------------------------------------
  // Create a new machine (tractor / combine / chopper)
  // type: 'tractor' | 'combine' | 'chopper'
  // machineData: { manufacture_year, model, ...typeSpecific }
  // ------------------------------------------------------------
  createMachine: async (type, machineData) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        set({ isLoading: false, error: 'لطفاً وارد حساب کاربری خود شوید' });
        return { success: false, error: 'No token found' };
      }

      // Determine endpoint and build payload
      let endpoint;
      const payload = {
        manufacture_year: machineData.manufacture_year,
        model: machineData.model,
      };

      switch (type) {
        case 'tractor':
          endpoint = '/agricultural_machinery/create-tractor';
          payload.tractor_type = machineData.tractor_type;
          break;
        case 'combine':
          endpoint = '/agricultural_machinery/create-combine';
          payload.usage_type = machineData.usage_type;
          break;
        case 'chopper':
          endpoint = '/agricultural_machinery/create-chopper';
          payload.chopper_type = machineData.chopper_type;
          break;
        default:
          throw new Error('Invalid machine type');
      }

      const response = await axios.post(`${BASE_URL}${endpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Construct the full machine object exactly as the GET endpoint returns it
      // Response contains: { agricultural_machinery, tractor/combine/chopper }
      const newMachine = {
        ...response.data.agricultural_machinery,
        tractor: response.data.tractor || null,
        combine: response.data.combine || null,
        chopper: response.data.chopper || null,
      };

      // Optimistically add the new machine to the store
      set((state) => ({
        machines: [newMachine, ...state.machines],
        isLoading: false,
        error: null,
      }));

      return { success: true, data: newMachine };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'خطا در ایجاد ماشین';

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  // ------------------------------------------------------------
  // Delete a machine by its AgriculturalMachinery ID
  // Endpoint: DELETE /agricultural_machinery/:machine_id
  // ------------------------------------------------------------
  deleteMachine: async (machineId) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        set({ isLoading: false, error: 'لطفاً وارد حساب کاربری خود شوید' });
        return { success: false, error: 'No token found' };
      }

      await axios.delete(`${BASE_URL}/agricultural_machinery/${machineId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the machine from the store
      set((state) => ({
        machines: state.machines.filter((m) => m.id !== machineId),
        isLoading: false,
        error: null,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'خطا در حذف ماشین';

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
  // Reset the store (useful for logout)
  // ------------------------------------------------------------
  reset: () =>
    set({
      machines: [],
      isLoading: false,
      error: null,
    }),
}));

export default useMachineryStore;