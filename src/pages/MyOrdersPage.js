import React, { useCallback, useEffect, useState } from "react";
import useDashboardLogStore from "../stores/dashboardLogStore";
import { formatDate } from "../utils/DateFormat";
import "./MyOrdersPage.css";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const STATUSES = [
  { value: "READY_FOR_INSTALLATION", label: "آماده نصب",  icon: "bi-tools",        cls: "mop-status-ready"     },
  { value: "INSTALLED",              label: "نصب شده",    icon: "bi-check2-circle", cls: "mop-status-installed" },
];
const LIMIT = 5;

/* ── Machine helpers ────────────────────────────────────────────────────────── */
const TRACTOR_TYPE_FA = {
  ROMANIAN_UNIVERSAL: "یونیورسال رومانی",
  FERGUSON: "فرگوسن",
  JOHN_DEERE: "جان‌دیر",
  NEW_HOLLAND: "نیوهلند",
  CASE: "کیس",
  OTHER: "سایر",
};
const COMBINE_USAGE_FA  = { WHEAT: "گندم", RICE: "برنج", MULTIPURPOSE: "چندمنظوره" };
const CHOPPER_TYPE_FA   = { SELF_PROPELLED: "خودرو", PULL_TYPE: "کششی" };

const getMachineLabel = (machinery) => {
  if (!machinery) return "نامشخص";
  if (machinery.tractor) {
    const sub = TRACTOR_TYPE_FA[machinery.tractor.tractor_type] || "";
    return sub ? `تراکتور — ${sub}` : "تراکتور";
  }
  if (machinery.combine) {
    const sub = COMBINE_USAGE_FA[machinery.combine.usage_type] || "";
    return sub ? `کمباین — ${sub}` : "کمباین";
  }
  if (machinery.chopper) {
    const sub = CHOPPER_TYPE_FA[machinery.chopper.chopper_type] || "";
    return sub ? `چاپر — ${sub}` : "چاپر";
  }
  return "نامشخص";
};

