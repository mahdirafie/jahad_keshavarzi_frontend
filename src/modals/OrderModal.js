import React, { useEffect } from "react";
import Modal from "./Modal";
import useOrderStore from "../stores/orderStore";
import { formatPriceWithCurrency } from "../utils/PriceFormat";
import "./OrderModal.css";

const toPersianDigits = (num) => {
  if (!num && num !== 0) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (d) => persianDigits[d]);
};

const tractorTypeLabels = {
  ROMANIAN_UNIVERSAL: "رومانی یونیورسال",
  FERGUSON: "فرگوسن",
  JOHN_DEERE: "جان دیر",
  NEW_HOLLAND: "نیوهلند",
  CASE: "کیس",
  OTHER: "سایر",
};

const combineUsageLabels = {
  WHEAT: "گندم",
  RICE: "برنج",
  MULTIPURPOSE: "چندمنظوره",
};

const chopperTypeLabels = {
  SELF_PROPELLED: "خودکششی",
  PULL_TYPE: "دنباله‌بند",
};

const paymentMethodLabels = {
  CASH: "نقدی",
  INSTALLMENT: "اقساط",
};

const OrdersModal = ({ isOpen, onClose }) => {
  const { orders, fetchOrders, isLoading, error, clearError } = useOrderStore();

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    } else {
      clearError();
    }
  }, [isOpen, fetchOrders, clearError]);

  const getTypeSpecificLabel = (order) => {
    if (!order.machinery) return "—";
    const machinery = order.machinery;
    if (machinery.tractor) {
      return (
        tractorTypeLabels[machinery.tractor.tractor_type] ||
        machinery.tractor.tractor_type
      );
    }
    if (machinery.combine) {
      return (
        combineUsageLabels[machinery.combine.usage_type] ||
        machinery.combine.usage_type
      );
    }
    if (machinery.chopper) {
      return (
        chopperTypeLabels[machinery.chopper.chopper_type] ||
        machinery.chopper.chopper_type
      );
    }
    return "—";
  };

  const getMachineType = (order) => {
    if (!order.machinery) return "نامشخص";
    const machinery = order.machinery;
    if (machinery.tractor) return "تراکتور";
    if (machinery.combine) return "کمباین";
    if (machinery.chopper) return "چاپر";
    return "نامشخص";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="سفارش‌های من"
      className="orders-modal"
    >
      <div className="orders-modal-content">
        {isLoading && (
          <div className="orders-loading">
            <div className="spinner"></div>
            <p>در حال دریافت سفارش‌ها...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="orders-error">
            <p>{error}</p>
            <button onClick={fetchOrders} className="retry-btn">
              تلاش مجدد
            </button>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <p>هنوز سفارشی ثبت نکرده‌اید.</p>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>محصول</th>
                  <th>ماشین</th>
                  <th>نوع</th>
                  <th>سال ساخت</th>
                  <th>روش پرداخت</th>
                  <th>مبلغ پرداختی</th>
                  <th>وضعیت</th>
                  <th>کد پیگیری</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.oid}>
                    <td data-label="محصول">{order.product?.name || "---"}</td>
                    <td data-label="ماشین">
                      {order.machinery?.model || "---"}
                    </td>
                    <td data-label="نوع">
                      {getMachineType(order)}
                      {order.machinery && (
                        <span className="type-detail">
                          {" "}
                          ({getTypeSpecificLabel(order)})
                        </span>
                      )}
                    </td>
                    <td data-label="سال ساخت">
                      {order.machinery
                        ? toPersianDigits(order.machinery.manufacture_year)
                        : "---"}
                    </td>
                    <td data-label="روش پرداخت">
                      {paymentMethodLabels[order.payment_method] ||
                        order.payment_method}
                    </td>
                    <td data-label="مبلغ پرداختی">
                      {formatPriceWithCurrency(order.paid)}
                    </td>
                    <td data-label="وضعیت">
                      <span
                        className={`status-badge status-${order.status?.toLowerCase()}`}
                      >
                        {order.statusText || order.status}
                      </span>
                    </td>
                    <td data-label="کد پیگیری" dir="ltr" className="ref-id">
                      {order.ref_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrdersModal;
