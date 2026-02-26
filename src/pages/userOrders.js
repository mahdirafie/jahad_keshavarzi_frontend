import React, { useEffect, useState, useRef } from "react";
import useOrderStore from "../stores/orderStore";
import { formatDate } from "../utils/DateFormat";
import BASE_URL from "../common/baseUrl";
import ConfirmModal from "../modals/ConfirmModal";
import Modal from "../modals/Modal";
import useCustomSnackbar from "../hooks/useSnackBar";
import "./userOrders.css";

const getProfileImageUrl = (profileImage) => {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  if (profileImage.startsWith("/")) return `${BASE_URL}${profileImage}`;
  return `${BASE_URL}/${profileImage}`;
};

const TRACTOR_TYPE_FA = {
  ROMANIAN_UNIVERSAL: "یونیورسال رومانی",
  FERGUSON: "فرگوسن",
  JOHN_DEERE: "جان‌دیر",
  NEW_HOLLAND: "نیوهلند",
  CASE: "کیس",
  OTHER: "سایر",
};

const COMBINE_USAGE_FA = {
  WHEAT: "گندم",
  RICE: "برنج",
  MULTIPURPOSE: "چندمنظوره",
};

const CHOPPER_TYPE_FA = {
  SELF_PROPELLED: "خودرو",
  PULL_TYPE: "کششی",
};

const getMachineInfo = (machinery) => {
  if (!machinery) return { category: "نامشخص", subType: "" };
  if (machinery.tractor)
    return {
      category: "تراکتور",
      subType: TRACTOR_TYPE_FA[machinery.tractor.tractor_type] || "",
    };
  if (machinery.combine)
    return {
      category: "کمباین",
      subType: COMBINE_USAGE_FA[machinery.combine.usage_type] || "",
    };
  if (machinery.chopper)
    return {
      category: "چاپر",
      subType: CHOPPER_TYPE_FA[machinery.chopper.chopper_type] || "",
    };
  return { category: "نامشخص", subType: "" };
};

const PAYMENT_FA = { CASH: "نقدی", INSTALLMENT: "اقساطی" };

const ORDER_STATUS_FA = {
  PENDING: "در انتظار",
  PAID: "پرداخت شده",
  AWAITING_BALANCE: "در انتظار مانده",
  IN_PREPARATION: "در حال آماده‌سازی",
  READY_FOR_INSTALLATION: "آماده نصب",
  INSTALLED: "نصب شده",
  COMPLETED: "تکمیل شده",
};

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "AWAITING_BALANCE",
  "IN_PREPARATION",
  "READY_FOR_INSTALLATION",
  "INSTALLED",
  "COMPLETED",
];

