import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useParams } from "react-router-dom";
import BASE_URL from "../common/baseUrl";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function TractorDetailPage() {
  const { tractorId } = useParams();
  const [tractor, setTractor] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPath, setShowPath] = useState(false);
  const [timeRange, setTimeRange] = useState("day");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (tractorId) {
      fetchTractorLogs();
    }
  }, [tractorId, timeRange]);

  const fetchTractorLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/tractor_log/get_all?time_range=${timeRange}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tractor_id: tractorId }),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات");
      }

      const data = await response.json();
      console.log("API Response:", data);
      console.log("Logs:", data.logs);
      console.log("First log:", data.logs?.[0]);
      setTractor(data.tractor);
      setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tractor logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);

      let tableHeaders = "";
      let tableRows = "";

      if (timeRange === "day") {
        // Daily logs - individual records
        tableHeaders = `
          <tr>
            <th>ردیف</th>
            <th>تاریخ</th>
            <th>زمان</th>
            <th>عرض جغرافیایی</th>
            <th>طول جغرافیایی</th>
            <th>سوخت ورودی</th>
            <th>سوخت خروجی</th>
            <th>مصرف سوخت</th>
            <th>RPM</th>
            <th>مسافت (km)</th>
            <th>دما (°C)</th>
          </tr>
        `;

        tableRows = logs
          .map(
            (log, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${formatDate(log.sent_at)}</td>
            <td>${formatTime(log.sent_at)}</td>
            <td>${log.latitude.toFixed(4)}</td>
            <td>${log.longitude.toFixed(4)}</td>
            <td>${log.in_fuel.toFixed(2)}</td>
            <td>${log.out_fuel.toFixed(2)}</td>
            <td>${(log.in_fuel - log.out_fuel).toFixed(2)}</td>
            <td>${log.rpm}</td>
            <td>${log.distance.toFixed(2)}</td>
            <td>${log.temp.toFixed(1)}</td>
          </tr>
        `
          )
          .join("");
      } else if (timeRange === "week") {
        // Weekly aggregated logs
        tableHeaders = `
          <tr>
            <th>ردیف</th>
            <th>روز</th>
            <th>تاریخ جلالی</th>
            <th>متوسط موقعیت</th>
            <th>مجموع سوخت ورودی</th>
            <th>مجموع سوخت خروجی</th>
            <th>مصرف کل سوخت</th>
            <th>متوسط RPM</th>
            <th>مجموع مسافت (km)</th>
            <th>متوسط دما (°C)</th>
          </tr>
        `;

        tableRows = logs
          .map(
            (log, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${log.day}</td>
            <td>${log.jalali_date}</td>
            <td>${log.avg_lat.toFixed(4)}, ${log.avg_lon.toFixed(4)}</td>
            <td>${log.sum_in_fuel.toFixed(2)}</td>
            <td>${log.sum_out_fuel.toFixed(2)}</td>
            <td>${(log.sum_in_fuel - log.sum_out_fuel).toFixed(2)}</td>
            <td>${Math.round(log.avg_rpm)}</td>
            <td>${log.sum_distance.toFixed(2)}</td>
            <td>${log.avg_temp.toFixed(1)}</td>
          </tr>
        `
          )
          .join("");
      } else if (timeRange === "month") {
        // Monthly aggregated logs by week
        tableHeaders = `
          <tr>
            <th>ردیف</th>
            <th>هفته</th>
            <th>متوسط موقعیت</th>
            <th>مجموع سوخت ورودی</th>
            <th>مجموع سوخت خروجی</th>
            <th>مصرف کل سوخت</th>
            <th>متوسط RPM</th>
            <th>مجموع مسافت (km)</th>
            <th>متوسط دما (°C)</th>
          </tr>
        `;

        tableRows = logs
          .map(
            (log, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${log.week}</td>
            <td>${log.avg_lat.toFixed(4)}, ${log.avg_lon.toFixed(4)}</td>
            <td>${log.sum_in_fuel.toFixed(2)}</td>
            <td>${log.sum_out_fuel.toFixed(2)}</td>
            <td>${(log.sum_in_fuel - log.sum_out_fuel).toFixed(2)}</td>
            <td>${Math.round(log.avg_rpm)}</td>
            <td>${log.sum_distance.toFixed(2)}</td>
            <td>${log.avg_temp.toFixed(1)}</td>
          </tr>
        `
          )
          .join("");
      } else if (timeRange === "year") {
        // Yearly aggregated logs by month
        tableHeaders = `
          <tr>
            <th>ردیف</th>
            <th>ماه</th>
            <th>سال جلالی</th>
            <th>متوسط موقعیت</th>
            <th>مجموع سوخت ورودی</th>
            <th>مجموع سوخت خروجی</th>
            <th>مصرف کل سوخت</th>
            <th>متوسط RPM</th>
            <th>مجموع مسافت (km)</th>
            <th>متوسط دما (°C)</th>
          </tr>
        `;

        tableRows = logs
          .map(
            (log, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${log.month}</td>
            <td>${log.jalali_year}</td>
            <td>${log.avg_lat.toFixed(4)}, ${log.avg_lon.toFixed(4)}</td>
            <td>${log.sum_in_fuel.toFixed(2)}</td>
            <td>${log.sum_out_fuel.toFixed(2)}</td>
            <td>${(log.sum_in_fuel - log.sum_out_fuel).toFixed(2)}</td>
            <td>${Math.round(log.avg_rpm)}</td>
            <td>${log.sum_distance.toFixed(2)}</td>
            <td>${log.avg_temp.toFixed(1)}</td>
          </tr>
        `
          )
          .join("");
      }

      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <title>گزارش تراکتور - ${tractor.model}</title>
          <style>
            body {
              font-family: Tahoma, Arial, sans-serif;
              direction: rtl;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2e7d32;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #2e7d32;
              margin: 0;
            }
            .tractor-info {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              background: white;
              border-radius: 4px;
            }
            .info-label {
              font-weight: bold;
              color: #757575;
            }
            .info-value {
              color: #2e7d32;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 0.9em;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: center;
            }
            th {
              background-color: #2e7d32;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #757575;
              font-size: 0.9em;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚜 گزارش تراکتور</h1>
            <p>تاریخ گزارش: ${new Date().toLocaleDateString("fa-IR")}</p>
          </div>
          
          <div class="tractor-info">
            <h2 style="color: #2e7d32; margin-top: 0;">اطلاعات تراکتور</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">مدل:</span>
                <span class="info-value">${tractor.model}</span>
              </div>
              <div class="info-item">
                <span class="info-label">کد ملی:</span>
                <span class="info-value">${tractor.national_code}</span>
              </div>
              <div class="info-item">
                <span class="info-label">شهر:</span>
                <span class="info-value">${tractor.city}</span>
              </div>
              <div class="info-item">
                <span class="info-label">تاریخ ثبت:</span>
                <span class="info-value">${formatDate(tractor.createdAt)}</span>
              </div>
            </div>
          </div>

          <h2 style="color: #2e7d32;">جدول لاگ‌ها</h2>
          <table>
            <thead>
              ${tableHeaders}
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            <p>تعداد کل رکوردها: ${logs.length}</p>
            <p>بازه زمانی: ${getTimeRangeLabel(timeRange)}</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("خطا در خروجی گرفتن PDF");
    } finally {
      setExporting(false);
    }
  };

  const getTimeRangeLabel = (range) => {
    const labels = {
      day: "روز",
      week: "هفته",
      month: "ماه",
      year: "سال",
    };
    return labels[range] || range;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Prepare chart data based on time range
  const getChartData = () => {
    if (logs.length === 0) return [];

    if (timeRange === "day") {
      // Check if logs have the day structure
      if (logs[0]?.sent_at && logs[0]?.in_fuel !== undefined) {
        return logs.map((log, index) => ({
          name: formatTime(log.sent_at),
          fuelUsage: parseFloat((log.in_fuel - log.out_fuel).toFixed(2)),
          index: index + 1,
        }));
      }
      return [];
    } else if (timeRange === "week") {
      // Check if logs have the week structure
      if (logs[0]?.day && logs[0]?.sum_in_fuel !== undefined) {
        return logs.map((log, index) => ({
          name: log.day,
          fuelUsage: parseFloat(
            (log.sum_in_fuel - log.sum_out_fuel).toFixed(2)
          ),
          index: index + 1,
        }));
      }
      return [];
    } else if (timeRange === "month") {
      // Check if logs have the month structure
      if (logs[0]?.week && logs[0]?.sum_in_fuel !== undefined) {
        return logs.map((log, index) => ({
          name: log.week,
          fuelUsage: parseFloat(
            (log.sum_in_fuel - log.sum_out_fuel).toFixed(2)
          ),
          index: index + 1,
        }));
      }
      return [];
    } else if (timeRange === "year") {
      // Check if logs have the year structure
      if (logs[0]?.month && logs[0]?.sum_in_fuel !== undefined) {
        return logs.map((log, index) => ({
          name: log.month,
          fuelUsage: parseFloat(
            (log.sum_in_fuel - log.sum_out_fuel).toFixed(2)
          ),
          index: index + 1,
        }));
      }
      return [];
    }
    return [];
  };

  // Get map center and markers based on time range
  const getMapData = () => {
    if (logs.length === 0)
      return { center: [35.6892, 51.389], markers: [], paths: [] };

    if (timeRange === "day") {
      // Individual markers for daily logs
      const validLogs = logs.filter((log) => log.latitude && log.longitude);
      if (validLogs.length === 0)
        return { center: [35.6892, 51.389], markers: [], paths: [] };

      const avgLat =
        validLogs.reduce((sum, log) => sum + log.latitude, 0) /
        validLogs.length;
      const avgLon =
        validLogs.reduce((sum, log) => sum + log.longitude, 0) /
        validLogs.length;
      const markers = validLogs.map((log, index) => ({
        position: [log.latitude, log.longitude],
        popup: `
          <strong>نقطه ${index + 1}</strong><br/>
          lat: ${log.latitude.toFixed(4)}<br/>
          lon: ${log.longitude.toFixed(4)}<br/>
          مصرف سوخت: ${(log.in_fuel - log.out_fuel).toFixed(2)} لیتر<br/>
          زمان: ${formatTime(log.sent_at)}
        `,
      }));
      const paths = validLogs.map((log) => [log.latitude, log.longitude]);
      return { center: [avgLat, avgLon], markers, paths };
    } else {
      // Aggregated markers for week/month/year
      const validLogs = logs.filter((log) => log.avg_lat && log.avg_lon);
      if (validLogs.length === 0)
        return { center: [35.6892, 51.389], markers: [], paths: [] };

      const avgLat =
        validLogs.reduce((sum, log) => sum + log.avg_lat, 0) / validLogs.length;
      const avgLon =
        validLogs.reduce((sum, log) => sum + log.avg_lon, 0) / validLogs.length;
      const markers = validLogs.map((log, index) => {
        let label = "";
        if (timeRange === "week") label = log.day || `روز ${index + 1}`;
        else if (timeRange === "month") label = log.week || `هفته ${index + 1}`;
        else if (timeRange === "year") label = log.month || `ماه ${index + 1}`;

        return {
          position: [log.avg_lat, log.avg_lon],
          popup: `
            <strong>${label}</strong><br/>
            متوسط موقعیت:<br/>
            lat: ${log.avg_lat.toFixed(4)}<br/>
            lon: ${log.avg_lon.toFixed(4)}<br/>
            مصرف کل سوخت: ${(log.sum_in_fuel - log.sum_out_fuel).toFixed(
              2
            )} لیتر<br/>
            مسافت کل: ${log.sum_distance.toFixed(2)} کیلومتر
          `,
        };
      });
      const paths = validLogs.map((log) => [log.avg_lat, log.avg_lon]);
      return { center: [avgLat, avgLon], markers, paths };
    }
  };

  const chartData = getChartData();
  const mapData = getMapData();

  // Check if data structure matches the selected time range
  const isDataValid = () => {
    if (logs.length === 0) return true;
    if (timeRange === "day") return logs[0]?.sent_at !== undefined;
    return logs[0]?.avg_lat !== undefined;
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingContainer}>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p style={styles.loadingText}>در حال دریافت اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div className="alert alert-danger" role="alert">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (!tractor) {
    return (
      <div style={styles.pageContainer}>
        <div className="alert alert-warning" role="alert">
          تراکتور مورد نظر یافت نشد
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div className="container-fluid p-4">
        {/* Tractor Info Card */}
        <div style={styles.tractorInfoCard} className="mb-4">
          <div style={styles.tractorHeader}>
            <div className="d-flex align-items-center">
              <div style={styles.tractorIcon}>🚜</div>
              <div>
                <h3 style={styles.tractorTitle}>اطلاعات تراکتور</h3>
                <p style={styles.tractorSubtitle}>جزئیات و عملکرد</p>
              </div>
            </div>
          </div>
          <div style={styles.tractorDetails}>
            <div className="row">
              <div className="col-md-3 col-6 mb-3">
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>مدل</span>
                  <span style={styles.detailValue}>{tractor.model}</span>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>کد ملی</span>
                  <span style={styles.detailValue}>
                    {tractor.national_code}
                  </span>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>شهر</span>
                  <span style={styles.detailValue}>{tractor.city}</span>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>تاریخ ثبت</span>
                  <span style={styles.detailValue}>
                    {formatDate(tractor.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div style={styles.noDataCard}>
            <p style={styles.noDataText}>
              هیچ اطلاعاتی برای این تراکتور ثبت نشده است
            </p>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>بازه زمانی:</label>
              <select
                value={timeRange}
                onChange={handleTimeRangeChange}
                style={styles.dropdown}
              >
                <option value="day">روز</option>
                <option value="week">هفته</option>
                <option value="month">ماه</option>
                <option value="year">سال</option>
              </select>
            </div>
          </div>
        ) : !isDataValid() ? (
          <div style={styles.loadingContainer}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
            <p style={styles.loadingText}>در حال دریافت اطلاعات...</p>
          </div>
        ) : (
          <>
            <div className="row">
              {/* Map Section */}
              <div className="col-lg-6 mb-4">
                <div style={styles.mapCard}>
                  <h5 style={styles.sectionTitle}>موقعیت مکانی</h5>
                  <MapContainer
                    center={mapData.center}
                    zoom={13}
                    style={styles.map}
                    key={timeRange}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {mapData.markers.map((marker, index) => (
                      <Marker key={index} position={marker.position}>
                        <Popup>
                          <div
                            style={styles.popupContent}
                            dangerouslySetInnerHTML={{ __html: marker.popup }}
                          />
                        </Popup>
                      </Marker>
                    ))}
                    {showPath && mapData.paths.length > 1 && (
                      <Polyline
                        positions={mapData.paths}
                        color="#2e7d32"
                        weight={3}
                      />
                    )}
                  </MapContainer>
                  <button
                    style={styles.mapButton}
                    onClick={() => setShowPath(!showPath)}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #66bb6a, #2e7d32)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 10px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #81c784, #43a047)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    {showPath ? "مخفی کردن مسیر" : "نمایش مسیر"}
                  </button>
                </div>
              </div>

              {/* Chart Section */}
              <div className="col-lg-6 mb-4">
                <div style={styles.chartCard}>
                  <h5 style={styles.chartTitle}>نمودار مصرف سوخت</h5>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis
                        dataKey="name"
                        stroke="#757575"
                        style={{ fontSize: "0.75rem" }}
                        angle={timeRange === "year" ? -45 : 0}
                        textAnchor={timeRange === "year" ? "end" : "middle"}
                        height={timeRange === "year" ? 80 : 60}
                      />
                      <YAxis
                        stroke="#757575"
                        style={{ fontSize: "0.75rem" }}
                        label={{
                          value: "مصرف سوخت (لیتر)",
                          angle: -90,
                          position: "insideLeft",
                          style: { fontSize: "0.85rem", fill: "#757575" },
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #c8e6c9",
                          borderRadius: "8px",
                          padding: "10px",
                        }}
                        labelStyle={{ color: "#2e7d32", fontWeight: "600" }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "0.85rem" }}
                        formatter={() => "مصرف سوخت"}
                      />
                      <Line
                        type="monotone"
                        dataKey="fuelUsage"
                        stroke="#2e7d32"
                        strokeWidth={3}
                        dot={{ fill: "#66bb6a", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Time Range Filter and Export Section */}
            <div className="row mb-4">
              <div className="col-12">
                <div style={styles.filterCard}>
                  <div className="d-flex flex-wrap gap-3 align-items-center">
                    <div style={styles.filterGroup}>
                      <label style={styles.filterLabel}>بازه زمانی:</label>
                      <select
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                        style={styles.dropdown}
                      >
                        <option value="day">روز</option>
                        <option value="week">هفته</option>
                        <option value="month">ماه</option>
                        <option value="year">سال</option>
                      </select>
                    </div>

                    <button
                      onClick={exportToPDF}
                      disabled={exporting}
                      style={styles.exportButton}
                      onMouseEnter={(e) => {
                        if (!exporting) {
                          e.target.style.background =
                            "linear-gradient(135deg, #1976d2, #0d47a1)";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 4px 12px rgba(25, 118, 210, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!exporting) {
                          e.target.style.background =
                            "linear-gradient(135deg, #2196f3, #1565c0)";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 8px rgba(0, 0, 0, 0.1)";
                        }
                      }}
                    >
                      {exporting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          در حال خروجی گرفتن...
                        </>
                      ) : (
                        <>📄 خروجی PDF</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Inline styles
const styles = {
  pageContainer: {
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  loadingText: {
    marginTop: "1rem",
    color: "#757575",
  },
  tractorInfoCard: {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  tractorHeader: {
    background: "linear-gradient(135deg, #66bb6a, #388e3c)",
    color: "white",
    padding: "1.5rem",
  },
  tractorIcon: {
    fontSize: "3rem",
    marginRight: "1rem",
  },
  tractorTitle: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  tractorSubtitle: {
    margin: 0,
    fontSize: "0.9rem",
    opacity: 0.9,
  },
  tractorDetails: {
    backgroundColor: "white",
    padding: "1.5rem",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
  },
  detailLabel: {
    color: "#757575",
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
  },
  detailValue: {
    color: "#2e7d32",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  noDataCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "3rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  noDataText: {
    color: "#757575",
    fontSize: "1.1rem",
    margin: 0,
  },
  mapCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    height: "100%",
  },
  sectionTitle: {
    fontWeight: "600",
    color: "#2e7d32",
    fontSize: "1.2rem",
    marginBottom: "1rem",
  },
  map: {
    width: "100%",
    height: "400px",
    borderRadius: "12px",
    marginBottom: "1rem",
  },
  mapButton: {
    background: "linear-gradient(135deg, #81c784, #43a047)",
    border: "none",
    borderRadius: "10px",
    padding: "10px 20px",
    color: "white",
    fontWeight: "600",
    width: "100%",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    height: "100%",
  },
  chartTitle: {
    fontWeight: "600",
    color: "#2e7d32",
    fontSize: "1.2rem",
    marginBottom: "1rem",
  },
  popupContent: {
    fontSize: "0.85rem",
    color: "#2e7d32",
  },
  filterCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  filterLabel: {
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: "1rem",
    margin: 0,
  },
  dropdown: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "2px solid #c8e6c9",
    fontSize: "1rem",
    color: "#2e7d32",
    fontWeight: "600",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    outline: "none",
    minWidth: "120px",
  },
  exportButton: {
    background: "linear-gradient(135deg, #2196f3, #1565c0)",
    border: "none",
    borderRadius: "10px",
    padding: "10px 24px",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
};
