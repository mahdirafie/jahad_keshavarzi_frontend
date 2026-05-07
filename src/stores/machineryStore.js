import { create } from 'zustand';
import apiClient from '../common/apiClient';

const useMachineryStore = create((set, get) => ({
  // State
  machines: [],
  product: null,
  isLoading: false,
  error: null,

  // ------------------------------------------------------------
  // Fetch all machines of the logged-in user
  // Endpoint: GET /agricultural_machinery/machines
  // ------------------------------------------------------------
  fetchMachines: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.get('/agricultural_machinery/machines');

      set({
        machines: response.data.machines || [],
        product: response.data.product || null,
        isLoading: false,
        error: null,
      });

      return { success: true, data: response.data.machines };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
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
      const payload = {
        manufacture_year: machineData.manufacture_year,
        model: machineData.model,
      };

      let endpoint;
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

      const response = await apiClient.post(endpoint, payload);

      const newMachine = {
        ...response.data.agricultural_machinery,
        tractor: response.data.tractor || null,
        combine: response.data.combine || null,
        chopper: response.data.chopper || null,
      };

      set((state) => ({
        machines: [newMachine, ...state.machines],
        isLoading: false,
        error: null,
      }));

      return { success: true, data: newMachine };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // ------------------------------------------------------------
  // Delete a machine by its AgriculturalMachinery ID
  // Endpoint: DELETE /agricultural_machinery/:machine_id
  // ------------------------------------------------------------
  deleteMachine: async (machineId) => {
    set({ isLoading: true, error: null });

    try {
      await apiClient.delete(`/agricultural_machinery/${machineId}`);

      set((state) => ({
        machines: state.machines.filter((m) => m.id !== machineId),
        isLoading: false,
        error: null,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      machines: [],
      isLoading: false,
      error: null,
    }),
}));

export default useMachineryStore;
