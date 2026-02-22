import { create } from "zustand";
import axios from "axios";
import BASE_URL from "../common/baseUrl";

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
      const response = await axios.post(
        `${BASE_URL}/payment/request`,
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      set({
        paymentData: response.data.data,
        isLoading: false,
        error: null,
      });

      return { 
        success: true, 
        data: response.data.data,
        authority: response.data.data.authority // For easy access
      };

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(", ") ||
        error.message ||
        "Failed to request payment";

      set({
        error: errorMessage,
        isLoading: false,
        paymentData: null,
      });

      return { success: false, error: errorMessage };
    }
  },

  verifyPayment: async (authority, amount) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(
        `${BASE_URL}/payment/verify`,
        { authority, amount },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const verificationData = response.data.data;
      
      set({
        verificationData,
        isLoading: false,
        error: null,
      });

      // Handle different response codes based on documentation
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
        cardPan: verificationData.card_pan
      };

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(", ") ||
        error.message ||
        "Failed to verify payment";

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  clearPaymentData: () => set({ paymentData: null, verificationData: null }),
  clearError: () => set({ error: null }),
}));

export default usePaymentStore;