const UserOrders = () => {
  const {
    allUsersOrders,
    ordersCount,
    ordersPagination,
    isLoadingAll,
    errorAll,
    fetchAllUsersOrders,
    changeOrderPaymentMethod,
    changeOrderStatus,
    clearError,
  } = useOrderStore();
  const { showSnackbar } = useCustomSnackbar();

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [statusChangeOrder, setStatusChangeOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchAllUsersOrders({
      query,
      page,
      limit,
      payment_method: filterPaymentMethod || undefined,
      status: filterStatus || undefined,
    });
  }, [query, page, limit, filterPaymentMethod, filterStatus, fetchAllUsersOrders]);

  useEffect(() => {
    setPage(1);
  }, [filterPaymentMethod, filterStatus]);

  useEffect(() => () => clearError(), [clearError]);

  const orders = allUsersOrders || [];
  const totalPages = ordersPagination?.pages ?? 1;
  const currentPage = ordersPagination?.currentPage ?? page;
  const totalFiltered = ordersPagination?.total ?? 0;
  const limitVal = ordersPagination?.limit ?? limit;
  const startItem = totalFiltered > 0 ? (currentPage - 1) * limitVal + 1 : 0;
  const endItem = Math.min(currentPage * limitVal, totalFiltered);

  return (
    <div className="orders-page" dir="rtl">
      <div className="op-header">
        <h1>سفارش‌ها</h1>
        <p>مشاهده و مدیریت سفارش‌های کاربران</p>
      </div>

      <div className="op-stats">
        <div className="op-stat-card">
          <div className="op-stat-left">
            <span className="op-stat-dot green"></span>
            <span className="op-stat-label">کل سفارش‌ها</span>
          </div>
          <span className="op-stat-value">{ordersCount.total}</span>
        </div>
        <div className="op-stat-card">
          <div className="op-stat-left">
            <span className="op-stat-dot blue"></span>
            <span className="op-stat-label">نقدی</span>
          </div>
          <span className="op-stat-value">{ordersCount.cash}</span>
        </div>
        <div className="op-stat-card">
          <div className="op-stat-left">
            <span className="op-stat-dot amber"></span>
            <span className="op-stat-label">اقساطی</span>
          </div>
          <span className="op-stat-value">{ordersCount.installment}</span>
        </div>
        <div className="op-stat-card">
          <div className="op-stat-left">
            <span className="op-stat-dot purple"></span>
            <span className="op-stat-label">امروز</span>
          </div>
          <span className="op-stat-value">{ordersCount.today}</span>
        </div>
      </div>

      <div className="op-toolbar">
        <div className="op-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="جستجو..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="op-filters">
          <select
            className="op-filter-select"
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
          >
            <option value="">روش پرداخت</option>
            <option value="CASH">نقدی</option>
            <option value="INSTALLMENT">اقساطی</option>
          </select>
          <select
            className="op-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">وضعیت سفارش</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_FA[s]}
              </option>
            ))}
          </select>
        </div>
        {!isLoadingAll && !errorAll && (
          <span className="op-toolbar-stats">
            {totalFiltered === 0
              ? "۰ نتیجه"
              : totalPages > 1
              ? `نمایش ${startItem}–${endItem} از ${totalFiltered.toLocaleString("fa-IR")} نتیجه`
              : `${totalFiltered.toLocaleString("fa-IR")} نتیجه`}
          </span>
        )}
      </div>

      <div className="op-table">
        <div className="op-thead">
          <span className="op-col op-col-user">کاربر</span>
          <span className="op-col op-col-machine">ماشین</span>
          <span className="op-col op-col-payment">پرداخت</span>
          <span className="op-col op-col-amount">مبلغ</span>
          <span className="op-col op-col-date">تاریخ</span>
          <span className="op-col op-col-status">وضعیت</span>
          <span className="op-col op-col-actions"></span>
        </div>

        {isLoadingAll ? (
          <div className="op-state-msg">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>در حال بارگذاری...</span>
          </div>
        ) : errorAll ? (
          <div className="op-state-msg op-error-msg">{errorAll}</div>
        ) : orders.length === 0 ? (
          <div className="op-state-msg">نتیجه‌ای یافت نشد.</div>
        ) : (
          orders.map((order) => {
            const info = getMachineInfo(order.machinery);
            const user = order.user || {};
            const profileUrl = getProfileImageUrl(user.profile_image);
            return (
              <div key={order.oid} className="op-row">
                <div className="op-col op-col-user" data-label="کاربر">
                  <div className="op-avatar">
                    {profileUrl ? (
                      <img src={profileUrl} alt="" />
                    ) : (
                      <i className="bi bi-person-fill"></i>
                    )}
                  </div>
                  <div className="op-user-text">
                    <span className="op-user-name">{user.name}</span>
                    <span className="op-user-sub">{user.national_code}</span>
                  </div>
                </div>
                <div className="op-col op-col-machine" data-label="ماشین">
                  <span className="op-machine-model">
                    {order.machinery?.model}
                  </span>
                  <span className="op-machine-sub">
                    {info.category}
                    {info.subType ? ` · ${info.subType}` : ""}
                    {order.machinery?.manufacture_year
                      ? ` · ${order.machinery.manufacture_year}`
                      : ""}
                  </span>
                </div>
                <div className="op-col op-col-payment" data-label="پرداخت">
                  <span
                    className={`op-badge ${
                      order.payment_method === "CASH"
                        ? "op-badge-green"
                        : "op-badge-amber"
                    }`}
                  >
                    {order.payment_method === "CASH" ? "نقدی" : "اقساطی"}
                  </span>
                </div>
                <div className="op-col op-col-amount" data-label="مبلغ">
                  {order.paid?.toLocaleString()} تومان
                </div>
                <div className="op-col op-col-date" data-label="تاریخ">
                  {order.createdAt ? formatDate(order.createdAt) : "—"}
                </div>
                <div className="op-col op-col-status" data-label="وضعیت">
                  <span
                    className={`op-badge op-badge-dot ${
                      order.status === "PAID" || order.status === "COMPLETED" || order.status === "INSTALLED"
                        ? "op-badge-green"
                        : order.status === "PENDING"
                        ? "op-badge-amber"
                        : "op-badge-blue"
                    }`}
                  >
                    {ORDER_STATUS_FA[order.status] || order.status}
                  </span>
                </div>
                <div
                  className="op-col op-col-actions"
                  data-label="عملیات"
                  ref={openMenuId === order.oid ? menuRef : null}
                >
                  <div className="op-row-menu-wrap">
                    <button
                      type="button"
                      className="op-row-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === order.oid ? null : order.oid);
                      }}
                      aria-label="منو"
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    {openMenuId === order.oid && (
                      <div className="op-row-dropdown">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmOrder(order);
                            setOpenMenuId(null);
                          }}
                        >
                          <i className="bi bi-arrow-left-right"></i>
                          تغییر روش پرداخت
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStatusChangeOrder(order);
                            setSelectedStatus(order.status || "PAID");
                            setOpenMenuId(null);
                          }}
                        >
                          <i className="bi bi-pencil-square"></i>
                          تغییر وضعیت سفارش
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isLoadingAll && !errorAll && (
        <div className="op-pagination">
          <div className="op-page-size">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>تعداد در صفحه</span>
          </div>
          <div className="op-page-nav">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              قبلی ›
            </button>
            <span className="op-page-num">{currentPage} / {totalPages}</span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ‹ بعدی
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmOrder}
        title="تغییر روش پرداخت"
        className="modal-dark"
        message={
          confirmOrder
            ? `آیا مطمئن هستید که می‌خواهید روش پرداخت را از ${PAYMENT_FA[confirmOrder.payment_method]} به ${PAYMENT_FA[confirmOrder.payment_method === "CASH" ? "INSTALLMENT" : "CASH"]} تغییر دهید؟`
            : ""
        }
        onConfirm={async () => {
          if (!confirmOrder) return;
          const ok = await changeOrderPaymentMethod(
            confirmOrder.oid,
            () =>
              fetchAllUsersOrders({
                query,
                page,
                limit,
                payment_method: filterPaymentMethod || undefined,
                status: filterStatus || undefined,
              })
          );
          setConfirmOrder(null);
          if (ok.success) {
            showSnackbar("وضعیت پرداخت با موفقیت تغییر کرد!", "success");
          } else {
            showSnackbar(ok.error, "error");
          }
        }}
        onCancel={() => setConfirmOrder(null)}
      />

      <Modal
        isOpen={!!statusChangeOrder}
        onClose={() => {
          setStatusChangeOrder(null);
          setSelectedStatus("");
        }}
        title="تغییر وضعیت سفارش"
        className="modal-dark"
      >
        {statusChangeOrder && (
          <div className="op-status-modal">
            <p className="op-status-modal-hint">
              وضعیت فعلی: <strong>{ORDER_STATUS_FA[statusChangeOrder.status]}</strong>
            </p>
            <label className="op-status-modal-label">وضعیت جدید:</label>
            <select
              className="op-status-modal-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_FA[s]}
                </option>
              ))}
            </select>
            <div className="op-status-modal-actions">
              <button
                type="button"
                className="op-status-modal-cancel"
                onClick={() => {
                  setStatusChangeOrder(null);
                  setSelectedStatus("");
                }}
              >
                لغو
              </button>
              <button
                type="button"
                className="op-status-modal-confirm"
                disabled={selectedStatus === statusChangeOrder.status}
                onClick={async () => {
                  if (!statusChangeOrder || !selectedStatus || selectedStatus === statusChangeOrder.status) return;
                  const phone = statusChangeOrder.user?.phone || "";
                  const ok = await changeOrderStatus(
                    statusChangeOrder.oid,
                    selectedStatus,
                    phone,
                    () =>
                      fetchAllUsersOrders({
                        query,
                        page,
                        limit,
                        payment_method: filterPaymentMethod || undefined,
                        status: filterStatus || undefined,
                      })
                  );
                  setStatusChangeOrder(null);
                  setSelectedStatus("");
                  if (ok.success) {
                    showSnackbar("وضعیت سفارش با موفقیت تغییر کرد!", "success");
                  } else {
                    showSnackbar(ok.error, "error");
                  }
                }}
              >
                تأیید
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserOrders;
