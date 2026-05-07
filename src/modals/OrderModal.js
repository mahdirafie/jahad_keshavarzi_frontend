import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import useOrderStore from "../stores/orderStore";
import useAuthStore from "../stores/authStore";
import { formatPrice } from "../utils/PriceFormat";
import VidaLogo from "../assets/images/vida-logo.png";
import "./OrderModal.css";

/* ─── Label maps ─────────────────────────────────────── */
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
const paymentLabels = { CASH: "نقدی", INSTALLMENT: "اقساط" };
const statusColors = {
  PAID: "paid",
  PENDING: "pending",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

/* ─── Helpers ────────────────────────────────────────── */
const toPersian = (n) => {
  if (n == null) return "";
  return n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
};

const getMachineKind = (machinery) => {
  if (!machinery) return "نامشخص";
  if (machinery.tractor) return "تراکتور";
  if (machinery.combine) return "کمباین";
  if (machinery.chopper) return "چاپر";
  return "ماشین";
};

const getMachineDetail = (machinery) => {
  if (!machinery) return "";
  if (machinery.tractor)
    return tractorTypeLabels[machinery.tractor.tractor_type] || machinery.tractor.tractor_type;
  if (machinery.combine)
    return combineUsageLabels[machinery.combine.usage_type] || machinery.combine.usage_type;
  if (machinery.chopper)
    return chopperTypeLabels[machinery.chopper.chopper_type] || machinery.chopper.chopper_type;
  return "";
};

const persianDate = (iso) => {
  if (!iso) return new Date().toLocaleDateString("fa-IR");
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return new Date().toLocaleDateString("fa-IR");
  }
};

/* ════════════════════════════════════════════════════════
   FactorView — A4 invoice overlay
   ════════════════════════════════════════════════════════ */
