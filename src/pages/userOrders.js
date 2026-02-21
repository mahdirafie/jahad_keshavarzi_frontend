import React, { useEffect, useState } from "react";
import useOrderStore from "../stores/orderStore";
import "./userOrders.css";

const UserOrders = () => {
  const {
    allUsersOrders,
    isLoadingAll,
    errorAll,
    fetchAllUsersOrders,
    clearError,
  } = useOrderStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllUsersOrders();
    return () => clearError();
  }, [fetchAllUsersOrders, clearError]);

  const filteredUsers = allUsersOrders?.filter(
    (u) => u.name.includes(search) || u.national_code.includes(search)
  );

  const getMachineType = (m) => {
    if (m.tractor)
      return {
        name: "تراکتور",
        id: m.tractor.machinery_id,
        type: m.tractor.tractor_type,
      };
    if (m.combine)
      return {
        name: "کمباین",
        id: m.combine.machinery_id,
        type: m.combine.usage_type,
      };
    if (m.chopper)
      return { name: "چاپر", id: m.chopper.machinery_id, type: "" };
    return { name: "نامشخص", id: null, type: "" };
  };

  if (isLoadingAll) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (errorAll) {
    return (
      <div className="container py-5">
        <div className="alert alert-light border text-secondary" role="alert">
          {errorAll}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" dir="rtl">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <h2 className="fw-light m-0">همه سفارش‌ها</h2>
        <div className="search-box">
          <i className="bi bi-search text-secondary"></i>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="جستجوی نام یا کد ملی"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* User Cards */}
      <div className="row g-4">
        {filteredUsers?.length === 0 ? (
          <p className="text-secondary">نتیجه‌ای یافت نشد.</p>
        ) : (
          filteredUsers?.map((user) => (
            <div key={user.national_code} className="col-12 col-md-6 col-lg-4">
              <div className="card user-card h-100 border-0 shadow-sm">
                <div className="card-body">
                  {/* User header */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar bg-light rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-person text-secondary fs-5"></i>
                    </div>
                    <div className="me-3 overflow-hidden">
                      <h6 className="mb-0 text-truncate">{user.name}</h6>
                      <small className="text-secondary">
                        {user.national_code}
                      </small>
                    </div>
                  </div>

                  {/* Contact row */}
                  <div className="d-flex flex-wrap gap-2 mb-3 small">
                    <span className="text-secondary">
                      <i className="bi bi-telephone me-1"></i>
                      {user.phone}
                    </span>
                    <span className="text-secondary">
                      <i className="bi bi-person-badge me-1"></i>
                      {user.father_name}
                    </span>
                    <span className="text-secondary">
                      <i className="bi bi-geo-alt me-1"></i>
                      {user.village}
                    </span>
                  </div>

                  {/* Address */}
                  <p className="small text-secondary mb-3 border-bottom pb-2">
                    {user.address}
                  </p>

                  {/* Machines */}
                  <h6 className="small fw-bold mb-2">ماشین‌آلات</h6>
                  {user.machines?.length ? (
                    <div className="machine-list">
                      {user.machines.map((m, idx) => {
                        const type = getMachineType(m);
                        return (
                          <div
                            key={idx}
                            className="machine-item border-bottom pb-2 mb-2"
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <span className="fw-medium">{m.model}</span>
                                <span className="text-secondary me-2 small">
                                  ({m.manufacture_year})
                                </span>
                                <div className="small text-secondary">
                                  {type.name} · {type.type} · شناسه {type.id}
                                </div>
                              </div>
                            </div>
                            {/* Orders */}
                            {m.order?.map((o, oIdx) => (
                              <div
                                key={oIdx}
                                className="order-item d-flex justify-content-between align-items-center small mt-1 p-1 bg-light"
                              >
                                <span
                                  className={`badge ${
                                    o.status === "PAID"
                                      ? "bg-dark text-white"
                                      : "bg-secondary text-white"
                                  }`}
                                >
                                  {o.payment_method === "CASH"
                                    ? "نقدی"
                                    : "اقساطی"}{" "}
                                  · {o.paid.toLocaleString()} تومان
                                </span>
                                <span className="text-secondary">
                                  {o.status === "PAID"
                                    ? "پرداخت شده"
                                    : "در انتظار"}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="small text-secondary">بدون ماشین</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserOrders;
