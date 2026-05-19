import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useDashboardLogStore from "../stores/dashboardLogStore";
import "./DeviceAnalyticsPage.css";

/* ── Duration options ────────────────────────────────────────────────────── */
const DURATIONS = [
  { value: "day",   label: "امروز" },
  { value: "week",  label: "این هفته" },
  { value: "month", label: "این ماه" },
  // { value: "year",  label: "این سال" },
  { value: "ytd",   label: "از ابتدای سال" },
];

/* ── RPM Gauge ───────────────────────────────────────────────────────────── */
function RpmGauge({ value, max = 4000 }) {
  const pct = value != null ? Math.min(Math.max(value, 0) / max, 1) : 0;
  const cx = 100, cy = 98, r = 82;
  const x1 = cx - r, y1 = cy;
  const x2 = cx + r, y2 = cy;

  // Background semicircle: left → top → right, clockwise (sweep=1)
  const bgPath = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;

  // Value arc endpoint (standard math angle, y flipped for SVG)
  const theta = (1 - pct) * Math.PI;
  const xv = cx + r * Math.cos(theta);
  const yv = cy - r * Math.sin(theta);
  const valuePath = value != null && pct > 0
    ? `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${xv.toFixed(2)} ${yv.toFixed(2)}`
    : null;

  const color = pct < 0.5 ? "#3fb950" : pct < 0.8 ? "#f0a03a" : "#f85149";

  return (
    <svg viewBox="0 0 200 118" className="dap-gauge-svg">
      <path d={bgPath} fill="none" stroke="#21262d" strokeWidth="13" strokeLinecap="round" />
      {valuePath && (
        <path d={valuePath} fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" />
      )}
      <text x="100" y="90" textAnchor="middle" fill="#e6edf3" fontSize="24" fontWeight="700" fontFamily="inherit">
        {value != null ? Math.round(value).toLocaleString("fa-IR") : "—"}
      </text>
      <text x="100" y="108" textAnchor="middle" fill="#7d8590" fontSize="10" fontFamily="inherit">
        دور در دقیقه
      </text>
      <text x={x1} y={y1 + 16} textAnchor="middle" fill="#484f58" fontSize="9" fontFamily="inherit">۰</text>
      <text x={x2} y={y2 + 16} textAnchor="middle" fill="#484f58" fontSize="9" fontFamily="inherit">
        {max.toLocaleString("fa-IR")}
      </text>
    </svg>
  );
}

/* ── Cell Signal ─────────────────────────────────────────────────────────── */
function CellSignalWidget({ value }) {
  // Assume 0–5 bars; unknown range → just show value
  const bars = value != null ? Math.round(Math.min(Math.max(value, 0), 5)) : null;
  const pct  = value != null ? Math.min(Math.max(value, 0) / 5, 1) : null;
  const color = pct == null ? "#484f58"
    : pct >= 0.6 ? "#3fb950"
    : pct >= 0.3 ? "#f0a03a"
    : "#f85149";

  return (
    <div className="dap-widget dap-signal-widget">
      <div className="dap-widget-icon-row">
        <i className="bi bi-reception-4 dap-widget-icon" style={{ color }} />
        <span className="dap-widget-label">سیگنال</span>
      </div>
      <div className="dap-signal-bars">
        {[1, 2, 3, 4, 5].map((b) => (
          <div
            key={b}
            className="dap-signal-bar"
            style={{
              height: `${b * 16}%`,
              background: bars != null && b <= bars ? color : "#21262d",
            }}
          />
        ))}
      </div>
      <div className="dap-widget-value" style={{ color }}>
        {value != null ? value.toFixed(1) : "—"}
      </div>
    </div>
  );
}

/* ── Temperature ─────────────────────────────────────────────────────────── */
function TempWidget({ value }) {
  const color = value == null ? "#484f58"
    : value > 90 ? "#f85149"
    : value > 70 ? "#f0a03a"
    : "#58a6ff";
  return (
    <div className="dap-widget dap-temp-widget">
      <div className="dap-widget-icon-row">
        <i className="bi bi-thermometer-half dap-widget-icon" style={{ color }} />
        <span className="dap-widget-label">دما</span>
      </div>
      <div className="dap-widget-value" style={{ color }}>
        {value != null ? `${value.toFixed(1)}°C` : "—"}
      </div>
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, unit, color = "#3fb950" }) {
  return (
    <div className="dap-stat-card">
      <i className={`bi ${icon} dap-stat-icon`} style={{ color }} />
      <div className="dap-stat-body">
        <span className="dap-stat-value">
          {value != null ? value : "—"}
          {value != null && unit && <span className="dap-stat-unit"> {unit}</span>}
        </span>
        <span className="dap-stat-label">{label}</span>
      </div>
    </div>
  );
}

