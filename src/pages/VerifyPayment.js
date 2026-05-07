import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import usePaymentStore from "../stores/paymentStore";
import useReservationStore from "../stores/reservationStore";
import useOrderStore from "../stores/orderStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import "./VerifyPayment.css";

import Header from "../components/Header";

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSnackbar } = useCustomSnackbar();

  const {
    verifyPayment,
    isLoading: paymentLoading,
    verificationData,
    error: paymentError,
  } = usePaymentStore();
  const { cancelReservation, isLoading: reservationLoading } =
    useReservationStore();
  const { submitOrder, isLoading: orderLoading } = useOrderStore();

  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    verifyPaymentProcess();
  }, []);

  // Delete all reservations associated with the given authority
  const deleteReservationsByAuthority = async (authority) => {
    const pendingOrderStr = sessionStorage.getItem("pendingOrder");
    if (!pendingOrderStr) return;
    try {
      const pendingOrder = JSON.parse(pendingOrderStr);
      if (pendingOrder.authority === authority) {
        for (const res of pendingOrder.reservations) {
          await cancelReservation(res.reservation_id);
        }
        sessionStorage.removeItem("pendingOrder");
      }
    } catch (err) {
      console.error("Error deleting reservations:", err);
    }
  };

  // Submit orders for all reservations after successful payment
  const submitOrdersForReservations = async (authority, refId) => {
    const pendingOrderStr = sessionStorage.getItem("pendingOrder");
    if (!pendingOrderStr) {
      throw new Error("اطلاعات سفارش یافت نشد");
    }
    const pendingOrder = JSON.parse(pendingOrderStr);
    if (pendingOrder.authority !== authority) {
      throw new Error("عدم تطابق شناسه پرداخت");
    }

    const { product_id, payment_method, reservations, product_price } =
      pendingOrder;
    const paidPerMachine =
      payment_method === "CASH" ? product_price : product_price / 2;

    // Submit orders one by one
    for (const res of reservations) {
      const result = await submitOrder({
        product_id,
        machinery_id: res.machinery_id,
        payment_method,
        paid: paidPerMachine,
        authority,
        ref_id: refId,
        status: "PAID",
      });
      if (!result.success) {
        throw new Error(`خطا در ثبت سفارش: ${result.error}`);
      }
    }

    // Orders created successfully → delete reservations
    await deleteReservationsByAuthority(authority);
  };

  const verifyPaymentProcess = async () => {
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");

    // Case: user cancelled payment
    if (status === "NOK") {
      setVerificationStatus("failed");
      setVerificationMessage("پرداخت توسط شما لغو شد");
      showSnackbar("پرداخت لغو شد", "error");
      await deleteReservationsByAuthority(authority);
      return;
    }

    // Missing or invalid parameters
    if (!authority || status !== "OK") {
      setVerificationStatus("failed");
      setVerificationMessage("پارامترهای لازم برای تأیید پرداخت موجود نیست");
      showSnackbar("خطا در پارامترهای پرداخت", "error");
      return;
    }

    setIsProcessing(true);

    try {
      const amount = localStorage.getItem("amount");
      const result = await verifyPayment(authority, amount);

      if (result.success) {
        // Payment verification succeeded
        if (result.code === 100 || result.code === 101) {
          // Payment successful or already verified
          try {
            await submitOrdersForReservations(authority, result.refId);

            if (result.code === 100) {
              setVerificationStatus("success");
              setVerificationMessage("پرداخت با موفقیت انجام و تأیید شد");
              showSnackbar("پرداخت با موفقیت انجام شد", "success");
            } else {
              setVerificationStatus("already_verified");
              setVerificationMessage("این پرداخت قبلاً تأیید شده است");
              showSnackbar("این پرداخت قبلاً تأیید شده است", "info");
            }
          } catch (orderErr) {
            setVerificationStatus("failed");
            setVerificationMessage(orderErr.message || "خطا در ثبت سفارش");
            showSnackbar(orderErr.message || "خطا در ثبت سفارش", "error");
            // Do not delete reservations here – they remain for manual handling
          }
        } else {
          // Payment failed (other Zarinpal codes)
          setVerificationStatus("failed");
          setVerificationMessage(result.message || "خطا در تأیید پرداخت");
          showSnackbar(result.message || "خطا در تأیید پرداخت", "error");
          await deleteReservationsByAuthority(authority);
        }
      } else {
        // verifyPayment itself failed (network, etc.)
        setVerificationStatus("failed");
        setVerificationMessage(result.error || "خطا در تأیید پرداخت");
        showSnackbar(result.error || "خطا در تأیید پرداخت", "error");
        await deleteReservationsByAuthority(authority);
      }
    } catch (err) {
      setVerificationStatus("failed");
      setVerificationMessage("خطای غیرمنتظره در تأیید پرداخت");
      showSnackbar("خطای غیرمنتظره در تأیید پرداخت", "error");
      // Do not delete reservations – we don't know the state
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const handleGoToOrders = () => {
    navigate("/", { state: { openOrders: true } });
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "success":
        return "✅";
      case "already_verified":
        return "ℹ️";
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case "success":
        return "پرداخت موفق";
      case "already_verified":
        return "پرداخت قبلاً تأیید شده";
      case "failed":
        return "پرداخت ناموفق";
      default:
        return "در حال تأیید پرداخت";
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "success":
        return "success";
      case "already_verified":
        return "info";
      case "failed":
        return "error";
      default:
        return "pending";
    }
  };

  const isLoading =
    paymentLoading || isProcessing || orderLoading || reservationLoading;

  return (
    <div className="verify-payment-page">
      {/* <Header /> */}

      <div className="verify-payment-container">
        <div className="verify-payment-card">
          <div className={`status-icon status-${getStatusColor()}`}>
            {getStatusIcon()}
          </div>

          <h1 className="status-title">{getStatusTitle()}</h1>

          {isLoading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>در حال تأیید پرداخت...</p>
            </div>
          )}

          {!isLoading && verificationMessage && (
            <div className="verification-message">
              <p>{verificationMessage}</p>
            </div>
          )}

          {verificationData && verificationStatus === "success" && (
            <div className="payment-details">
              <h3>مشخصات پرداخت</h3>
              <div className="detail-row">
                <span className="detail-label">کد پیگیری:</span>
                <span className="detail-value">{verificationData.ref_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">شماره کارت:</span>
                <span className="detail-value">
                  {verificationData.card_pan}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">تاریخ و زمان:</span>
                <span className="detail-value">
                  {new Date().toLocaleString("fa-IR")}
                </span>
              </div>
            </div>
          )}

          {paymentError && !isLoading && (
            <div className="error-section">
              <p className="error-text">{paymentError}</p>
            </div>
          )}

          <div className="action-buttons">
            <button className="btn-success" onClick={handleGoToOrders}>
              مشاهده سفارشات من
            </button>
            <button className="btn-secondary" onClick={handleGoToHome}>
              بازگشت به صفحه اصلی
            </button>
          </div>

          {/* <div className="debug-info">
            <details>
              <summary>اطلاعات دیباگ</summary>
              <div className="debug-details">
                <p>Authority: {searchParams.get("Authority")}</p>
                <p>Status: {searchParams.get("Status")}</p>
                <p>Verification Status: {verificationStatus}</p>
              </div>
            </details>
          </div> */}

        </div>
      </div>
    </div>
  );
};

export default VerifyPayment;
