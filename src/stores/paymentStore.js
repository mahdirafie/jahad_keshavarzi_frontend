import { create } from "zustand";
import apiClient from "../common/apiClient";

const usePaymentStore = create((set, get) => ({
  // State
  paymentData: null,
  verificationData: null,
  isLoading: false,
  error: null,

  // Actions
  requestPayment: async (orderData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post("/payment/request", orderData);

      set({
        paymentData: response.data.data,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        data: response.data.data,
        authority: response.data.data.authority,
      };
    } catch (error) {
      set({ error: error.message, isLoading: false, paymentData: null });
      return { success: false, error: error.message };
    }
  },

  verifyPayment: async (authority, amount) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post("/payment/verify", { authority, amount });
      const verificationData = response.data.data;

      set({ verificationData, isLoading: false, error: null });

      let success = false;
      let message = verificationData.message;

      if (verificationData.code === 100) {
        success = true;
        message = "تراکنش با موفقیت تأیید شد";
      } else if (verificationData.code === 101) {
        success = true;
        message = "این تراکنش قبلاً تأیید شده است";
      } else {
        success = false;
        message = verificationData.message || "خطا در تأیید تراکنش";
      }

      return {
        success,
        data: verificationData,
        code: verificationData.code,
        message,
        refId: verificationData.ref_id,
        cardPan: verificationData.card_pan,
      };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearPaymentData: () => set({ paymentData: null, verificationData: null }),
  clearError: () => set({ error: null }),
}));

export default usePaymentStore;
