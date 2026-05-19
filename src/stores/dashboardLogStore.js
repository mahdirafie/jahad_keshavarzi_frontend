import { create } from 'zustand';
import vpLogApiClient from '../common/vpLogApiClient';

const useDashboardLogStore = create((set) => ({
  // ── Ready-to-install orders ──────────────────────────────────────────────
  readyToInstallOrders: [],
  readyToInstallTotal: 0,
  readyToInstallPage: 1,
  readyToInstallTotalPages: 0,
  readyToInstallLimit: 20,
  isLoadingReadyToInstall: false,
  readyToInstallError: null,

  // GET /api/device/orders/ready-to-install
  // params: { installerNationalCode?, search?, ascending?, page?, limit? }
  getReadyToInstallOrders: async ({
    installerNationalCode,
    search,
    ascending,
    page = 1,
    limit = 20,
  } = {}) => {
    set({ isLoadingReadyToInstall: true, readyToInstallError: null });
    try {
      const params = { page, limit };
      if (installerNationalCode) params.installer_national_code = installerNationalCode;
      if (search)                params.search                  = search;
      if (ascending !== undefined) params.ascending             = ascending;
      const response = await vpLogApiClient.get(
        '/api/device/orders/ready-to-install',
        { params },
      );
      const { data, total, totalPages } = response.data;
      set({
        readyToInstallOrders:    data       ?? [],
        readyToInstallTotal:     total      ?? 0,
        readyToInstallPage:      page,
        readyToInstallTotalPages: totalPages ?? 0,
        readyToInstallLimit:     limit,
        isLoadingReadyToInstall: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      set({
        readyToInstallError: msg,
        isLoadingReadyToInstall: false,
      });
      return { success: false, error: msg };
    }
  },

  // ── Installed orders (superadmin — same query shape as ready-to-install) ──
  installedOrders: [],
  installedTotal: 0,
  installedPage: 1,
  installedTotalPages: 0,
  installedLimit: 20,
  isLoadingInstalled: false,
  installedError: null,

  // GET /api/device/orders/installed
  // params: { installerNationalCode?, search?, ascending?, page?, limit? }
  getInstalledOrders: async ({
    installerNationalCode,
    search,
    ascending,
    page = 1,
    limit = 20,
  } = {}) => {
    set({ isLoadingInstalled: true, installedError: null });
    try {
      const params = { page, limit };
      if (installerNationalCode)
        params.installer_national_code = installerNationalCode;
      if (search) params.search = search;
      if (ascending !== undefined) params.ascending = ascending;
      const response = await vpLogApiClient.get(
        '/api/device/orders/installed',
        { params },
      );
      const { data, total, totalPages } = response.data;
      set({
        installedOrders: data ?? [],
        installedTotal: total ?? 0,
        installedPage: page,
        installedTotalPages: totalPages ?? 0,
        installedLimit: limit,
        isLoadingInstalled: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      set({
        installedError: msg,
        isLoadingInstalled: false,
      });
      return { success: false, error: msg };
    }
  },

  // PATCH /api/device/orders/:orderId/status  { status }
  // Allowed statuses: READY_FOR_INSTALLATION | INSTALLED | COMPLETED
  // Allowed actors: superadmin, installer (backend enforces ownership)
  changeOrderStatus: async (orderId, status) => {
    try {
      const response = await vpLogApiClient.patch(
        `/api/device/orders/${orderId}/status`,
        { status },
      );
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      return { success: false, error: msg };
    }
  },

  // POST /api/device/devices
  // dto: { serial_number, machinery_id, sim_operator, sim_phone_number, sim_serial_number }
  registerDevice: async (dto) => {
    try {
      const response = await vpLogApiClient.post('/api/device/devices', dto);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // DELETE /api/device/devices/by-machinery/:machineryId
  deleteDeviceByMachinery: async (machineryId) => {
    try {
      await vpLogApiClient.delete(
        `/api/device/devices/by-machinery/${machineryId}`
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // GET /api/device/orders/:orderId/device
  getDeviceForOrder: async (orderId) => {
    try {
      const response = await vpLogApiClient.get(`/api/device/orders/${orderId}/device`);
      return { success: true, data: response.data };
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'خطا در دریافت اطلاعات دستگاه';
      return { success: false, error: msg };
    }
  },

  // GET /api/device/admin/installers
  getInstallers: async () => {
    try {
      const response = await vpLogApiClient.get('/api/device/admin/installers');
      return { success: true, data: response.data ?? [] };
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'خطا در دریافت لیست نصابان';
      return { success: false, error: msg };
    }
  },

  // ── Installer's own orders ───────────────────────────────────────────────
  myOrders: [],
  myOrdersTotal: 0,
  myOrdersPage: 1,
  myOrdersTotalPages: 0,
  isLoadingMyOrders: false,
  myOrdersError: null,

  // GET /api/device/orders/my-orders?status=...&page=...&limit=...
  getOrdersForInstaller: async ({ status, page = 1, limit = 5 } = {}) => {
    set({ isLoadingMyOrders: true, myOrdersError: null });
    try {
      const params = { page, limit };
      if (status) params.status = status;
      const response = await vpLogApiClient.get('/api/device/orders/my-orders', { params });
      const { data, total, totalPages } = response.data;
      set({
        myOrders:          data       ?? [],
        myOrdersTotal:     total      ?? 0,
        myOrdersPage:      page,
        myOrdersTotalPages: totalPages ?? 0,
        isLoadingMyOrders: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      set({ myOrdersError: msg, isLoadingMyOrders: false });
      return { success: false, error: msg };
    }
  },

  // PATCH /api/device/orders/:orderId/toggle-status
  toggleInstallationStatus: async (orderId) => {
    try {
      const response = await vpLogApiClient.patch(
        `/api/device/orders/${orderId}/toggle-status`,
      );
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      return { success: false, error: msg };
    }
  },

  // ── Device analytics (superadmin / admin) ───────────────────────────────
  // GET /api/device/logs/analytics?device_id=<id>&duration=<day|week|month|year|ytd>
  getDeviceAnalytics: async (deviceId, duration = 'week') => {
    try {
      const response = await vpLogApiClient.get('/api/device/logs/analytics', {
        params: { device_id: deviceId, duration },
      });
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      return { success: false, error: msg };
    }
  },

  // ── User device search (superadmin / admin) ─────────────────────────────
  // GET /api/device/logs/search?q=<term>&page=<n>&limit=<n>
  searchUserDevices: async ({ q, page = 1, limit = 20 } = {}) => {
    try {
      const params = { page, limit };
      if (q) params.q = q;
      const response = await vpLogApiClient.get('/api/device/logs/search', { params });
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      return { success: false, error: msg };
    }
  },

  // POST /api/device/devices/:deviceId/installer
  // dto: { admin_national_code, wage? }
  assignInstaller: async (deviceId, dto) => {
    try {
      const response = await vpLogApiClient.post(
        `/api/device/devices/${deviceId}/installer`,
        dto,
      );
      return { success: true, data: response.data };
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'خطا در تخصیص نصاب';
      return { success: false, error: msg };
    }
  },
}));

export default useDashboardLogStore;
