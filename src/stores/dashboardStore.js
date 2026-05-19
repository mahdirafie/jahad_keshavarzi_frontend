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

  // POST /admin/login
  // The server sets httpOnly access + refresh token cookies in the response.
  login: async (national_code, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/admin/login', { national_code, password });
      const { admin } = response.data;

      set({ admin, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, data: response.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // POST /admin/logout — server clears the httpOnly cookies
  logout: async () => {
    try {
      await adminApiClient.post('/admin/logout', {});
    } catch (_) {
      // Proceed with local cleanup regardless
    } finally {
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

  // GET /admin/users?q=...   (q is optional; omit or empty string → all users)
  listUsers: async (q = '') => {
    try {
      const params = q && q.trim() ? { q: q.trim() } : {};
      const response = await adminApiClient.get('/admin/users', { params });
      return { success: true, data: response.data.users, count: response.data.count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ---------- SMS (superadmin only) ----------

  // POST /admin/sms  { phone, message }
  sendSmsToPhone: async (phone, message) => {
    try {
      const response = await adminApiClient.post('/admin/sms', { phone, message });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // POST /admin/sms/broadcast  { message, scope: 'all' | 'without_orders' }
  sendSmsToUsers: async (message, scope) => {
    try {
      const response = await adminApiClient.post('/admin/sms/broadcast', { message, scope });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ---------- Dashboard Overview (all admin roles) ----------

  // GET /admin/dashboard
  getDashboard: async () => {
    try {
      const response = await adminApiClient.get('/admin/dashboard');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ---------- System Config (superadmin only) ----------

  // GET /config/sell → { sell_open: bool }
  getSellConfig: async () => {
    try {
      const r = await adminApiClient.get('/config/sell');
      return { success: true, data: r.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // GET /config/log-urls → { urls: [...] }
  getLogUrlsConfig: async () => {
    try {
      const r = await adminApiClient.get('/config/log-urls');
      return { success: true, data: r.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // PUT /config/sell – body { sell_open: bool }
  updateSellConfig: async (sellOpen) => {
    try {
      const r = await adminApiClient.put('/config/sell', { sell_open: sellOpen });
      return { success: true, data: r.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // PUT /config/log-urls – body { urls: [...] }
  updateLogUrlsConfig: async (urls) => {
    try {
      const r = await adminApiClient.put('/config/log-urls', { urls });
      return { success: true, data: r.data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message };
    }
  },

  // ---------- Utilities ----------
  clearError: () => set({ error: null }),

  reset: () => {
    set({ admin: null, isAuthenticated: false, isLoading: false, error: null });
  },
}));

export default useDashboardStore;
