import React, { useCallback, useEffect, useRef, useState } from "react";
import useDashboardLogStore from "../stores/dashboardLogStore";
import useDashboardStore from "../stores/dashboardStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/DateFormat";
import "./ReadyToInstallPage.css";

/* ── Machine helpers (same as ReadyToInstallPage) ─────────────────────────── */
const TRACTOR_TYPE_FA = {
  ROMANIAN_UNIVERSAL: "یونیورسال رومانی",
  FERGUSON: "فرگوسن",
  JOHN_DEERE: "جان‌دیر",
  NEW_HOLLAND: "نیوهلند",
  CASE: "کیس",
  OTHER: "سایر",
};
const COMBINE_USAGE_FA = { WHEAT: "گندم", RICE: "برنج", MULTIPURPOSE: "چندمنظوره" };
const CHOPPER_TYPE_FA = { SELF_PROPELLED: "خودرو", PULL_TYPE: "کششی" };

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

function ShimmerRow() {
  return (
    <div className="rti-card rti-shimmer-card">
      <div className="rti-shimmer-line rti-shimmer-wide op-shimmer" />
      <div className="rti-shimmer-line rti-shimmer-medium op-shimmer" />
      <div className="rti-shimmer-line rti-shimmer-narrow op-shimmer" />
    </div>
  );
}

