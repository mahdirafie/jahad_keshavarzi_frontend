import React, { useEffect, useState } from "react";
import useDashboardStore from "../stores/dashboardStore";
import Map from "../components/Map";
import "./OverviewPage.css";

const STAT_CARDS = [
  {
    key: "total_users",
    label: "کاربران ثبت‌نام‌شده",
    icon: "bi-people-fill",
    color: "blue",
  },
  {
    key: "total_orders",
    label: "کل سفارشات",
    icon: "bi-receipt-cutoff",
    color: "purple",
  },
  {
    key: "orders_in_preparation",
    label: "در حال آماده‌سازی",
    icon: "bi-hourglass-split",
    color: "amber",
  },
  {
    key: "orders_ready_to_install",
    label: "آماده نصب",
    icon: "bi-tools",
    color: "cyan",
  },
  {
    key: "orders_installed",
    label: "نصب‌شده",
    icon: "bi-check-circle-fill",
    color: "green",
  },
];

function StatCard({ icon, label, color, value, loading }) {
  return (
    <div className={`ov-stat-card ov-stat-${color}`}>
      <div className="ov-stat-icon">
        <i className={`bi ${icon}`} />
      </div>
      <div className="ov-stat-body">
        {loading ? (
          <div className="ov-shimmer-val op-shimmer" />
        ) : (
          <span className="ov-stat-value">{value ?? "—"}</span>
        )}
        <span className="ov-stat-label">{label}</span>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { getDashboard } = useDashboardStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const result = await getDashboard();
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error || "خطا در بارگذاری اطلاعات");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="ov-page">
      {/* ── Header ── */}
      <div className="ov-header">
        <div className="ov-header-right">
          <i className="bi bi-bar-chart-line-fill ov-header-icon" />
          <div>
            <h1 className="ov-title">آمار کلی</h1>
            <p className="ov-subtitle">
              نمای کلی از وضعیت سامانه و سفارشات
            </p>
          </div>
        </div>
        <button className="ov-refresh-btn" onClick={load} disabled={loading}>
          <i className={`bi bi-arrow-clockwise${loading ? " ov-spin" : ""}`} />
          بارگذاری مجدد
        </button>
      </div>

      {/* ── Error ── */}
      {error && !loading && (
        <div className="ov-error">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>{error}</span>
          <button className="ov-retry-btn" onClick={load}>تلاش مجدد</button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="ov-stats-grid">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            color={card.color}
            value={data?.[card.key]?.toLocaleString("fa-IR")}
            loading={loading}
          />
        ))}
      </div>

      {/* ── Map + Description ── */}
      <div className="ov-main-row">
        {/* Description */}
        <div className="ov-description">
          <h2 className="ov-desc-title">
            <i className="bi bi-info-circle" />
            درباره سامانه
          </h2>
          <p className="ov-desc-text">
            سامانه هوشمند پایش سوخت ماشین‌آلات کشاورزی با هدف بهینه‌سازی مصرف
            سوخت و افزایش بهره‌وری در بخش کشاورزی استان مرکزی طراحی و توسعه
            یافته است.
          </p>
          <p className="ov-desc-text">
            این سامانه با نصب دستگاه‌های هوشمند بر روی ماشین‌آلات کشاورزی
            نظیر تراکتورها، کمباین‌ها و چاپرها، اطلاعات دقیقی از مصرف سوخت،
            موقعیت مکانی و دور موتور را به صورت خودکار ثبت و ارسال می‌نماید.
          </p>
          <p className="ov-desc-text">
            داده‌های جمع‌آوری‌شده امکان نظارت لحظه‌ای مدیران بر عملکرد
            ماشین‌آلات و بهینه‌سازی مصرف سوخت در سطح استان را فراهم می‌آورد.
          </p>

          {/* City breakdown */}
          {data?.cities && Object.keys(data.cities).length > 0 && (
            <div className="ov-cities">
              <h3 className="ov-cities-title">
                <i className="bi bi-geo-alt-fill" />
                سفارشات نصب‌شده به تفکیک شهرستان
              </h3>
              <div className="ov-cities-grid">
                {Object.entries(data.cities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([city, count]) => (
                    <div key={city} className="ov-city-row">
                      <span className="ov-city-name">{city}</span>
                      <span className="ov-city-count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="ov-map-container">
          <h2 className="ov-map-title">
            <i className="bi bi-map" />
            نقشه استان مرکزی
          </h2>
          <p className="ov-map-hint">
            برای مشاهده تعداد دستگاه‌های فعال، نشانگر را روی هر شهرستان
            نگه دارید.
          </p>
          <div className="ov-map-wrap">
            {loading ? (
              <div className="ov-map-shimmer op-shimmer" />
            ) : (
              <Map cities={data?.cities ?? {}} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