/* ── Recharts custom tooltip ─────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dap-tooltip">
      <p className="dap-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        p.value != null && (
          <p key={i} className="dap-tooltip-row" style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </p>
        )
      ))}
    </div>
  );
}

/* ── Average helper ──────────────────────────────────────────────────────── */
const avgOf = (buckets, key) => {
  const vals = buckets.map((b) => b[key]).filter((v) => v != null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
};
const sumOf = (buckets, key) => {
  const vals = buckets.map((b) => b[key]).filter((v) => v != null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
};

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function DeviceAnalyticsPage() {
  const { deviceId } = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const { getDeviceAnalytics } = useDashboardLogStore();

  // Optional navigation state passed from ReportsPage
  const { deviceSerial, machineName, userName } = location.state ?? {};

  const [duration, setDuration] = useState("week");
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getDeviceAnalytics(deviceId, duration);
    setLoading(false);
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error || "خطا در بارگذاری اطلاعات دستگاه");
    }
  }, [deviceId, duration, getDeviceAnalytics]);

  useEffect(() => { load(); }, [load]);

  const buckets   = data?.buckets ?? [];
  const hasFuel   = buckets.some((b) => b.fuel_usage != null);
  const hasSpeed  = buckets.some((b) => b.speed   != null);
  const hasDist   = buckets.some((b) => b.distance != null);
  const hasRpm    = buckets.some((b) => b.rpm     != null);
  const hasTemp   = buckets.some((b) => b.temp    != null);
  const hasSignal = buckets.some((b) => b.cell_signal != null);

  const avgRpm    = hasRpm    ? avgOf(buckets, "rpm")         : null;
  const avgSignal = hasSignal ? avgOf(buckets, "cell_signal") : null;
  const avgTemp   = hasTemp   ? avgOf(buckets, "temp")        : null;

  const totalFuel = hasFuel ? sumOf(buckets, "fuel_usage")?.toFixed(2) : null;
  const totalDist = hasDist ? sumOf(buckets, "distance")?.toFixed(2)   : null;
  const avgSpeed  = hasSpeed ? avgOf(buckets, "speed")?.toFixed(1)      : null;
  const totalLogs = buckets.reduce((s, b) => s + (b.log_count ?? 0), 0);

  // Map positions: buckets with valid lat/lon
  const positions = buckets
    .filter((b) => b.lat != null && b.lon != null)
    .map((b) => [b.lat, b.lon]);
  const hasMap    = positions.length > 0;
  const mapCenter = hasMap
    ? [
        positions.reduce((s, p) => s + p[0], 0) / positions.length,
        positions.reduce((s, p) => s + p[1], 0) / positions.length,
      ]
    : [35.6892, 51.389];

  return (
    <div className="dap-page">

      {/* ── Back + header ── */}
      <div className="dap-header">
        <button className="dap-back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-right" />
        </button>
        <div className="dap-header-text">
          <h1 className="dap-title">
            <i className="bi bi-cpu dap-title-icon" />
            آنالیز دستگاه
            {deviceSerial && <span className="dap-title-serial ltr"> — {deviceSerial}</span>}
          </h1>
          {(machineName || userName) && (
            <p className="dap-subtitle">
              {machineName && <span>{machineName}</span>}
              {machineName && userName && <span className="dap-subtitle-sep"> · </span>}
              {userName && <span>{userName}</span>}
            </p>
          )}
          {data?.period_label && (
            <p className="dap-period">{data.period_label}</p>
          )}
        </div>
      </div>

      {/* ── Duration tabs ── */}
      <div className="dap-duration-tabs">
        {DURATIONS.map((d) => (
          <button
            key={d.value}
            className={`dap-duration-tab${duration === d.value ? " active" : ""}`}
            onClick={() => setDuration(d.value)}
            disabled={loading}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="dap-loading">
          <span className="dap-spinner" />
          در حال بارگذاری...
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="dap-error">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>{error}</span>
          <button className="dap-retry-btn" onClick={load}>تلاش مجدد</button>
        </div>
      )}

      {!loading && !error && data && (
        <>

          {/* ── Summary stat cards ── */}
          <div className="dap-stats-row">
            <StatCard icon="bi-list-ol"       label="تعداد لاگ‌ها"        value={totalLogs.toLocaleString("fa-IR")}  color="#7d8590" />
            {hasFuel  && <StatCard icon="bi-fuel-pump"     label="مجموع مصرف سوخت"   value={totalFuel} unit="لیتر"  color="#3fb950" />}
            {hasDist  && <StatCard icon="bi-sign-turn-right" label="مجموع مسافت"    value={totalDist} unit="km"    color="#58a6ff" />}
            {hasSpeed && <StatCard icon="bi-speedometer2"  label="میانگین سرعت"     value={avgSpeed}  unit="km/h"  color="#f0a03a" />}
          </div>

          {/* ── Fuel usage chart ── */}
          {hasFuel && (
            <div className="dap-chart-section">
              <h2 className="dap-section-title">
                <i className="bi bi-fuel-pump" />
                مصرف سوخت
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={buckets} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="title" tick={{ fill: "#7d8590", fontSize: 11, fontFamily: "inherit" }} />
                  <YAxis tick={{ fill: "#7d8590", fontSize: 11 }} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="fuel_usage" name="سوخت (لیتر)" fill="#3fb950" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Speed & Distance chart ── */}
          {(hasSpeed || hasDist) && (
            <div className="dap-chart-section">
              <h2 className="dap-section-title">
                <i className="bi bi-speedometer2" />
                سرعت و مسافت
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={buckets} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="title" tick={{ fill: "#7d8590", fontSize: 11, fontFamily: "inherit" }} />
                  {hasSpeed && <YAxis yAxisId="speed" orientation="right" tick={{ fill: "#f0a03a", fontSize: 11 }} width={40} />}
                  {hasDist  && <YAxis yAxisId="distance" orientation="left"  tick={{ fill: "#58a6ff", fontSize: 11 }} width={40} />}
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#7d8590" }} />
                  {hasSpeed && (
                    <Line yAxisId="speed" type="monotone" dataKey="speed"    name="سرعت (km/h)"  stroke="#f0a03a" strokeWidth={2} dot={false} />
                  )}
                  {hasDist && (
                    <Line yAxisId="distance" type="monotone" dataKey="distance" name="مسافت (km)" stroke="#58a6ff" strokeWidth={2} dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── RPM / Signal / Temp widgets ── */}
          {(hasRpm || hasSignal || hasTemp) && (
            <div className="dap-widgets-section">
              {hasRpm && (
                <div className="dap-widget-card">
                  <h2 className="dap-section-title">
                    <i className="bi bi-speedometer" />
                    RPM (دور موتور)
                  </h2>
                  <div className="dap-gauge-wrap">
                    <RpmGauge value={avgRpm} />
                  </div>
                </div>
              )}
              {hasSignal && (
                <div className="dap-widget-card">
                  <h2 className="dap-section-title">
                    <i className="bi bi-reception-4" />
                    سیگنال سلولی
                  </h2>
                  <CellSignalWidget value={avgSignal} />
                </div>
              )}
              {hasTemp && (
                <div className="dap-widget-card">
                  <h2 className="dap-section-title">
                    <i className="bi bi-thermometer-half" />
                    دمای موتور
                  </h2>
                  <TempWidget value={avgTemp} />
                </div>
              )}
            </div>
          )}

          {/* ── Temperature chart (if multiple buckets have data) ── */}
          {hasTemp && buckets.filter((b) => b.temp != null).length > 1 && (
            <div className="dap-chart-section">
              <h2 className="dap-section-title">
                <i className="bi bi-thermometer-half" />
                روند دما
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={buckets} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#58a6ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#58a6ff" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="title" tick={{ fill: "#7d8590", fontSize: 11, fontFamily: "inherit" }} />
                  <YAxis tick={{ fill: "#7d8590", fontSize: 11 }} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="temp" name="دما (°C)" stroke="#58a6ff" fill="url(#tempGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Location map ── */}
          {hasMap && (
            <div className="dap-chart-section">
              <h2 className="dap-section-title">
                <i className="bi bi-geo-alt-fill" />
                مسیر دستگاه
              </h2>
              <div className="dap-map-wrap">
                <MapContainer
                  center={mapCenter}
                  zoom={10}
                  className="dap-map"
                  scrollWheelZoom
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {positions.length > 1 && (
                    <Polyline positions={positions} color="#3fb950" weight={3} opacity={0.8} />
                  )}
                  {positions.map(([lat, lon], i) => (
                    <CircleMarker
                      key={i}
                      center={[lat, lon]}
                      radius={5}
                      pathOptions={{ color: "#3fb950", fillColor: "#3fb950", fillOpacity: 0.9 }}
                    >
                      <Popup>
                        {buckets.filter((b) => b.lat != null)[i]?.title ?? `نقطه ${i + 1}`}
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>
          )}

          {/* ── No data at all ── */}
          {buckets.every((b) => b.log_count === 0) && (
            <div className="dap-empty">
              <i className="bi bi-inbox dap-empty-icon" />
              <p>در بازه زمانی انتخابی لاگی وجود ندارد.</p>
            </div>
          )}

        </>
      )}

    </div>
  );
}