export default function InstalledOrdersPage() {
  const {
    installedOrders,
    installedTotal,
    installedTotalPages,
    isLoadingInstalled,
    installedError,
    getInstalledOrders,
    getInstallers,
    changeOrderStatus,
  } = useDashboardLogStore();
  const { admin } = useDashboardStore();
  const navigate = useNavigate();
  const { showSnackbar } = useCustomSnackbar();

  useEffect(() => {
    if (admin && admin.role !== "superadmin") {
      navigate("/dashboard/overview", { replace: true });
    }
  }, [admin, navigate]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 5;
  const debounceRef = useRef(null);

  const [actioningId, setActioningId] = useState(null); // orderId currently being actioned

  const [filterInstaller, setFilterInstaller] = useState(null);
  const [filterListOpen, setFilterListOpen] = useState(false);
  const [filterList, setFilterList] = useState([]);
  const [filterListLoading, setFilterListLoading] = useState(false);
  const filterBoxRef = useRef(null);

  const fetchOrders = useCallback(
    (opts = {}) =>
      getInstalledOrders({
        installerNationalCode: opts.installer ?? filterInstaller?.national_code,
        search: opts.search !== undefined ? opts.search : searchQuery,
        ascending: opts.ascending !== undefined ? opts.ascending : ascending,
        page: opts.page !== undefined ? opts.page : page,
        limit: LIMIT,
      }),
    [filterInstaller, searchQuery, ascending, page, getInstalledOrders],
  );

  useEffect(() => {
    setPage(1);
    getInstalledOrders({
      installerNationalCode: filterInstaller?.national_code,
      search: searchQuery,
      ascending,
      page: 1,
      limit: LIMIT,
    });
  }, [filterInstaller, searchQuery, ascending]);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  useEffect(() => {
    const handler = (e) => {
      if (filterBoxRef.current && !filterBoxRef.current.contains(e.target)) {
        setFilterListOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val.trim()), 500);
  };

  const toggleAscending = () => setAscending((prev) => !prev);

  const goToPage = (p) => {
    if (p < 1 || p > installedTotalPages || p === page) return;
    setPage(p);
  };

  const handleOpenFilterList = async () => {
    setFilterListOpen(true);
    if (filterList.length > 0) return;
    setFilterListLoading(true);
    const result = await getInstallers();
    setFilterListLoading(false);
    if (!result.success) {
      showSnackbar(result.error || "خطا در دریافت لیست نصابان", "error");
      setFilterListOpen(false);
      return;
    }
    setFilterList(result.data);
  };

  const selectFilterInstaller = (ins) => {
    setFilterInstaller(ins);
    setFilterListOpen(false);
  };

  const clearFilterInstaller = (e) => {
    e.stopPropagation();
    setFilterInstaller(null);
    setFilterListOpen(false);
  };

  const handleRevertToReady = async (order) => {
    const orderId = order.oid || order.id;
    setActioningId(orderId);
    const result = await changeOrderStatus(orderId, "READY_FOR_INSTALLATION");
    setActioningId(null);
    if (result.success) {
      showSnackbar("سفارش به وضعیت آماده نصب برگردانده شد", "success");
      fetchOrders();
    } else {
      showSnackbar(result.error || "خطا در تغییر وضعیت", "error");
    }
  };

  const handleFinalize = async (order) => {
    const orderId = order.oid || order.id;
    setActioningId(orderId);
    const result = await changeOrderStatus(orderId, "COMPLETED");
    setActioningId(null);
    if (result.success) {
      showSnackbar("سفارش با موفقیت نهایی شد", "success");
      fetchOrders();
    } else {
      showSnackbar(result.error || "خطا در نهایی‌سازی", "error");
    }
  };

  const orders = installedOrders;

  return (
    <div className="rti-page">

      <div className="rti-header">
        <div className="rti-header-right">
          <i className="bi bi-check2-circle rti-header-icon" />
          <div>
            <h1 className="rti-title">سفارشات نصب شده</h1>
            <p className="rti-subtitle">سفارشاتی که دستگاه روی آن‌ها نصب شده است</p>
          </div>
        </div>
        <div className="rti-header-left">
          {!isLoadingInstalled && !installedError && (
            <span className="rti-count-badge">{installedTotal} سفارش</span>
          )}
          <button
            className="rti-refresh-btn"
            onClick={() => fetchOrders()}
            disabled={isLoadingInstalled}
          >
            <i className={`bi bi-arrow-clockwise${isLoadingInstalled ? " rti-spin" : ""}`} />
            بارگذاری مجدد
          </button>
        </div>
      </div>

      <div className="rti-filter-bar" ref={filterBoxRef}>
        <div
          className={`rti-filter-box${filterListOpen ? " open" : ""}${filterInstaller ? " active" : ""}`}
          onClick={!filterListOpen ? handleOpenFilterList : undefined}
        >
          <i className="bi bi-person-badge rti-filter-icon" />
          {filterInstaller ? (
            <>
              <span className="rti-filter-selected-name">{filterInstaller.name}</span>
              <span className="rti-filter-selected-code ltr">{filterInstaller.national_code}</span>
              <button type="button" className="rti-filter-clear" onClick={clearFilterInstaller}>
                <i className="bi bi-x" />
              </button>
            </>
          ) : (
            <span className="rti-filter-placeholder">فیلتر بر اساس نصاب...</span>
          )}
        </div>

        {filterListOpen && (
          <div className="rti-filter-list">
            {filterListLoading ? (
              <div className="rti-installer-list-loading">
                <div className="rti-shimmer-line op-shimmer" style={{ width: "65%", height: "12px" }} />
                <div className="rti-shimmer-line op-shimmer" style={{ width: "45%", height: "12px" }} />
              </div>
            ) : filterList.length === 0 ? (
              <div className="rti-installer-list-empty">نصابی یافت نشد</div>
            ) : (
              <>
                <button
                  type="button"
                  className="rti-installer-item rti-filter-all-item"
                  onClick={() => {
                    setFilterInstaller(null);
                    setFilterListOpen(false);
                  }}
                >
                  <i className="bi bi-people" />
                  <span className="rti-installer-item-name">همه سفارشات</span>
                </button>
                {filterList.map((ins) => (
                  <button
                    key={ins.national_code}
                    type="button"
                    className={`rti-installer-item${filterInstaller?.national_code === ins.national_code ? " selected" : ""}`}
                    onClick={() => selectFilterInstaller(ins)}
                  >
                    <i className="bi bi-person" />
                    <span className="rti-installer-item-name">{ins.name}</span>
                    <span className="rti-installer-item-code ltr">{ins.national_code}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="rti-search-bar">
        <div className="rti-search-input-wrap">
          <i className="bi bi-search rti-search-icon" />
          <input
            className="rti-search-input"
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="جستجو بر اساس شناسه، نام کاربر، نصاب یا سریال دستگاه..."
          />
          {searchInput && (
            <button
              type="button"
              className="rti-search-clear"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
            >
              <i className="bi bi-x" />
            </button>
          )}
        </div>
        <button
          type="button"
          className={`rti-sort-btn${ascending ? " asc" : " desc"}`}
          onClick={toggleAscending}
          title={ascending ? "قدیمی‌ترین اول" : "جدیدترین اول"}
        >
          <i className={`bi bi-sort-${ascending ? "up" : "down"}`} />
          {ascending ? "قدیمی‌ترین" : "جدیدترین"}
        </button>
      </div>

      {installedError && !isLoadingInstalled && (
        <div className="rti-error">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>خطا در بارگذاری: {installedError}</span>
          <button className="rti-retry-btn" onClick={() => fetchOrders()}>تلاش مجدد</button>
        </div>
      )}

      <div className="rti-list">
        {isLoadingInstalled ? (
          Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)
        ) : orders.length === 0 && !installedError ? (
          <div className="rti-empty">
            <i className="bi bi-inbox rti-empty-icon" />
            <p>سفارش نصب‌شده‌ای وجود ندارد.</p>
          </div>
        ) : (
          orders.map((order) => {
            const user = order.user || {};
            const product = order.product || {};
            const device = order.device || null;
            const machineLabel = getMachineLabel(order.machinery);
            const orderId = order.oid || order.id;
            const machineryId = order.machinery?.id ?? order.machinery_id;
            const isActioning = actioningId === orderId;

            return (
              <div key={orderId} className="rti-card">
                <div className="rti-card-header rti-card-header-no-menu">
                  <span className="rti-order-id">
                    <i className="bi bi-hash" />{orderId}
                  </span>
                  <span className="rti-order-date">
                    <i className="bi bi-calendar3" />
                    {order.createdAt ? formatDate(order.createdAt) : "—"}
                  </span>
                </div>

                <div className="rti-card-chips">
                  <span className="rti-chip rti-chip-user">
                    <i className="bi bi-person-fill" />
                    {user.name || "—"}
                    {user.phone && <span className="rti-chip-sub">{user.phone}</span>}
                  </span>
                  <span className="rti-chip rti-chip-machine">
                    <i className="bi bi-truck" />
                    {machineLabel}
                    {order.machinery?.manufacture_year && (
                      <span className="rti-chip-sub">{order.machinery.manufacture_year}</span>
                    )}
                    {machineryId && <span className="rti-chip-sub">ID: {machineryId}</span>}
                  </span>
                  <span className="rti-chip rti-chip-product">
                    <i className="bi bi-box-seam" />
                    {product.name || "—"}
                  </span>
                  {device && (
                    <span className="rti-chip rti-chip-device">
                      <i className="bi bi-cpu" />
                      <span className="ltr">{device.serial_number || `ID: ${device.device_id}`}</span>
                    </span>
                  )}
                </div>

                {(user.province || user.city || user.village || user.address) && (
                  <div className="rti-address-row">
                    <i className="bi bi-geo-alt-fill rti-address-icon" />
                    <span className="rti-address-text">
                      {[user.province, user.city, user.village, user.address]
                        .filter(Boolean)
                        .join(" — ")}
                    </span>
                  </div>
                )}

                {device?.installer && (
                  <div className="rti-installer-badge">
                    <i className="bi bi-person-badge-fill" />
                    <span>نصاب:</span>
                    <span className="rti-installer-badge-name">{device.installer.name}</span>
                    {device.installer.wage != null && (
                      <span className="rti-installer-badge-wage">
                        — {Number(device.installer.wage).toLocaleString("fa-IR")} تومان
                      </span>
                    )}
                  </div>
                )}

                <div className="rti-card-actions">
                  <button
                    type="button"
                    className="rti-action-btn rti-action-revert"
                    onClick={() => handleRevertToReady(order)}
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <span className="rti-spin-sm" />
                    ) : (
                      <i className="bi bi-arrow-counterclockwise" />
                    )}
                    برگشت به آماده نصب
                  </button>
                  <button
                    type="button"
                    className="rti-action-btn rti-action-finalize"
                    onClick={() => handleFinalize(order)}
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <span className="rti-spin-sm" />
                    ) : (
                      <i className="bi bi-flag-fill" />
                    )}
                    نهایی سازی سفارش
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isLoadingInstalled && installedTotalPages > 1 && (
        <div className="rti-pagination">
          <button
            className="rti-page-btn"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            aria-label="صفحه قبل"
          >
            <i className="bi bi-chevron-right" />
          </button>

          {Array.from({ length: installedTotalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === installedTotalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span key={`ellipsis-${idx}`} className="rti-page-ellipsis">…</span>
              ) : (
                <button
                  key={item}
                  className={`rti-page-btn${item === page ? " active" : ""}`}
                  onClick={() => goToPage(item)}
                >
                  {item}
                </button>
              ),
            )}

          <button
            className="rti-page-btn"
            onClick={() => goToPage(page + 1)}
            disabled={page >= installedTotalPages}
            aria-label="صفحه بعد"
          >
            <i className="bi bi-chevron-left" />
          </button>

          <span className="rti-page-info">
            {page} / {installedTotalPages}
          </span>
        </div>
      )}

    </div>
  );
}
