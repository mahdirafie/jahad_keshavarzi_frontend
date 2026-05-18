import React, { useCallback, useEffect, useRef, useState } from "react";
import useDashboardLogStore from "../stores/dashboardLogStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import { formatDate } from "../utils/DateFormat";
import "./ReadyToInstallPage.css";

/* ── Machine helpers ─────────────────────────────────────────────────────── */
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

const SIM_OPERATORS = [
  { value: "Hamrah Aval", label: "همراه اول" },
  { value: "Irancell",    label: "ایرانسل" },
];

const EMPTY_FORM = {
  serial_number: "",
  sim_operator: "Hamrah Aval",
  sim_phone_number: "",
  sim_serial_number: "",
};

/* ── Shimmer ─────────────────────────────────────────────────────────────── */
function ShimmerRow() {
  return (
    <div className="rti-card rti-shimmer-card">
      <div className="rti-shimmer-line rti-shimmer-wide op-shimmer" />
      <div className="rti-shimmer-line rti-shimmer-medium op-shimmer" />
      <div className="rti-shimmer-line rti-shimmer-narrow op-shimmer" />
    </div>
  );
}

export default function ReadyToInstallPage() {
  const {
    readyToInstallOrders,
    readyToInstallTotal,
    readyToInstallPage: storePage,
    readyToInstallTotalPages,
    isLoadingReadyToInstall,
    readyToInstallError,
    getReadyToInstallOrders,
    registerDevice,
    deleteDeviceByMachinery,
    getDeviceForOrder,
    getInstallers,
    assignInstaller,
  } = useDashboardLogStore();
  const { showSnackbar } = useCustomSnackbar();

  /* ── 3-dot menu ── */
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  /* ── Assign device modal ── */
  const [assignOrder, setAssignOrder] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  /* ── Delete confirm ── */
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Search, sort & pagination ── */
  const [searchInput, setSearchInput]   = useState("");
  const [searchQuery, setSearchQuery]   = useState("");   // debounced value sent to API
  const [ascending, setAscending]       = useState(true);
  const [page, setPage]                 = useState(1);
  const LIMIT                           = 5;
  const debounceRef                     = useRef(null);

  /* ── Page-level installer filter ── */
  const [filterInstaller, setFilterInstaller]         = useState(null); // { national_code, name }
  const [filterListOpen, setFilterListOpen]           = useState(false);
  const [filterList, setFilterList]                   = useState([]);
  const [filterListLoading, setFilterListLoading]     = useState(false);
  const filterBoxRef                                  = useRef(null);

  /* ── Assign installer modal ── */
  const [installerModalOrder, setInstallerModalOrder] = useState(null); // order being acted on
  const [installerDevice, setInstallerDevice]         = useState(null); // fetched device object
  const [installerModalLoading, setInstallerModalLoading] = useState(false);
  const [installerList, setInstallerList]             = useState([]);
  const [installerListLoading, setInstallerListLoading] = useState(false);
  const [installerSearchOpen, setInstallerSearchOpen] = useState(false);
  const [selectedInstaller, setSelectedInstaller]     = useState(null); // { national_code, name }
  const [wage, setWage]                               = useState("");
  const [assigningInstaller, setAssigningInstaller]   = useState(false);

  const fetchOrders = useCallback((opts = {}) => {
    return getReadyToInstallOrders({
      installerNationalCode: opts.installer ?? filterInstaller?.national_code,
      search:    opts.search    !== undefined ? opts.search    : searchQuery,
      ascending: opts.ascending !== undefined ? opts.ascending : ascending,
      page:      opts.page      !== undefined ? opts.page      : page,
      limit:     LIMIT,
    });
  }, [filterInstaller, searchQuery, ascending, page, getReadyToInstallOrders]);

  /* Re-fetch whenever filters/sort change — always reset to page 1 */
  useEffect(() => {
    setPage(1);
    getReadyToInstallOrders({
      installerNationalCode: filterInstaller?.national_code,
      search: searchQuery,
      ascending,
      page: 1,
      limit: LIMIT,
    });
  }, [filterInstaller, searchQuery, ascending]);

  /* Re-fetch when page changes (without resetting page) */
  useEffect(() => {
    fetchOrders();
  }, [page]);

  /* Close filter dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (filterBoxRef.current && !filterBoxRef.current.contains(e.target)) {
        setFilterListOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close menu on outside click / scroll */
  useEffect(() => {
    const closeOnOutside = (e) => {
      // Keep menu open when clicking the trigger button OR inside the dropdown itself.
      const insideTrigger = menuRef.current?.contains(e.target);
      const insideDropdown = dropdownRef.current?.contains(e.target);
      if (!insideTrigger && !insideDropdown) {
        setOpenMenuId(null);
      }
    };
    const closeOnMove = () => setOpenMenuId(null);
    document.addEventListener("mousedown", closeOnOutside);
    window.addEventListener("scroll", closeOnMove, true);
    window.addEventListener("resize", closeOnMove);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      window.removeEventListener("scroll", closeOnMove, true);
      window.removeEventListener("resize", closeOnMove);
    };
  }, []);

  /* ── Handlers ── */
  const openMenu = (e, orderId) => {
    e.stopPropagation();
    if (openMenuId === orderId) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    // Align dropdown's LEFT edge with button's left edge so it opens rightward.
    // Clamp so it never overflows off the right side of the viewport.
    const left = Math.min(rect.left, window.innerWidth - 212);
    setMenuPos({ top: rect.bottom + 4, left: Math.max(4, left) });
    setOpenMenuId(orderId);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val.trim()), 500);
  };

  const toggleAscending = () => setAscending((prev) => !prev);

  const goToPage = (p) => {
    if (p < 1 || p > readyToInstallTotalPages || p === page) return;
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
    // Share the same list with the modal so it doesn't need to re-fetch
    setInstallerList(result.data);
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

  const openAssign = (order) => {
    setAssignOrder(order);
    setForm({ ...EMPTY_FORM, machinery_id: order.machinery?.id ?? order.machinery_id ?? "" });
    setOpenMenuId(null);
  };

  const openDelete = (order) => {
    setDeleteOrder(order);
    setOpenMenuId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!form.serial_number.trim() || !form.sim_phone_number.trim() || !form.sim_serial_number.trim()) {
      showSnackbar("لطفاً همه فیلدها را پر کنید", "warning");
      return;
    }
    setSubmitting(true);
    const result = await registerDevice({
      serial_number: form.serial_number.trim(),
      machinery_id: Number(form.machinery_id),
      sim_operator: form.sim_operator,
      sim_phone_number: form.sim_phone_number.trim(),
      sim_serial_number: form.sim_serial_number.trim(),
    });
    setSubmitting(false);
    if (result.success) {
      showSnackbar("دستگاه با موفقیت ثبت شد", "success");
      setAssignOrder(null);
      fetchOrders();
    } else {
      showSnackbar(result.error || "خطا در ثبت دستگاه", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteOrder) return;
    const machineryId = deleteOrder.machinery?.id ?? deleteOrder.machinery_id;
    setDeleting(true);
    const result = await deleteDeviceByMachinery(machineryId);
    setDeleting(false);
    if (result.success) {
      showSnackbar("دستگاه با موفقیت حذف شد", "success");
      setDeleteOrder(null);
      fetchOrders();
    } else {
      showSnackbar(result.error || "خطا در حذف دستگاه", "error");
    }
  };

  const openInstallerModal = async (order) => {
    setInstallerModalOrder(order);
    setInstallerDevice(null);
    setSelectedInstaller(null);
    setWage("");
    setInstallerSearchOpen(false);
    setInstallerList([]);
    setOpenMenuId(null);
    setInstallerModalLoading(true);
    const orderId = order.oid || order.id;
    const result = await getDeviceForOrder(orderId);
    setInstallerModalLoading(false);
    if (!result.success) {
      showSnackbar(result.error || "خطا در دریافت اطلاعات دستگاه", "error");
      setInstallerModalOrder(null);
      return;
    }
    setInstallerDevice(result.data);
  };

  const closeInstallerModal = () => {
    setInstallerModalOrder(null);
    setInstallerDevice(null);
    setSelectedInstaller(null);
    setWage("");
    setInstallerSearchOpen(false);
    setInstallerList([]);
  };

  const handleOpenInstallerSearch = async () => {
    setInstallerSearchOpen(true);
    if (installerList.length > 0) return;
    setInstallerListLoading(true);
    const result = await getInstallers();
    setInstallerListLoading(false);
    if (!result.success) {
      showSnackbar(result.error || "خطا در دریافت لیست نصابان", "error");
      setInstallerSearchOpen(false);
      return;
    }
    setInstallerList(result.data);
  };

  const handleAssignInstaller = async () => {
    if (!selectedInstaller) {
      showSnackbar("لطفاً یک نصاب انتخاب کنید", "warning");
      return;
    }
    const deviceId = installerDevice?.device_id ?? installerDevice?.id;
    if (!deviceId) {
      showSnackbar("شناسه دستگاه یافت نشد", "error");
      return;
    }
    setAssigningInstaller(true);
    const dto = {
      admin_national_code: selectedInstaller.national_code,
      wage: wage.trim() !== "" ? Number(wage) : null,
    };
    const result = await assignInstaller(deviceId, dto);
    setAssigningInstaller(false);
    if (result.success) {
      showSnackbar("نصاب با موفقیت تخصیص یافت", "success");
      closeInstallerModal();
    } else {
      showSnackbar(result.error || "خطا در تخصیص نصاب", "error");
    }
  };

  const orders = readyToInstallOrders;

  return (
    <div className="rti-page">

      {/* ── Header ── */}
      <div className="rti-header">
        <div className="rti-header-right">
          <i className="bi bi-tools rti-header-icon" />
          <div>
            <h1 className="rti-title">سفارشات آماده نصب</h1>
            <p className="rti-subtitle">سفارشاتی که وضعیت آن‌ها آماده نصب دستگاه است</p>
          </div>
        </div>
        <div className="rti-header-left">
          {!isLoadingReadyToInstall && !readyToInstallError && (
            <span className="rti-count-badge">{readyToInstallTotal} سفارش</span>
          )}
          <button
            className="rti-refresh-btn"
            onClick={() => fetchOrders()}
            disabled={isLoadingReadyToInstall}
          >
            <i className={`bi bi-arrow-clockwise${isLoadingReadyToInstall ? " rti-spin" : ""}`} />
            بارگذاری مجدد
          </button>
        </div>
      </div>

      {/* ── Installer filter ── */}
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
                  onClick={() => { setFilterInstaller(null); setFilterListOpen(false); }}
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

      {/* ── Search & sort bar ── */}
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
              onClick={() => { setSearchInput(""); setSearchQuery(""); }}
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

      {/* ── Error ── */}
      {readyToInstallError && !isLoadingReadyToInstall && (
        <div className="rti-error">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>خطا در بارگذاری: {readyToInstallError}</span>
          <button className="rti-retry-btn" onClick={() => fetchOrders()}>تلاش مجدد</button>
        </div>
      )}

      {/* ── List ── */}
      <div className="rti-list">
        {isLoadingReadyToInstall ? (
          Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)
        ) : orders.length === 0 && !readyToInstallError ? (
          <div className="rti-empty">
            <i className="bi bi-inbox rti-empty-icon" />
            <p>سفارش آماده نصبی وجود ندارد.</p>
          </div>
        ) : (
          orders.map((order) => {
            const user = order.user || {};
            const product = order.product || {};
            const device = order.device || null;
            const machineLabel = getMachineLabel(order.machinery);
            const orderId = order.oid || order.id;
            const machineryId = order.machinery?.id ?? order.machinery_id;

            return (
              <div key={orderId} className="rti-card" ref={openMenuId === orderId ? menuRef : null}>
                {/* ── Card header row ── */}
                <div className="rti-card-header">
                  <span className="rti-order-id">
                    <i className="bi bi-hash" />{orderId}
                  </span>
                  <span className="rti-order-date">
                    <i className="bi bi-calendar3" />
                    {order.createdAt ? formatDate(order.createdAt) : "—"}
                  </span>
                  <button
                    className="rti-menu-btn"
                    onClick={(e) => openMenu(e, orderId)}
                    aria-label="گزینه‌ها"
                  >
                    <i className="bi bi-three-dots-vertical" />
                  </button>
                </div>

                {/* ── Info chips row ── */}
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

                {/* ── Address row ── */}
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

                {/* ── Installer badge ── */}
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
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {!isLoadingReadyToInstall && readyToInstallTotalPages > 1 && (
        <div className="rti-pagination">
          <button
            className="rti-page-btn"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            aria-label="صفحه قبل"
          >
            <i className="bi bi-chevron-right" />
          </button>

          {Array.from({ length: readyToInstallTotalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === readyToInstallTotalPages || Math.abs(p - page) <= 1)
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
              )
            )}

          <button
            className="rti-page-btn"
            onClick={() => goToPage(page + 1)}
            disabled={page >= readyToInstallTotalPages}
            aria-label="صفحه بعد"
          >
            <i className="bi bi-chevron-left" />
          </button>

          <span className="rti-page-info">
            {page} / {readyToInstallTotalPages}
          </span>
        </div>
      )}

      {/* ── Fixed 3-dot dropdown ── */}
      {openMenuId && (
        <div
          ref={dropdownRef}
          className="rti-dropdown"
          style={{ position: "fixed", top: menuPos.top, left: menuPos.left, right: "auto" }}
        >
          <button
            onClick={() => {
              const order = orders.find((o) => (o.oid || o.id) === openMenuId);
              if (order) openAssign(order);
            }}
          >
            <i className="bi bi-cpu" />
            تخصیص دستگاه
          </button>
          <button
            onClick={() => {
              const order = orders.find((o) => (o.oid || o.id) === openMenuId);
              if (order) openInstallerModal(order);
            }}
          >
            <i className="bi bi-person-badge" />
            تخصیص نصاب
          </button>
          <button
            className="rti-dropdown-danger"
            onClick={() => {
              const order = orders.find((o) => (o.oid || o.id) === openMenuId);
              if (order) openDelete(order);
            }}
          >
            <i className="bi bi-trash" />
            حذف دستگاه تخصیص‌یافته
          </button>
        </div>
      )}

      {/* ── Assign Device Modal ── */}
      {assignOrder && (
        <div className="rti-modal-backdrop" onClick={() => setAssignOrder(null)}>
          <div className="rti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rti-modal-header">
              <h2 className="rti-modal-title">
                <i className="bi bi-cpu" /> تخصیص دستگاه
              </h2>
              <button className="rti-modal-close" onClick={() => setAssignOrder(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="rti-modal-info">
              <span>
                <i className="bi bi-person" /> {assignOrder.user?.name || "—"}
              </span>
              <span>
                <i className="bi bi-truck" /> {getMachineLabel(assignOrder.machinery)}
              </span>
            </div>

            <form className="rti-form" onSubmit={handleAssignSubmit}>
              <div className="rti-form-group">
                <label>شناسه ماشین‌آلات</label>
                <input
                  className="rti-form-input rti-input-readonly"
                  name="machinery_id"
                  value={form.machinery_id}
                  readOnly
                />
              </div>
              <div className="rti-form-group">
                <label>سریال دستگاه <span className="rti-required">*</span></label>
                <input
                  className="rti-form-input"
                  name="serial_number"
                  value={form.serial_number}
                  onChange={handleFormChange}
                  placeholder="مثال: VP-00157"
                  autoComplete="off"
                  style={{ direction: "ltr" }}
                />
              </div>
              <div className="rti-form-group">
                <label>اپراتور سیم‌کارت <span className="rti-required">*</span></label>
                <select
                  className="rti-form-select"
                  name="sim_operator"
                  value={form.sim_operator}
                  onChange={handleFormChange}
                >
                  {SIM_OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
              <div className="rti-form-group">
                <label>شماره سیم‌کارت <span className="rti-required">*</span></label>
                <input
                  className="rti-form-input"
                  name="sim_phone_number"
                  value={form.sim_phone_number}
                  onChange={handleFormChange}
                  placeholder="09121234567"
                  style={{ direction: "ltr" }}
                />
              </div>
              <div className="rti-form-group">
                <label>سریال سیم‌کارت <span className="rti-required">*</span></label>
                <input
                  className="rti-form-input"
                  name="sim_serial_number"
                  value={form.sim_serial_number}
                  onChange={handleFormChange}
                  placeholder="89380212345678901234"
                  style={{ direction: "ltr" }}
                />
              </div>
              <div className="rti-form-actions">
                <button type="button" className="rti-btn-cancel" onClick={() => setAssignOrder(null)}>
                  انصراف
                </button>
                <button type="submit" className="rti-btn-confirm" disabled={submitting}>
                  {submitting ? "در حال ثبت..." : "ثبت دستگاه"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assign Installer Modal ── */}
      {installerModalOrder && (
        <div className="rti-modal-backdrop" onClick={closeInstallerModal}>
          <div className="rti-modal rti-modal-installer" onClick={(e) => e.stopPropagation()}>
            <div className="rti-modal-header">
              <h2 className="rti-modal-title">
                <i className="bi bi-person-badge" /> تخصیص نصاب
              </h2>
              <button className="rti-modal-close" onClick={closeInstallerModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Loading shimmer while fetching device */}
            {installerModalLoading ? (
              <div className="rti-installer-shimmer-wrap">
                <div className="rti-shimmer-line rti-shimmer-wide op-shimmer" />
                <div className="rti-shimmer-line rti-shimmer-medium op-shimmer" />
                <div className="rti-shimmer-line op-shimmer" style={{ width: "90%" }} />
                <div className="rti-shimmer-line rti-shimmer-wide op-shimmer" />
              </div>
            ) : installerDevice && (
              <div className="rti-installer-body">
                {/* Device info */}
                <div className="rti-installer-device-info">
                  <div className="rti-info-row">
                    <i className="bi bi-cpu rti-info-icon" />
                    <span className="rti-info-label">سریال دستگاه</span>
                    <span className="rti-info-value ltr">{installerDevice.serial_number || "—"}</span>
                  </div>
                  <div className="rti-info-row">
                    <i className="bi bi-truck rti-info-icon" />
                    <span className="rti-info-label">ماشین‌آلات</span>
                    <span className="rti-info-value">{getMachineLabel(installerModalOrder.machinery)}</span>
                  </div>
                  {installerDevice.DeviceInstallation && (
                    <div className="rti-info-row rti-info-existing">
                      <i className="bi bi-person-check rti-info-icon" />
                      <span className="rti-info-label">نصاب فعلی</span>
                      <span className="rti-info-value">
                        {installerDevice.DeviceInstallation?.Admin?.name || "—"}
                        <span className="rti-info-sub ltr">
                          {installerDevice.DeviceInstallation?.Admin?.national_code}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Installer selector */}
                <div className="rti-form-group">
                  <label>انتخاب نصاب <span className="rti-required">*</span></label>
                  <div
                    className={`rti-installer-search-box${installerSearchOpen ? " open" : ""}`}
                    onClick={!installerSearchOpen ? handleOpenInstallerSearch : undefined}
                  >
                    {selectedInstaller ? (
                      <div className="rti-installer-selected">
                        <i className="bi bi-person-check-fill" />
                        <span className="rti-installer-name">{selectedInstaller.name}</span>
                        <span className="rti-installer-code ltr">{selectedInstaller.national_code}</span>
                        <button
                          type="button"
                          className="rti-installer-clear"
                          onClick={(e) => { e.stopPropagation(); setSelectedInstaller(null); setInstallerSearchOpen(false); }}
                        >
                          <i className="bi bi-x" />
                        </button>
                      </div>
                    ) : (
                      <div className="rti-installer-placeholder">
                        <i className="bi bi-search" />
                        <span>جستجو و انتخاب نصاب...</span>
                      </div>
                    )}
                  </div>

                  {/* Dropdown list */}
                  {installerSearchOpen && !selectedInstaller && (
                    <div className="rti-installer-list">
                      {installerListLoading ? (
                        <div className="rti-installer-list-loading">
                          <div className="rti-shimmer-line op-shimmer" style={{ width: "70%", height: "12px" }} />
                          <div className="rti-shimmer-line op-shimmer" style={{ width: "50%", height: "12px" }} />
                        </div>
                      ) : installerList.length === 0 ? (
                        <div className="rti-installer-list-empty">نصابی یافت نشد</div>
                      ) : (
                        installerList.map((ins) => (
                          <button
                            key={ins.national_code}
                            type="button"
                            className="rti-installer-item"
                            onClick={() => { setSelectedInstaller(ins); setInstallerSearchOpen(false); }}
                          >
                            <i className="bi bi-person" />
                            <span className="rti-installer-item-name">{ins.name}</span>
                            <span className="rti-installer-item-code ltr">{ins.national_code}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Wage field */}
                <div className="rti-form-group">
                  <label>دستمزد <span className="rti-optional">(اختیاری — تومان)</span></label>
                  <input
                    className="rti-form-input"
                    type="number"
                    min="0"
                    value={wage}
                    onChange={(e) => setWage(e.target.value)}
                    placeholder="مثال: ۵۰۰۰۰۰"
                    style={{ direction: "ltr" }}
                  />
                </div>

                {/* Actions */}
                <div className="rti-form-actions">
                  <button type="button" className="rti-btn-cancel" onClick={closeInstallerModal}>
                    انصراف
                  </button>
                  <button
                    type="button"
                    className="rti-btn-confirm"
                    onClick={handleAssignInstaller}
                    disabled={assigningInstaller || !selectedInstaller}
                  >
                    {assigningInstaller ? "در حال ثبت..." : "تخصیص نصاب"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteOrder && (
        <div className="rti-modal-backdrop" onClick={() => setDeleteOrder(null)}>
          <div className="rti-modal rti-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="rti-modal-header">
              <h2 className="rti-modal-title danger">
                <i className="bi bi-trash" /> حذف دستگاه
              </h2>
              <button className="rti-modal-close" onClick={() => setDeleteOrder(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <p className="rti-confirm-msg">
              آیا مطمئنید که می‌خواهید دستگاه تخصیص‌یافته به{" "}
              <strong>{deleteOrder.user?.name || "این سفارش"}</strong> را حذف کنید؟
              <br />
              <span className="rti-confirm-sub">
                ماشین: {getMachineLabel(deleteOrder.machinery)} — ID: {deleteOrder.machinery?.id ?? deleteOrder.machinery_id}
              </span>
            </p>
            <div className="rti-form-actions">
              <button className="rti-btn-cancel" onClick={() => setDeleteOrder(null)}>
                انصراف
              </button>
              <button className="rti-btn-danger" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? "در حال حذف..." : "حذف دستگاه"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
