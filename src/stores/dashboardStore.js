import { create } from 'zustand';
import apiClient from '../common/apiClient';
import adminApiClient from '../common/adminApiClient';

const useDashboardStore = create((set, get) => ({
  // ---------- State ----------
  admin: null,            // { national_code, name, role }
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ---------- Auth Actions ----------

  // POST /admin/login  (public — uses regular apiClient, no admin token yet)
  login: async (national_code, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/admin/login', { national_code, password });
      const { access_token, refresh_token, admin } = response.data;

      localStorage.setItem('adminAccessToken', access_token);
      localStorage.setItem('adminRefreshToken', refresh_token);

      set({ admin, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, data: response.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // POST /admin/logout  (protected — uses adminApiClient)
  logout: async () => {
    try {
      await adminApiClient.post('/admin/logout', {});
    } catch (_) {
      // Proceed with local cleanup regardless
    } finally {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      set({ admin: null, isAuthenticated: false, error: null });
    }
  },

  // GET /admin/me  (protected — uses adminApiClient)
  getMyRole: async () => {
    try {
      const response = await adminApiClient.get('/admin/me');
      set({ admin: response.data, isAuthenticated: true });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ---------- Admin Management (superadmin only) ----------

  // POST /admin/add
  addAdmin: async (adminData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApiClient.post('/admin/add', adminData);
      set({ isLoading: false });
      return { success: true, data: response.data.admin };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // GET /admin/all
  getAllAdmins: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApiClient.get('/admin/all');
      set({ isLoading: false });
      return { success: true, data: response.data.admins };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // PATCH /admin/change-role/:national_code
  changeRole: async (national_code, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApiClient.patch(
        `/admin/change-role/${national_code}`,
        { role }
      );
      set({ isLoading: false });
      return { success: true, data: response.data.admin };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // DELETE /admin/delete/:national_code
  deleteAdmin: async (national_code) => {
    set({ isLoading: true, error: null });
    try {
      await adminApiClient.delete(`/admin/delete/${national_code}`);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // ---------- Info Lookups (admin/superadmin) ----------

  // GET /admin/user/:national_code
  getUserInfo: async (national_code) => {
    try {
      const response = await adminApiClient.get(`/admin/user/${national_code}`);
      return { success: true, data: response.data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // PATCH /admin/user/:national_code  (admin / superadmin)
  updateUser: async (national_code, body) => {
    try {
      const response = await adminApiClient.patch(`/admin/user/${national_code}`, body);
      return {
        success: true,
        data: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // GET /admin/order/:national_code/:order_id
  getOrderInfo: async (national_code, order_id) => {
    try {
      const response = await adminApiClient.get(`/admin/order/${national_code}/${order_id}`);
      return { success: true, data: response.data.order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // PATCH /admin/order/:national_code/:order_id  (admin / superadmin)
  updateOrder: async (national_code, order_id, body) => {
    try {
      const response = await adminApiClient.patch(
        `/admin/order/${national_code}/${order_id}`,
        body
      );
      return {
        success: true,
        data: response.data.order,
        message: response.data.message,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // GET /admin/machine/:national_code/:order_id
  getMachineInfo: async (national_code, order_id) => {
    try {
      const response = await adminApiClient.get(`/admin/machine/${national_code}/${order_id}`);
      return { success: true, data: response.data.machinery };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // PATCH /admin/machine/:national_code/:order_id  (admin / superadmin)
  updateMachine: async (national_code, order_id, body) => {
    try {
      const response = await adminApiClient.patch(
        `/admin/machine/${national_code}/${order_id}`,
        body
      );
      return {
        success: true,
        data: response.data.machinery,
        message: response.data.message,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ---------- Manual Order (superadmin only) ----------

  // GET /admin/products
  getAllProducts: async () => {
    try {
      const response = await adminApiClient.get('/admin/products');
      return { success: true, data: response.data.products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // GET /admin/user/:national_code/machines-without-order
  getUserMachinesWithoutOrder: async (national_code) => {
    try {
      const response = await adminApiClient.get(
        `/admin/user/${national_code}/machines-without-order`
      );
      return { success: true, data: response.data.machines };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // POST /admin/order/manual
  createManualOrder: async (body) => {
    try {
      const response = await adminApiClient.post('/admin/order/manual', body);
      return { success: true, data: response.data.order, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ---------- Product Management (superadmin only) ----------

  // POST /admin/products
  addProduct: async (body) => {
    try {
      const response = await adminApiClient.post('/admin/products', body);
      return { success: true, data: response.data.product, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // PATCH /admin/products/:product_id
  updateProduct: async (product_id, body) => {
    try {
      const response = await adminApiClient.patch(`/admin/products/${product_id}`, body);
      return { success: true, data: response.data.product, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ---------- User List (admin / superadmin) ----------

  // GET /admin/users
  getAllUsers: async () => {
    try {
      const response = await adminApiClient.get('/admin/users');
      return { success: true, data: response.data.users, count: response.data.count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // GET /admin/users/search?q=...
  searchUsers: async (q) => {
    try {
      const response = await adminApiClient.get('/admin/users/search', { params: { q } });
      return { success: true, data: response.data.users, count: response.data.count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ---------- Utilities ----------
  clearError: () => set({ error: null }),

  reset: () => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    set({ admin: null, isAuthenticated: false, isLoading: false, error: null });
  },
}));

export default useDashboardStore;
