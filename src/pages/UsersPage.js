import React, { useEffect, useState, useRef, useCallback } from "react";
import useDashboardStore from "../stores/dashboardStore";
import { formatDate } from "../utils/DateFormat";
import BASE_URL from "../common/baseUrl";
import Modal from "../modals/Modal";
import useCustomSnackbar from "../hooks/useSnackBar";
import "./userOrders.css";
import "./UsersPage.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildProfileUrl = (profileImage) => {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  if (profileImage.startsWith("/")) return `${BASE_URL}${profileImage}`;
  return `${BASE_URL}/${profileImage}`;
};

const birthDateInputValue = (u) =>
  u?.birth_date ? String(u.birth_date).split("T")[0] : "";

const OWNERSHIP_FA = {
  personal: "شخصی",
  professional: "تراکتورچی حرفه‌ای",
};

const fmtOwnership = (v) => OWNERSHIP_FA[v] || v || "—";
const fmtDate = (v) => {
  if (!v) return "—";
  try { return formatDate(v); } catch { return String(v); }
};

// ─── Shimmer ──────────────────────────────────────────────────────────────────

const ShimmerBlock = ({ w = "100%", h = "1rem", radius = "6px" }) => (
  <span
    className="op-shimmer"
    style={{ width: w, height: h, borderRadius: radius, display: "block" }}
  />
);

const ShimmerStatCard = () => (
  <div className="up-stat-card">
    <ShimmerBlock w="80px" h="0.8rem" radius="4px" />
    <ShimmerBlock w="48px" h="2rem" radius="6px" />
  </div>
);