const FactorView = ({ order, user, onBack }) => {
  const machinery = order.machinery || {};
  const machineKind = getMachineKind(order.machinery);
  const machineDetail = getMachineDetail(order.machinery);
  const orderUser = order.user || user || {};

  return (
    <div className="factor-overlay">
      {/* Toolbar — hidden on print */}
      <div className="factor-toolbar no-print">
        <button className="factor-back-btn" onClick={onBack}>
          <i className="bi bi-arrow-right"></i> بازگشت
        </button>
        <button className="factor-print-btn" onClick={() => window.print()}>
          <i className="bi bi-printer"></i> چاپ / دانلود PDF
        </button>
      </div>

      {/* A4 document */}
      <div className="factor-page factor-print-area">

        {/* ── Header ── */}
        <div className="fp-header">
          {/* Right: Jahad Keshavarzi */}
          <div className="fp-header-right">
            <div className="fp-org-name">سازمان جهاد کشاورزی استان مرکزی</div>
            <div className="fp-org-sub">اداره کل ماشین‌آلات کشاورزی</div>
          </div>

          {/* Center: title + meta */}
          <div className="fp-header-center">
            <div className="fp-doc-title">فاکتور رسمی</div>
            <div className="fp-header-meta">
              <div className="fp-meta-row">
                <span className="fp-meta-label">شماره فاکتور:</span>
                <span className="fp-meta-val">{toPersian(order.oid)}</span>
              </div>
              <div className="fp-meta-row">
                <span className="fp-meta-label">تاریخ:</span>
                <span className="fp-meta-val">{persianDate(order.createdAt)}</span>
              </div>
              <div className="fp-meta-row">
                <span className="fp-meta-label">روش پرداخت:</span>
                <span className="fp-meta-val">{paymentLabels[order.payment_method] || order.payment_method}</span>
              </div>
            </div>
          </div>

          {/* Left: Vida company */}
          <div className="fp-header-left">
            <img src={VidaLogo} alt="لوگو ویدا" className="fp-vida-logo" />
            <div className="fp-vida-name">شرکت تکاپو گسترش ویدا</div>
            <div className="fp-vida-sub">ارائه‌دهنده خدمات ماشین‌آلات کشاورزی</div>
          </div>
        </div>

        <div className="fp-divider"></div>

        {/* ── Buyer info ── */}
        <div className="fp-section">
          <div className="fp-section-title">مشخصات خریدار</div>
          <div className="fp-info-grid">
            <div className="fp-info-cell">
              <span className="fp-info-label">نام و نام خانوادگی:</span>
              <span className="fp-info-val">{orderUser.name || "—"}</span>
            </div>
            <div className="fp-info-cell">
              <span className="fp-info-label">کد ملی:</span>
              <span className="fp-info-val">{orderUser.national_code || order.user_id || "—"}</span>
            </div>
            <div className="fp-info-cell">
              <span className="fp-info-label">شماره تماس:</span>
              <span className="fp-info-val">{orderUser.phone || "—"}</span>
            </div>
            <div className="fp-info-cell">
              <span className="fp-info-label">استان / شهر:</span>
              <span className="fp-info-val">
                {orderUser.province || "مرکزی"} / {orderUser.city || "—"}
              </span>
            </div>
            <div className="fp-info-cell">
              <span className="fp-info-label">روستا:</span>
              <span className="fp-info-val">{orderUser.village || "—"}</span>
            </div>
            <div className="fp-info-cell fp-info-cell--wide">
              <span className="fp-info-label">آدرس:</span>
              <span className="fp-info-val">{orderUser.address || "—"}</span>
            </div>
          </div>
        </div>

        <div className="fp-divider"></div>

        {/* ── Order details table ── */}
        <div className="fp-section">
          <div className="fp-section-title">شرح خدمات</div>
          <table className="fp-table">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام محصول / خدمت</th>
                <th>نوع ماشین</th>
                <th>مدل</th>
                <th>سال ساخت</th>
                <th>مبلغ (تومان)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>۱</td>
                <td>{order.product?.name || "—"}</td>
                <td>
                  {machineKind}
                  {machineDetail ? ` — ${machineDetail}` : ""}
                </td>
                <td>{machinery.model || "—"}</td>
                <td>{toPersian(machinery.manufacture_year) || "—"}</td>
                <td className="fp-amount">{formatPrice(order.paid)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="fp-total-row">
                <td colSpan={5} className="fp-total-label">جمع کل</td>
                <td className="fp-amount fp-total-val">{formatPrice(order.paid)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ── Reference / tracking ── */}
        <div className="fp-ref-row">
          <span className="fp-ref-label">کد پیگیری تراکنش:</span>
          <span className="fp-ref-val" dir="ltr">{order.ref_id || "—"}</span>
        </div>

        <div className="fp-divider"></div>

        {/* ── Notes ── */}
        <div className="fp-notes">
          <p>این فاکتور سند معتبر خرید خدمات ماشین‌آلات کشاورزی می‌باشد.</p>
          <p>در صورت نیاز به پیگیری، لطفاً کد فاکتور و کد پیگیری تراکنش را به همراه داشته باشید.</p>
        </div>

        {/* ── Signatures ── */}
        <div className="fp-signatures">
          <div className="fp-sig-box">
            <div className="fp-sig-label">مهر و امضاء فروشنده</div>
            <div className="fp-sig-area"></div>
          </div>
          <div className="fp-sig-box">
            <div className="fp-sig-label">مهر و امضاء خریدار</div>
            <div className="fp-sig-area"></div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="fp-footer">
          <span>سازمان جهاد کشاورزی استان مرکزی — سامانه مدیریت ماشین‌آلات کشاورزی</span>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   Order card
   ════════════════════════════════════════════════════════ */
const OrderCard = ({ order, onPrintFactor }) => {
  const machinery = order.machinery || {};
  const machineKind = getMachineKind(order.machinery);
  const detail = getMachineDetail(order.machinery);

  return (
    <div className={`order-card order-card--${statusColors[order.status] || "default"}`}>
      <div className="oc-top">
        <span className={`oc-status oc-status--${statusColors[order.status] || "default"}`}>
          {order.statusText || order.status}
        </span>
        <span className="oc-date">{persianDate(order.createdAt)}</span>
      </div>

      <div className="oc-product">{order.product?.name || "—"}</div>

      <div className="oc-machine">
        <span className="oc-machine-kind">{machineKind}</span>
        {machinery.model && <span className="oc-machine-sep">·</span>}
        {machinery.model && <span className="oc-machine-model">{machinery.model}</span>}
        {detail && <span className="oc-machine-sep">·</span>}
        {detail && <span className="oc-machine-detail">{detail}</span>}
        {machinery.manufacture_year && (
          <>
            <span className="oc-machine-sep">·</span>
            <span className="oc-machine-year">ساخت {toPersian(machinery.manufacture_year)}</span>
          </>
        )}
      </div>

      <div className="oc-bottom">
        <div className="oc-payment">
          <span className="oc-payment-method">
            {paymentLabels[order.payment_method] || order.payment_method}
          </span>
          <span className="oc-payment-amount">{formatPrice(order.paid)} تومان</span>
        </div>
        <button className="oc-factor-btn" onClick={() => onPrintFactor(order)}>
          <i className="bi bi-printer"></i>
          چاپ فاکتور
        </button>
      </div>

      {order.ref_id && (
        <div className="oc-ref">کد پیگیری: <span dir="ltr">{order.ref_id}</span></div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   Main modal
   ════════════════════════════════════════════════════════ */
const OrdersModal = ({ isOpen, onClose }) => {
  const { orders, fetchOrders, isLoading, error, clearError } = useOrderStore();
  const { user } = useAuthStore();
  const [factorOrder, setFactorOrder] = useState(null);

  useEffect(() => {
    if (isOpen) fetchOrders();
    else { clearError(); setFactorOrder(null); }
  }, [isOpen, fetchOrders, clearError]);

  if (factorOrder) {
    return (
      <FactorView
        order={factorOrder}
        user={user}
        onBack={() => setFactorOrder(null)}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="سفارش‌های من" className="orders-modal">
      <div className="orders-modal-body">

        {isLoading && (
          <div className="om-loading">
            <div className="om-spinner"></div>
            <p>در حال دریافت سفارش‌ها...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="om-error">
            <i className="bi bi-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={fetchOrders} className="om-retry-btn">تلاش مجدد</button>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="om-empty">
            <i className="bi bi-bag-x"></i>
            <p>هنوز سفارشی ثبت نکرده‌اید.</p>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="om-cards">
            {orders.map((order) => (
              <OrderCard
                key={order.oid}
                order={order}
                onPrintFactor={setFactorOrder}
              />
            ))}
          </div>
        )}

        <div className="om-footer">
          <button className="om-close-btn" onClick={onClose}>بستن</button>
        </div>
      </div>
    </Modal>
  );
};

export default OrdersModal;