/* ── Shimmer ────────────────────────────────────────────────────────────────── */
function ShimmerCard() {
  return (
    <div className="mop-card mop-shimmer-card">
      <div className="mop-shimmer-line mop-shimmer-wide   op-shimmer" />
      <div className="mop-shimmer-line mop-shimmer-medium op-shimmer" />
      <div className="mop-shimmer-line mop-shimmer-narrow op-shimmer" />
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function MyOrdersPage() {
  const {
    myOrders,
    myOrdersTotal,
    myOrdersTotalPages,
    isLoadingMyOrders,
    myOrdersError,
    getOrdersForInstaller,
  } = useDashboardLogStore();
  const [status, setStatus]       = useState("READY_FOR_INSTALLATION");
  const [page, setPage]           = useState(1);
  const currentStatus = STATUSES.find((s) => s.value === status);

  /* ── Fetch ── */
  const fetchOrders = useCallback(
    (opts = {}) =>
      getOrdersForInstaller({
        status: opts.status !== undefined ? opts.status : status,
        page:   opts.page   !== undefined ? opts.page   : page,
        limit:  LIMIT,
      }),
    [status, page, getOrdersForInstaller],
  );

  /* Reset page when status changes */
  useEffect(() => {
    setPage(1);
    getOrdersForInstaller({ status, page: 1, limit: LIMIT });
  }, [status]);

  /* Re-fetch when page changes */
  useEffect(() => {
    fetchOrders();
  }, [page]);

  /* ── Pagination ── */
  const goToPage = (p) => {
    if (p < 1 || p > myOrdersTotalPages || p === page) return;
    setPage(p);
  };

  return (
    <div className="mop-page">

      {/* ── Header ── */}
      <div className="mop-header">
        <div className="mop-header-right">
          <i className="bi bi-list-check mop-header-icon" />
          <div>
            <h1 className="mop-title">سفارشات من</h1>
            <p className="mop-subtitle">سفارشاتی که به شما تخصیص یافته‌اند</p>
          </div>
        </div>
        <div className="mop-header-left">
          {!isLoadingMyOrders && !myOrdersError && (
            <span className="mop-count-badge">{myOrdersTotal} سفارش</span>
          )}
          <button
            className="mop-refresh-btn"
            onClick={() => fetchOrders()}
            disabled={isLoadingMyOrders}
          >
            <i className={`bi bi-arrow-clockwise${isLoadingMyOrders ? " mop-spin" : ""}`} />
            بارگذاری مجدد
          </button>
        </div>
      </div>

      {/* ── Status tabs ── */}
      <div className="mop-tabs">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            className={`mop-tab${status === s.value ? " active" : ""} ${s.cls}`}
            onClick={() => setStatus(s.value)}
          >
            <i className={`bi ${s.icon}`} />
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {myOrdersError && !isLoadingMyOrders && (
        <div className="mop-error">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>خطا در بارگذاری: {myOrdersError}</span>
          <button className="mop-retry-btn" onClick={() => fetchOrders()}>تلاش مجدد</button>
        </div>
      )}

      {/* ── List ── */}
      <div className="mop-list">
        {isLoadingMyOrders ? (
          Array.from({ length: LIMIT }).map((_, i) => <ShimmerCard key={i} />)
        ) : myOrders.length === 0 && !myOrdersError ? (
          <div className="mop-empty">
            <i className="bi bi-inbox mop-empty-icon" />
            <p>
              {status === "READY_FOR_INSTALLATION"
                ? "سفارش آماده نصبی وجود ندارد."
                : "سفارش نصب‌شده‌ای وجود ندارد."}
            </p>
          </div>
        ) : (
          myOrders.map((order) => {
            const user      = order.user     || {};
            const product   = order.product  || {};
            const device    = order.device   || null;
            const machineLabel = getMachineLabel(order.machinery);
            const orderId   = order.oid || order.id;
            return (
              <div key={orderId} className="mop-card">

                {/* ── Card header ── */}
                <div className="mop-card-header">
                  <span className="mop-order-id">
                    <i className="bi bi-hash" />{orderId}
                  </span>
                  <span className={`mop-status-badge ${currentStatus?.cls}`}>
                    <i className={`bi ${currentStatus?.icon}`} />
                    {currentStatus?.label}
                  </span>
                  <span className="mop-order-date">
                    <i className="bi bi-calendar3" />
                    {order.createdAt ? formatDate(order.createdAt) : "—"}
                  </span>
                </div>

                {/* ── Info chips ── */}
                <div className="mop-card-chips">
                  <span className="mop-chip mop-chip-user">
                    <i className="bi bi-person-fill" />
                    {user.name || "—"}
                    {user.phone && <span className="mop-chip-sub">{user.phone}</span>}
                  </span>
                  <span className="mop-chip mop-chip-machine">
                    <i className="bi bi-truck" />
                    {machineLabel}
                    {order.machinery?.manufacture_year && (
                      <span className="mop-chip-sub">{order.machinery.manufacture_year}</span>
                    )}
                  </span>
                  <span className="mop-chip mop-chip-product">
                    <i className="bi bi-box-seam" />
                    {product.name || "—"}
                  </span>
                  {device && (
                    <span className="mop-chip mop-chip-device">
                      <i className="bi bi-cpu" />
                      <span className="ltr">{device.serial_number || `ID: ${device.device_id}`}</span>
                    </span>
                  )}
                </div>

                {/* ── Address ── */}
                {(user.province || user.city || user.village || user.address) && (
                  <div className="mop-address-row">
                    <i className="bi bi-geo-alt-fill mop-address-icon" />
                    <span className="mop-address-text">
                      {[user.province, user.city, user.village, user.address]
                        .filter(Boolean)
                        .join(" — ")}
                    </span>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoadingMyOrders && myOrdersTotalPages > 1 && (
        <div className="mop-pagination">
          <button
            className="mop-page-btn"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            aria-label="صفحه قبل"
          >
            <i className="bi bi-chevron-right" />
          </button>

          {Array.from({ length: myOrdersTotalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === myOrdersTotalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span key={`ellipsis-${idx}`} className="mop-page-ellipsis">…</span>
              ) : (
                <button
                  key={item}
                  className={`mop-page-btn${item === page ? " active" : ""}`}
                  onClick={() => goToPage(item)}
                >
                  {item}
                </button>
              )
            )}

          <button
            className="mop-page-btn"
            onClick={() => goToPage(page + 1)}
            disabled={page >= myOrdersTotalPages}
            aria-label="صفحه بعد"
          >
            <i className="bi bi-chevron-left" />
          </button>

          <span className="mop-page-info">{page} / {myOrdersTotalPages}</span>
        </div>
      )}

    </div>
  );
}