const ShimmerTableRow = () => (
  <div className="up-row">
    <div className="up-col-num">
      <ShimmerBlock w="20px" h="0.9rem" />
    </div>
    <div className="up-col-user">
      <span
        className="op-shimmer"
        style={{ width: 36, height: 36, borderRadius: "50%", display: "block", flexShrink: 0 }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
        <ShimmerBlock w="130px" h="0.85rem" />
        <ShimmerBlock w="90px" h="0.72rem" />
      </div>
    </div>
    <div className="up-col-phone"><ShimmerBlock w="100px" h="0.85rem" /></div>
    <div className="up-col-location"><ShimmerBlock w="80px" h="0.85rem" /></div>
    <div className="up-col-ownership"><ShimmerBlock w="70px" h="1.4rem" radius="20px" /></div>
    <div className="up-col-date"><ShimmerBlock w="80px" h="0.85rem" /></div>
  </div>
);

const ShimmerInfoGrid = () => (
  <div className="op-info-panel">
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.65rem",
        padding: "1.25rem 1rem 1rem",
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: "12px",
      }}
    >
      <span
        className="op-shimmer"
        style={{ width: 88, height: 88, borderRadius: "50%", display: "block" }}
      />
      <ShimmerBlock w="140px" h="1rem" radius="6px" />
    </div>
    {[5, 4].map((rows, si) => (
      <div key={si} className="op-info-section">
        <div className="op-info-section-title">
          <ShimmerBlock w="80px" h="0.65rem" radius="4px" />
        </div>
        <div className="op-info-grid">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="op-info-row">
              <ShimmerBlock w="90px" h="0.72rem" />
              <ShimmerBlock w={`${55 + (i % 3) * 15}%`} h="0.85rem" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ─── Info display helpers ─────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className="op-info-row">
      <span className="op-info-label">{label}</span>
      <span className={`op-info-value${isEmpty ? " op-info-value-empty" : ""}`}>
        {isEmpty ? "—" : value}
      </span>
    </div>
  );
};

const InfoSection = ({ title, children }) => (
  <div className="op-info-section">
    <div className="op-info-section-title">{title}</div>
    <div className="op-info-grid">{children}</div>
  </div>
);

const InfoEditRow = ({ label, children }) => (
  <div className="op-info-row">
    <span className="op-info-label">{label}</span>
    <div className="op-info-edit-cell">{children}</div>
  </div>
);

// ─── User info view panel ─────────────────────────────────────────────────────

const UserInfoPanel = ({ data }) => {
  if (!data) return null;
  const profileUrl = buildProfileUrl(data.profile_image);
  return (
    <div className="op-info-panel">
      <div className="op-info-avatar-wrap">
        {profileUrl ? (
          <img src={profileUrl} alt={data.name} className="op-info-avatar" />
        ) : (
          <div className="op-info-avatar-placeholder">
            <i className="bi bi-person-fill" />
          </div>
        )}
        {data.name && <div className="op-info-avatar-name">{data.name}</div>}
      </div>

      <InfoSection title="اطلاعات هویتی">
        <InfoRow label="نام و نام خانوادگی" value={data.name} />
        <InfoRow label="کد ملی"             value={data.national_code} />
        <InfoRow label="نام پدر"            value={data.father_name} />
        <InfoRow label="تاریخ تولد"         value={birthDateInputValue(data) || null} />
        <InfoRow label="نوع مالکیت"         value={fmtOwnership(data.ownership_type)} />
      </InfoSection>

      <InfoSection title="اطلاعات تماس">
        <InfoRow label="شماره تماس" value={data.phone} />
      </InfoSection>

      <InfoSection title="آدرس و موقعیت">
        <InfoRow label="استان" value={data.province} />
        <InfoRow label="شهر"   value={data.city} />
        <InfoRow label="روستا" value={data.village} />
        <InfoRow label="آدرس"  value={data.address} />
      </InfoSection>

      <InfoSection title="سیستمی">
        <InfoRow label="تاریخ ثبت‌نام"    value={fmtDate(data.createdAt)} />
        <InfoRow label="آخرین بروزرسانی" value={fmtDate(data.updatedAt)} />
      </InfoSection>
    </div>
  );
};

// ─── User edit form (superadmin only) ────────────────────────────────────────

const userToDraft = (u) => ({
  national_code:  u?.national_code  ?? "",
  name:           u?.name           ?? "",
  phone:          u?.phone          ?? "",
  father_name:    u?.father_name    ?? "",
  village:        u?.village        ?? "",
  birth_date:     birthDateInputValue(u),
  ownership_type: u?.ownership_type ?? "",
  profile_image:  u?.profile_image  ?? "",
  address:        u?.address        ?? "",
  province:       u?.province       ?? "",
  city:           u?.city           ?? "",
  password:       "",
});

const buildUserPatch = (baseline, draft) => {
  const body = {};
  const str = (v) => (v == null ? "" : String(v)).trim();
  const keys = [
    "name", "phone", "father_name", "village", "birth_date",
    "ownership_type", "profile_image", "address", "province", "city",
  ];
  for (const k of keys) {
    if (k === "ownership_type") {
      const newV = draft[k] === "" ? null : draft[k];
      const oldV = baseline[k] ?? null;
      if (newV !== oldV) body[k] = newV;
      continue;
    }
    if (k === "birth_date") {
      const newRaw = str(draft[k]);
      const newV = newRaw === "" ? null : newRaw;
      const oldV = baseline[k] ? String(baseline[k]).split("T")[0] : null;
      if (newV !== oldV) body[k] = newV;
      continue;
    }
    const newV = str(draft[k]);
    const oldV = str(baseline[k]);
    if (newV !== oldV) body[k] = newV === "" ? null : newV;
  }
  if (draft.password?.trim()) body.password = draft.password.trim();
  return body;
};

const UserInfoEditForm = ({ draft, onDraftChange }) => {
  const set = (key, value) => onDraftChange({ ...draft, [key]: value });
  const previewUrl = buildProfileUrl(draft.profile_image);
  return (
    <div className="op-info-panel">
      <div className="op-info-avatar-wrap op-info-avatar-wrap--edit">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="op-info-avatar" />
        ) : (
          <div className="op-info-avatar-placeholder">
            <i className="bi bi-person-fill" />
          </div>
        )}
      </div>

      <InfoSection title="اطلاعات هویتی">
        <InfoEditRow label="نام و نام خانوادگی">
          <input
            className="op-info-input"
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            dir="rtl"
          />
        </InfoEditRow>
        <InfoEditRow label="کد ملی">
          <input
            className="op-info-input op-info-input-readonly"
            value={draft.national_code}
            readOnly
            tabIndex={-1}
            dir="ltr"
          />
        </InfoEditRow>
        <InfoEditRow label="نام پدر">
          <input
            className="op-info-input"
            value={draft.father_name}
            onChange={(e) => set("father_name", e.target.value)}
            dir="rtl"
          />
        </InfoEditRow>
        <InfoEditRow label="تاریخ تولد">
          <input
            className="op-info-input"
            type="date"
            value={draft.birth_date}
            onChange={(e) => set("birth_date", e.target.value)}
            dir="ltr"
          />
        </InfoEditRow>
        <InfoEditRow label="نوع مالکیت">
          <select
            className="op-info-input op-info-select"
            value={draft.ownership_type}
            onChange={(e) => set("ownership_type", e.target.value)}
          >
            <option value="">— بدون مقدار —</option>
            <option value="personal">شخصی</option>
            <option value="professional">تراکتورچی حرفه‌ای</option>
          </select>
        </InfoEditRow>
      </InfoSection>

      <InfoSection title="اطلاعات تماس">
        <InfoEditRow label="شماره تماس">
          <input
            className="op-info-input"
            value={draft.phone}
            onChange={(e) => set("phone", e.target.value)}
            dir="ltr"
          />
        </InfoEditRow>
      </InfoSection>

      <InfoSection title="آدرس و موقعیت">
        <InfoEditRow label="استان">
          <input
            className="op-info-input"
            value={draft.province}
            onChange={(e) => set("province", e.target.value)}
            dir="rtl"
          />
        </InfoEditRow>
        <InfoEditRow label="شهر">
          <input
            className="op-info-input"
            value={draft.city}
            onChange={(e) => set("city", e.target.value)}
            dir="rtl"
          />
        </InfoEditRow>
        <InfoEditRow label="روستا">
          <input
            className="op-info-input"
            value={draft.village}
            onChange={(e) => set("village", e.target.value)}
            dir="rtl"
          />
        </InfoEditRow>
        <InfoEditRow label="آدرس">
          <textarea
            className="op-info-input op-info-textarea"
            rows={3}
            value={draft.address}
            onChange={(e) => set("address", e.target.value)}
            dir="rtl"
          />
        </InfoEditRow>
      </InfoSection>

      <InfoSection title="تصویر و امنیت">
        <InfoEditRow label="مسیر تصویر پروفایل">
          <input
            className="op-info-input"
            value={draft.profile_image}
            onChange={(e) => set("profile_image", e.target.value)}
            dir="ltr"
            placeholder="مسیر نسبی یا URL"
          />
        </InfoEditRow>
        <InfoEditRow label="رمز عبور جدید (اختیاری)">
          <input
            className="op-info-input"
            type="password"
            autoComplete="new-password"
            value={draft.password}
            onChange={(e) => set("password", e.target.value)}
            dir="ltr"
            placeholder="خالی = بدون تغییر"
          />
        </InfoEditRow>
      </InfoSection>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const SHIMMER_ROWS = 8;
const SEARCH_DEBOUNCE_MS = 500;
const DEFAULT_PAGE_SIZE = 20;

export default function UsersPage() {
  const { admin, listUsers, getUserInfo, updateUser, sendSmsToPhone, sendSmsToUsers } = useDashboardStore();
  const { showSnackbar } = useCustomSnackbar();

  const isSuperAdmin = admin?.role === "superadmin";

  // ── Full list (all results from API) ────────────────────────────────────────
  const [allUsers, setAllUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── Search ──────────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const debounceRef = useRef(null);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser]   = useState(null);
  const [userDetail, setUserDetail]       = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError]     = useState(null);

  const [editMode, setEditMode]         = useState(false);
  const [formDraft, setFormDraft]       = useState(null);
  const [editBaseline, setEditBaseline] = useState(null);
  const [saving, setSaving]             = useState(false);

  // ── SMS (per-user) ────────────────────────────────────────────────────────────
  const [smsTarget, setSmsTarget]   = useState(null); // { name, phone }
  const [smsMessage, setSmsMessage] = useState("");
  const [smsSending, setSmsSending] = useState(false);

  // ── Broadcast SMS ─────────────────────────────────────────────────────────────
  const [broadcastOpen, setBroadcastOpen]     = useState(false);
  const [broadcastScope, setBroadcastScope]   = useState("all");
  const [broadcastMsg, setBroadcastMsg]       = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const loadUsers = useCallback(async (query) => {
    setFetching(true);
    setFetchError(null);
    const result = await listUsers(query || "");
    setFetching(false);
    if (result.success) {
      setAllUsers(result.data ?? []);
      setTotalCount(result.count ?? result.data?.length ?? 0);
    } else {
      setFetchError(result.error || "خطا در بارگذاری کاربران");
      setAllUsers([]);
      setTotalCount(null);
    }
  }, [listUsers]);

  useEffect(() => {
    loadUsers("");
  }, []);

  // Debounce search + reset to page 1 on new query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setActiveQuery(searchInput);
      setPage(1);
      loadUsers(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── Pagination derivations ────────────────────────────────────────────────────
  const totalItems  = allUsers.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);
  const startIdx    = (currentPage - 1) * limit;
  const endIdx      = Math.min(startIdx + limit, totalItems);
  const pagedUsers  = allUsers.slice(startIdx, endIdx);

  // ── Modal open / close ────────────────────────────────────────────────────────

  const openModal = async (user) => {
    setSelectedUser(user);
    setUserDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    setEditMode(false);
    setFormDraft(null);
    setEditBaseline(null);

    const result = await getUserInfo(user.national_code);
    setDetailLoading(false);
    if (result.success) {
      setUserDetail(result.data);
    } else {
      setDetailError(result.error || "خطا در دریافت اطلاعات کاربر");
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetail(null);
    setDetailError(null);
    setDetailLoading(false);
    setEditMode(false);
    setFormDraft(null);
    setEditBaseline(null);
  };

  // ── Edit handlers ─────────────────────────────────────────────────────────────

  const startEdit = () => {
    if (!userDetail) return;
    setEditBaseline({ ...userDetail });
    setFormDraft(userToDraft(userDetail));
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormDraft(null);
    setEditBaseline(null);
  };

  const saveEdit = async () => {
    const nc = userDetail?.national_code;
    if (!nc || !editBaseline || !formDraft) return;
    if (!formDraft.name?.trim() || !formDraft.phone?.trim()) {
      showSnackbar("نام و شماره تماس نمی‌توانند خالی باشند.", "error");
      return;
    }
    const patch = buildUserPatch(editBaseline, formDraft);
    if (Object.keys(patch).length === 0) {
      showSnackbar("تغییری برای ذخیره وجود ندارد.", "warning");
      return;
    }
    setSaving(true);
    const result = await updateUser(nc, patch);
    setSaving(false);
    if (result.success) {
      showSnackbar(result.message || "اطلاعات کاربر با موفقیت به‌روزرسانی شد.", "success");
      const fresh = result.data;
      setUserDetail(fresh);
      setEditMode(false);
      setFormDraft(null);
      setEditBaseline(null);
      loadUsers(activeQuery);
    } else {
      showSnackbar(result.error || "خطا در ذخیره‌سازی", "error");
    }
  };

  // ── SMS handlers ──────────────────────────────────────────────────────────────

  const openSms = (user, e) => {
    e.stopPropagation();
    setSmsTarget({ name: user.name || user.national_code, phone: user.phone });
    setSmsMessage("");
  };

  const closeSms = () => {
    setSmsTarget(null);
    setSmsMessage("");
  };

  const handleSendSms = async () => {
    if (!smsTarget?.phone || !smsMessage.trim()) return;
    setSmsSending(true);
    const result = await sendSmsToPhone(smsTarget.phone, smsMessage.trim());
    setSmsSending(false);
    if (result.success) {
      showSnackbar(result.message || "پیامک با موفقیت ارسال شد.", "success");
      closeSms();
    } else {
      showSnackbar(result.error || "خطا در ارسال پیامک", "error");
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setBroadcastSending(true);
    const result = await sendSmsToUsers(broadcastMsg.trim(), broadcastScope);
    setBroadcastSending(false);
    if (result.success) {
      const d = result.data;
      showSnackbar(
        `ارسال انبوه پایان یافت — ارسال‌شده: ${d.sent ?? "?"} | ناموفق: ${d.failed ?? "?"}`,
        "success"
      );
      setBroadcastOpen(false);
      setBroadcastMsg("");
      setBroadcastScope("all");
    } else {
      showSnackbar(result.error || "خطا در ارسال انبوه پیامک", "error");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="users-page" dir="rtl">
      {/* Header */}
      <div className="up-header">
        <div>
          <h1>مدیریت کاربران</h1>
          <p>مشاهده و جستجوی کاربران ثبت‌نام کرده در سیستم</p>
        </div>
        {isSuperAdmin && (
          <button className="up-broadcast-btn" onClick={() => setBroadcastOpen(true)}>
            <i className="bi bi-broadcast" />
            ارسال انبوه پیامک
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="up-stats">
        <div className="up-stat-card">
          <div className="up-stat-left">
            <span className="op-stat-dot green" />
            <span className="up-stat-label">
              {activeQuery ? "نتایج جستجو" : "کل کاربران"}
            </span>
          </div>
          {fetching && totalCount === null ? (
            <ShimmerBlock w="50px" h="2.2rem" radius="6px" />
          ) : (
            <span className="up-stat-value">
              {totalCount !== null ? totalCount.toLocaleString("fa-IR") : "—"}
            </span>
          )}
        </div>
      </div>

      {/* Search toolbar */}
      <div className="up-toolbar">
        <div className="up-search">
          <i className="bi bi-search" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، کد ملی یا تلفن..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              className="up-search-clear"
              onClick={() => setSearchInput("")}
              aria-label="پاک کردن جستجو"
            >
              <i className="bi bi-x" />
            </button>
          )}
        </div>
        {!fetching && !fetchError && (
          <span className="up-toolbar-hint">
            {totalItems === 0
              ? "نتیجه‌ای یافت نشد"
              : totalPages > 1
              ? `نمایش ${(startIdx + 1).toLocaleString("fa-IR")}–${endIdx.toLocaleString("fa-IR")} از ${totalItems.toLocaleString("fa-IR")} کاربر`
              : `${totalItems.toLocaleString("fa-IR")} کاربر`}
          </span>
        )}
      </div>

      {/* Table */}
      <div className={`up-table${isSuperAdmin ? " up-table--actions" : ""}`}>
        <div className="up-thead">
          <div>#</div>
          <div>کاربر</div>
          <div>تلفن</div>
          <div>محل سکونت</div>
          <div>نوع مالکیت</div>
          <div>تاریخ ثبت</div>
          {isSuperAdmin && <div />}
        </div>

        {fetching ? (
          Array.from({ length: SHIMMER_ROWS }).map((_, i) => (
            <ShimmerTableRow key={i} />
          ))
        ) : fetchError ? (
          <div className="up-state-msg up-error-msg">
            <i className="bi bi-exclamation-circle" />
            {fetchError}
            <button
              className="up-retry-btn"
              onClick={() => loadUsers(activeQuery)}
            >
              تلاش مجدد
            </button>
          </div>
        ) : pagedUsers.length === 0 ? (
          <div className="up-state-msg">
            <i className="bi bi-inbox" />
            {activeQuery ? "هیچ کاربری با این مشخصات یافت نشد" : "هیچ کاربری وجود ندارد"}
          </div>
        ) : (
          pagedUsers.map((user, index) => {
            const profileUrl = buildProfileUrl(user.profile_image);
            const location = [user.province, user.city].filter(Boolean).join("، ") || null;
            return (
              <div
                key={user.national_code}
                className="up-row up-row-clickable"
                onClick={() => openModal(user)}
              >
                <div className="up-col-num">{startIdx + index + 1}</div>

                <div className="up-col-user">
                  <div className="up-avatar">
                    {profileUrl ? (
                      <img src={profileUrl} alt="" />
                    ) : (
                      <i className="bi bi-person-fill" />
                    )}
                  </div>
                  <div className="up-user-text">
                    <span className="up-user-name">{user.name || "—"}</span>
                    <span className="up-user-sub">{user.national_code}</span>
                  </div>
                </div>

                <div className="up-col-phone" dir="ltr">
                  {user.phone || "—"}
                </div>

                <div className="up-col-location">
                  {location || <span className="up-empty">—</span>}
                </div>

                <div className="up-col-ownership">
                  {user.ownership_type ? (
                    <span
                      className={`op-badge op-badge-dot ${
                        user.ownership_type === "professional"
                          ? "op-badge-blue"
                          : "op-badge-green"
                      }`}
                    >
                      {OWNERSHIP_FA[user.ownership_type]}
                    </span>
                  ) : (
                    <span className="up-empty">—</span>
                  )}
                </div>

                <div className="up-col-date">
                  {user.createdAt ? fmtDate(user.createdAt) : "—"}
                </div>

                {isSuperAdmin && (
                  <div className="up-col-sms" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="up-sms-btn"
                      title="ارسال پیامک"
                      onClick={(e) => openSms(user, e)}
                    >
                      <i className="bi bi-chat-dots" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!fetching && !fetchError && totalItems > 0 && (
        <div className="up-pagination">
          <div className="up-page-size">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>۱۰</option>
              <option value={20}>۲۰</option>
              <option value={50}>۵۰</option>
            </select>
            <span>تعداد در صفحه</span>
          </div>
          <div className="up-page-nav">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              قبلی ›
            </button>
            <span className="up-page-num">
              {currentPage.toLocaleString("fa-IR")} / {totalPages.toLocaleString("fa-IR")}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ‹ بعدی
            </button>
          </div>
        </div>
      )}

      {/* ─── User detail modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedUser}
        onClose={closeModal}
        title={
          selectedUser
            ? editMode
              ? `ویرایش کاربر — ${selectedUser.name || selectedUser.national_code}`
              : `اطلاعات کاربر — ${selectedUser.name || selectedUser.national_code}`
            : ""
        }
        className="modal-dark op-info-modal"
      >
        {/* Scrollable user info body */}
        <div className="op-tab-body">
          {detailLoading ? (
            <ShimmerInfoGrid />
          ) : detailError ? (
            <div className="op-tab-error">
              <i className="bi bi-exclamation-circle" />
              {detailError}
              <button
                className="op-tab-retry"
                onClick={() => openModal(selectedUser)}
              >
                تلاش مجدد
              </button>
            </div>
          ) : editMode && formDraft ? (
            <UserInfoEditForm draft={formDraft} onDraftChange={setFormDraft} />
          ) : (
            <UserInfoPanel data={userDetail} />
          )}
        </div>

        {/* Action bar pinned to bottom */}
        {!detailLoading && !detailError && userDetail && (
          <div className="up-modal-actions">
            {editMode ? (
              <>
                <button
                  className="up-modal-btn up-modal-btn-cancel"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  انصراف
                </button>
                <button
                  className="up-modal-btn up-modal-btn-save"
                  onClick={saveEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" />
                      ذخیره تغییرات
                    </>
                  )}
                </button>
              </>
            ) : (
              isSuperAdmin && (
                <button
                  className="up-modal-btn up-modal-btn-edit"
                  onClick={startEdit}
                >
                  <i className="bi bi-pencil" />
                  ویرایش اطلاعات
                </button>
              )
            )}
          </div>
        )}
      </Modal>

      {/* ─── Per-user SMS modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={!!smsTarget}
        onClose={closeSms}
        title={smsTarget ? `ارسال پیامک به ${smsTarget.name}` : ""}
        className="modal-dark"
      >
        <div className="up-sms-form" dir="rtl">
          <div className="up-sms-phone-row">
            <i className="bi bi-telephone" />
            <span dir="ltr">{smsTarget?.phone || "—"}</span>
          </div>
          <div className="up-sms-field">
            <label className="up-sms-label">متن پیامک</label>
            <textarea
              className="up-sms-textarea"
              rows={5}
              placeholder="متن پیامک را وارد کنید..."
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              maxLength={1000}
              dir="rtl"
            />
            <div className="up-sms-char-count">
              {smsMessage.length.toLocaleString("fa-IR")} / ۱۰۰۰
            </div>
          </div>
          <div className="up-sms-actions">
            <button className="up-modal-btn up-modal-btn-cancel" onClick={closeSms} disabled={smsSending}>
              انصراف
            </button>
            <button
              className="up-modal-btn up-modal-btn-save"
              onClick={handleSendSms}
              disabled={smsSending || !smsMessage.trim()}
            >
              {smsSending ? (
                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> در حال ارسال...</>
              ) : (
                <><i className="bi bi-send" /> ارسال پیامک</>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Broadcast SMS modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={broadcastOpen}
        onClose={() => { setBroadcastOpen(false); setBroadcastMsg(""); setBroadcastScope("all"); }}
        title="ارسال انبوه پیامک"
        className="modal-dark"
      >
        <div className="up-sms-form" dir="rtl">
          <div className="up-sms-field">
            <label className="up-sms-label">محدوده ارسال</label>
            <select
              className="up-sms-select"
              value={broadcastScope}
              onChange={(e) => setBroadcastScope(e.target.value)}
            >
              <option value="all">همه کاربران</option>
              <option value="without_orders">کاربران بدون سفارش</option>
              <option value="with_orders">کاربران دارای سفارش</option>
            </select>
          </div>
          <div className="up-sms-field">
            <label className="up-sms-label">متن پیامک</label>
            <textarea
              className="up-sms-textarea"
              rows={6}
              placeholder="متن پیامک را وارد کنید..."
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              maxLength={1000}
              dir="rtl"
            />
            <div className="up-sms-char-count">
              {broadcastMsg.length.toLocaleString("fa-IR")} / ۱۰۰۰
            </div>
          </div>
          <div className="up-sms-warning">
            <i className="bi bi-exclamation-triangle" />
            پیامک برای
            {broadcastScope === "all"
              ? " همه کاربران ثبت‌نام کرده "
              : broadcastScope === "without_orders"
              ? " کاربران بدون هیچ سفارشی "
              : " کاربران دارای حداقل یک سفارش "}
            ارسال خواهد شد.
          </div>
          <div className="up-sms-actions">
            <button
              className="up-modal-btn up-modal-btn-cancel"
              onClick={() => { setBroadcastOpen(false); setBroadcastMsg(""); setBroadcastScope("all"); }}
              disabled={broadcastSending}
            >
              انصراف
            </button>
            <button
              className="up-modal-btn up-modal-btn-save"
              onClick={handleBroadcast}
              disabled={broadcastSending || !broadcastMsg.trim()}
            >
              {broadcastSending ? (
                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> در حال ارسال...</>
              ) : (
                <><i className="bi bi-broadcast" /> ارسال به همه</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
