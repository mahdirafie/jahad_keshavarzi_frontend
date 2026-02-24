import React, { useEffect, useState } from "react";
import useOrderStore from "../stores/orderStore";
import "./userOrders.css";

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

const UserOrders = () => {
  const {
    allUsersOrders,
    ordersCount,
    isLoadingAll,
    errorAll,
    fetchAllUsersOrders,
    clearError,
  } = useOrderStore();

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchAllUsersOrders({ query, page, limit });
  }, [query, page, limit, fetchAllUsersOrders]);

  useEffect(() => () => clearError(), [clearError]);

  const rows = [];
  allUsersOrders?.forEach((user) => {
    user.orders?.forEach((order) => {
      rows.push({ user, order });
    });
  });

  const totalPages = Math.max(1, Math.ceil(ordersCount.total / limit));

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
      </div>

      <div className="op-table">
        <div className="op-thead">
          <span className="op-col op-col-user">کاربر</span>
          <span className="op-col op-col-machine">ماشین</span>
          <span className="op-col op-col-payment">پرداخت</span>
          <span className="op-col op-col-amount">مبلغ</span>
          <span className="op-col op-col-status">وضعیت</span>
        </div>

        {isLoadingAll ? (
          <div className="op-state-msg">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>در حال بارگذاری...</span>
          </div>
        ) : errorAll ? (
          <div className="op-state-msg op-error-msg">{errorAll}</div>
        ) : rows.length === 0 ? (
          <div className="op-state-msg">نتیجه‌ای یافت نشد.</div>
        ) : (
          rows.map((r, idx) => {
            const info = getMachineInfo(r.order.machinery);
            return (
              <div key={idx} className="op-row">
                <div className="op-col op-col-user" data-label="کاربر">
                  <div className="op-avatar">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div className="op-user-text">
                    <span className="op-user-name">{r.user.name}</span>
                    <span className="op-user-sub">{r.user.national_code}</span>
                  </div>
                </div>
                <div className="op-col op-col-machine" data-label="ماشین">
                  <span className="op-machine-model">
                    {r.order.machinery?.model}
                  </span>
                  <span className="op-machine-sub">
                    {info.category}
                    {info.subType ? ` · ${info.subType}` : ""}
                    {r.order.machinery?.manufacture_year
                      ? ` · ${r.order.machinery.manufacture_year}`
                      : ""}
                  </span>
                </div>
                <div className="op-col op-col-payment" data-label="پرداخت">
                  <span
                    className={`op-badge ${
                      r.order.payment_method === "CASH"
                        ? "op-badge-green"
                        : "op-badge-amber"
                    }`}
                  >
                    {r.order.payment_method === "CASH" ? "نقدی" : "اقساطی"}
                  </span>
                </div>
                <div className="op-col op-col-amount" data-label="مبلغ">
                  {r.order.paid?.toLocaleString()} تومان
                </div>
                <div className="op-col op-col-status" data-label="وضعیت">
                  <span
                    className={`op-badge op-badge-dot ${
                      r.order.status === "PAID"
                        ? "op-badge-green"
                        : "op-badge-amber"
                    }`}
                  >
                    {r.order.status === "PAID" ? "پرداخت شده" : "در انتظار"}
                  </span>
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
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              قبلی ›
            </button>
            <span className="op-page-num">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ‹ بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
