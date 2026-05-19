import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDashboardLogStore from "../stores/dashboardLogStore";
import "./ReportsPage.css";

/* ── Machine type helpers ───────────────────────────────────────────────── */
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

const getMachineTypeLabel = (machine_type) => {
  if (!machine_type) return "نامشخص";
  if (machine_type.type === "tractor") {
    const sub = TRACTOR_TYPE_FA[machine_type.tractor_type] || "";
    return sub ? `تراکتور — ${sub}` : "تراکتور";
  }
  if (machine_type.type === "combine") {
    const sub = COMBINE_USAGE_FA[machine_type.usage_type] || "";
    return sub ? `کمباین — ${sub}` : "کمباین";
  }
  if (machine_type.type === "chopper") {
    const sub = CHOPPER_TYPE_FA[machine_type.chopper_type] || "";
    return sub ? `چاپر — ${sub}` : "چاپر";
  }
  return "نامشخص";
};

/* ── Shimmer ──────────────────────────────────────────────────────────────── */
function ShimmerCard() {
  return (
    <div className="rp-user-card rp-shimmer-card">
      <div className="rp-shimmer-line rp-shimmer-wide op-shimmer" />
      <div className="rp-shimmer-line rp-shimmer-medium op-shimmer" />
      <div className="rp-shimmer-line rp-shimmer-narrow op-shimmer" />
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const { searchUserDevices } = useDashboardLogStore();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [results, setResults]         = useState(null);  // null = never searched
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const debounceRef = useRef(null);

  const runSearch = async (q) => {
    if (!q.trim()) {
      setResults(null);
      setTotal(0);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await searchUserDevices({ q: q.trim(), page: 1, limit: 50 });
    setLoading(false);
    if (result.success) {
      setResults(result.data.data ?? []);
      setTotal(result.data.total ?? 0);
    } else {
      setError(result.error || "خطا در جستجو");
      setResults([]);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 400);
  };

  const handleClear = () => {
    setSearchInput("");
    setResults(null);
    setTotal(0);
    setError(null);
    clearTimeout(debounceRef.current);
  };

  return (
    <div className="rp-page">

      {/* ── Header ── */}
      <div className="rp-header">
        <i className="bi bi-search rp-header-icon" />
        <div>
          <h1 className="rp-title">گزارشات</h1>
          <p className="rp-subtitle">جستجو بر اساس نام، کد ملی یا شماره تلفن کاربران</p>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="rp-search-wrap">
        <i className="bi bi-search rp-search-icon" />
        <input
          className="rp-search-input"
          type="text"
          value={searchInput}
          onChange={handleChange}
          placeholder="نام، کد ملی یا شماره تلفن..."
          autoFocus
        />
        {loading && <span className="rp-spinner" />}
        {!loading && searchInput && (
          <button type="button" className="rp-clear-btn" onClick={handleClear}>
            <i className="bi bi-x" />
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {results !== null && !loading && !error && (
        <div className="rp-result-meta">
          {total > 0
            ? `${total} کاربر یافت شد`
            : "نتیجه‌ای یافت نشد"}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="rp-error">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Result list ── */}
      <div className="rp-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <ShimmerCard key={i} />)
        ) : results !== null && results.length > 0 ? (
          results.map((user) => (
            <div key={user.national_code} className="rp-user-card">

              {/* User info row */}
              <div className="rp-user-header">
                <span className="rp-user-name">
                  <i className="bi bi-person-fill" />
                  {user.name || "—"}
                </span>
                <span className="rp-user-code ltr">
                  <i className="bi bi-credit-card" />
                  {user.national_code}
                </span>
                {user.phone && (
                  <span className="rp-user-phone ltr">
                    <i className="bi bi-telephone-fill" />
                    {user.phone}
                  </span>
                )}
              </div>

              {/* Machineries */}
              {user.machineries && user.machineries.length > 0 ? (
                <div className="rp-machinery-list">
                  {user.machineries.map((m) => {
                    const hasDevice = !!m.device;
                    const handleRowClick = () => {
                      if (!hasDevice) return;
                      navigate(
                        `/dashboard/device-analytics/${m.device.device_id}`,
                        {
                          state: {
                            deviceSerial: m.device.serial_number || `#${m.device.device_id}`,
                            machineName:  getMachineTypeLabel(m.machine_type),
                            userName:     user.name,
                          },
                        },
                      );
                    };
                    return (
                    <div
                      key={m.id}
                      className={`rp-machinery-row${hasDevice ? " rp-machinery-clickable" : ""}`}
                      onClick={handleRowClick}
                      title={hasDevice ? "مشاهده آنالیز دستگاه" : undefined}
                    >
                      <div className="rp-machinery-info">
                        <span className="rp-machinery-type">
                          <i className="bi bi-truck" />
                          {getMachineTypeLabel(m.machine_type)}
                        </span>
                        {m.manufacture_year && (
                          <span className="rp-machinery-year">{m.manufacture_year}</span>
                        )}
                        {m.model && (
                          <span className="rp-machinery-model">{m.model}</span>
                        )}
                        <span className="rp-machinery-id">ID: {m.id}</span>
                      </div>
                      <div className="rp-device-info">
                        {hasDevice ? (
                          <>
                            <i className="bi bi-cpu rp-device-icon rp-device-ok" />
                            <span className="rp-device-serial ltr">
                              {m.device.serial_number || `#${m.device.device_id}`}
                            </span>
                            <i className="bi bi-bar-chart-line rp-analytics-hint" title="مشاهده آنالیز" />
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cpu rp-device-icon rp-device-none" />
                            <span className="rp-device-none-label">بدون دستگاه</span>
                          </>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rp-no-machinery">
                  <i className="bi bi-inbox" />
                  ماشین‌آلاتی ثبت نشده است
                </div>
              )}

            </div>
          ))
        ) : null}
      </div>

    </div>
  );
}
