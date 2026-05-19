import React, { useCallback, useEffect, useState } from "react";
import useDashboardStore from "../stores/dashboardStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import "./SystemConfigPage.css";

const MAX_URLS = 3;

export default function SystemConfigPage() {
  const { getSellConfig, getLogUrlsConfig, updateSellConfig, updateLogUrlsConfig } =
    useDashboardStore();
  const { showSnackbar } = useCustomSnackbar();

  const [sellOpen, setSellOpen]   = useState(false);
  const [urls, setUrls]           = useState(["", "", ""]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  // Track original values to detect changes
  const [origSell, setOrigSell]   = useState(false);
  const [origUrls, setOrigUrls]   = useState(["", "", ""]);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [sellRes, urlsRes] = await Promise.all([getSellConfig(), getLogUrlsConfig()]);

    if (!sellRes.success || !urlsRes.success) {
      setError(
        (!sellRes.success ? sellRes.error : urlsRes.error) ||
          "خطا در بارگذاری تنظیمات"
      );
      setLoading(false);
      return;
    }

    const fetchedSell = !!sellRes.data.sell_open;
    // Normalise to exactly MAX_URLS slots (pad with empty strings)
    const raw = Array.isArray(urlsRes.data.urls) ? urlsRes.data.urls : [];
    const padded = [...raw, "", "", ""].slice(0, MAX_URLS);

    setSellOpen(fetchedSell);
    setUrls(padded);
    setOrigSell(fetchedSell);
    setOrigUrls(padded);
    setLoading(false);
  }, [getSellConfig, getLogUrlsConfig]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const handleUrlChange = (idx, val) => {
    setUrls((prev) => prev.map((u, i) => (i === idx ? val : u)));
  };

  const handleSave = async () => {
    setSaving(true);
    const cleanUrls = urls.map((u) => u.trim()).filter(Boolean);

    const [sellRes, urlsRes] = await Promise.all([
      updateSellConfig(sellOpen),
      updateLogUrlsConfig(cleanUrls),
    ]);

    setSaving(false);

    if (!sellRes.success || !urlsRes.success) {
      const msg =
        (!sellRes.success ? sellRes.error : urlsRes.error) ||
        "خطا در ذخیره تنظیمات";
      showSnackbar(msg, "error");
      return;
    }

    setOrigSell(sellOpen);
    setOrigUrls([...urls]);
    showSnackbar("تنظیمات با موفقیت ذخیره شد", "success");
  };

  const isDirty =
    sellOpen !== origSell ||
    urls.some((u, i) => u !== origUrls[i]);

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="scp-page">
      <div className="scp-header">
        <h1 className="scp-title">
          <i className="bi bi-gear-wide-connected scp-title-icon" />
          تنظیمات سیستم
        </h1>
        <p className="scp-subtitle">
          تنظیمات کلی سرویس فروش و آدرس‌های ارسال لاگ
        </p>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="scp-loading">
          <span className="scp-spinner" />
          در حال بارگذاری تنظیمات...
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="scp-error-block">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>{error}</span>
          <button className="scp-retry-btn" onClick={loadConfig}>
            تلاش مجدد
          </button>
        </div>
      )}

      {/* ── Config form ── */}
      {!loading && !error && (
        <div className="scp-form">

          {/* Sell config card */}
          <div className="scp-card">
            <div className="scp-card-header">
              <i className="bi bi-shop scp-card-icon" />
              <h2 className="scp-card-title">وضعیت فروش</h2>
            </div>
            <p className="scp-card-desc">
              با خاموش کردن این گزینه دسترسی عموم به ثبت سفارش مسدود می‌شود.
            </p>
            <label className="scp-toggle-label">
              <div
                className={`scp-toggle${sellOpen ? " scp-toggle-on" : ""}`}
                onClick={() => setSellOpen((v) => !v)}
                role="switch"
                aria-checked={sellOpen}
                tabIndex={0}
                onKeyDown={(e) => e.key === " " && setSellOpen((v) => !v)}
              >
                <span className="scp-toggle-thumb" />
              </div>
              <span className={`scp-toggle-text${sellOpen ? " scp-toggle-text-on" : ""}`}>
                {sellOpen ? "فروش باز است" : "فروش بسته است"}
              </span>
            </label>
          </div>

          {/* Log URLs card */}
          <div className="scp-card">
            <div className="scp-card-header">
              <i className="bi bi-link-45deg scp-card-icon" />
              <h2 className="scp-card-title">آدرس‌های ارسال لاگ</h2>
            </div>
            <p className="scp-card-desc">
              حداکثر ۳ آدرس URL برای ارسال لاگ‌های دستگاه‌ها تعریف کنید.
            </p>

            <div className="scp-url-list">
              {urls.map((url, idx) => (
                <div key={idx} className="scp-url-row">
                  <span className="scp-url-idx">{idx + 1}</span>
                  <input
                    type="url"
                    className="scp-url-input ltr"
                    placeholder={`آدرس URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => handleUrlChange(idx, e.target.value)}
                    dir="ltr"
                  />
                  {url && (
                    <button
                      className="scp-url-clear"
                      onClick={() => handleUrlChange(idx, "")}
                      title="پاک کردن"
                      type="button"
                    >
                      <i className="bi bi-x" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="scp-footer">
            {isDirty && !saving && (
              <span className="scp-unsaved-badge">
                <i className="bi bi-dot" />
                تغییرات ذخیره نشده
              </span>
            )}
            <button
              className="scp-save-btn"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving ? (
                <>
                  <span className="scp-spinner scp-spinner-sm" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <i className="bi bi-floppy" />
                  ذخیره تنظیمات
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
