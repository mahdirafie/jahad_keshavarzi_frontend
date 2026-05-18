import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useDashboardStore from "../stores/dashboardStore";
import vidaLogo from "../assets/images/vida-logo.png";
import "./DashboardLayout.css";

const LOG_SUB_ITEMS = [
  {
    label: "سفارشات آماده نصب",
    icon: "bi-tools",
    path: "/dashboard/ready-to-install",
    roles: ["superadmin"],
  },
  {
    label: "سفارشات نصب شده",
    icon: "bi-check2-circle",
    path: "/dashboard/installed-orders",
    roles: ["superadmin"],
  },
  {
    label: "سفارشات من",
    icon: "bi-list-check",
    path: "/dashboard/my-orders",
    roles: ["installer"],
  },
];

const LOG_SECTION_ROLES = ["superadmin", "installer"];

const ROLE_LABELS = {
  superadmin: "سوپرادمین",
  admin: "ادمین",
  employee: "کارمند",
  installer: "نصاب",
};

const NAV_ITEMS = [
  {
    label: "آمار کلی",
    icon: "bi-bar-chart-line-fill",
    path: "/dashboard/overview",
    roles: ["superadmin", "admin", "employee", "installer"],
  },
  {
    label: "سفارشات",
    icon: "bi-receipt",
    path: "/dashboard/userorders",
    roles: ["superadmin", "admin"],
  },
  {
    label: "کاربران",
    icon: "bi-person-lines-fill",
    path: "/dashboard/users",
    roles: ["superadmin", "admin"],
  },
  {
    label: "محصولات",
    icon: "bi-box-seam",
    path: "/dashboard/products",
    roles: ["superadmin"],
  },
  {
    label: "ادمین‌ها",
    icon: "bi-people",
    path: "/dashboard/admins",
    roles: ["superadmin"],
  }
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { admin, getMyRole, logout } = useDashboardStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  const [logAccordionOpen, setLogAccordionOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      // With httpOnly cookies there is no token in localStorage.
      // Just call getMyRole(); if the cookie is absent/expired the
      // adminApiClient interceptor will redirect to /dashboard/login.
      const result = await getMyRole();
      if (!result.success) {
        navigate("/dashboard/login", { replace: true });
        return;
      }
      setLoadingRole(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/dashboard/login", { replace: true });
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !admin?.role || item.roles.includes(admin.role)
  );

  if (loadingRole && !admin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7d8590",
          gap: "0.75rem",
          fontFamily: "inherit",
        }}
      >
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        />
        در حال بارگذاری...
      </div>
    );
  }

  const closeDrawer = () => setDrawerOpen(false);
  const openDrawer = () => setDrawerOpen(true);

  return (
    <div className="dl-root">
      {/* Overlay — clicking outside closes the drawer */}
      <div
        className={`dl-overlay${drawerOpen ? " dl-overlay-visible" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer sidebar */}
      <aside
        ref={sidebarRef}
        className={`dl-sidebar${drawerOpen ? " dl-sidebar-open" : ""}`}
        aria-label="منوی ناوبری"
      >
        <div className="dl-sidebar-top">
          <img src={vidaLogo} alt="لوگو ویدا" className="dl-logo-img" />
          <button
            className="dl-close-btn"
            onClick={closeDrawer}
            aria-label="بستن منو"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {admin && (
          <div className="dl-admin-info">
            <div className="dl-admin-avatar">
              <i className="bi bi-person-circle" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="dl-admin-name">
                {admin.name || admin.national_code}
              </div>
              <div className="dl-admin-role">
                {ROLE_LABELS[admin.role] || admin.role}
              </div>
            </div>
          </div>
        )}

        <nav className="dl-nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `dl-nav-item${isActive ? " dl-nav-active" : ""}`
              }
              onClick={closeDrawer}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* ── Log section accordion (superadmin / admin / installer) ── */}
          {(!admin?.role || LOG_SECTION_ROLES.includes(admin.role)) && <button
            className={`dl-nav-item dl-accordion-trigger${
              logAccordionOpen ? " dl-accordion-open" : ""
            }`}
            onClick={() => setLogAccordionOpen((v) => !v)}
          >
            <i className="bi bi-journal-text" />
            <span style={{ flex: 1, textAlign: "right" }}>بخش لاگ</span>
            <i
              className={`bi bi-chevron-down dl-accordion-chevron${
                logAccordionOpen ? " dl-accordion-chevron-up" : ""
              }`}
            />
          </button>}

          {logAccordionOpen && LOG_SECTION_ROLES.includes(admin?.role) && (
            <div className="dl-accordion-body">
              {LOG_SUB_ITEMS.filter(
                (sub) => !admin?.role || sub.roles.includes(admin.role)
              ).map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `dl-nav-item dl-nav-sub${isActive ? " dl-nav-active" : ""}`
                  }
                  onClick={closeDrawer}
                >
                  <i className={`bi ${sub.icon}`} />
                  <span>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <button className="dl-logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" />
          <span>خروج</span>
        </button>
      </aside>

      {/* Main content — always full width since drawer is an overlay */}
      <main className="dl-main">
        <header className="dl-topbar">
          <button
            className="dl-hamburger"
            onClick={openDrawer}
            aria-label="باز کردن منو"
          >
            <i className="bi bi-list" />
          </button>
        </header>
        <div className="dl-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
