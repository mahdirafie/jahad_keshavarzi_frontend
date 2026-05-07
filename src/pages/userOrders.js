import React, { useEffect, useState, useRef, useCallback } from "react";
import useOrderStore from "../stores/orderStore";
import useDashboardStore from "../stores/dashboardStore";
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

const PERFORMANCE_CLASS_FA = {
  LIGHT: "سبک",
  SEMI_HEAVY: "نیمه‌سنگین",
  HEAVY: "سنگین",
};

const PERFORMANCE_CLASSES = ["LIGHT", "SEMI_HEAVY", "HEAVY"];

const TRACTOR_TYPES = [
  "ROMANIAN_UNIVERSAL",
  "FERGUSON",
  "JOHN_DEERE",
  "NEW_HOLLAND",
  "CASE",
  "OTHER",
];

const COMBINE_USAGE_TYPES = ["WHEAT", "RICE", "MULTIPURPOSE"];

const CHOPPER_TYPES = ["SELF_PROPELLED", "PULL_TYPE"];

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

// ─── Shimmer skeleton ────────────────────────────────────────────────────────
const ShimmerBlock = ({ w = "100%", h = "1rem", radius = "6px" }) => (
  <span className="op-shimmer" style={{ width: w, height: h, borderRadius: radius, display: "block" }} />
);

const ShimmerInfoGrid = () => (
  <div className="op-info-panel">
    {/* avatar hero skeleton */}
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "0.65rem", padding: "1.25rem 1rem 1rem",
      background: "#161b22", border: "1px solid #21262d", borderRadius: "12px",
    }}>
      <span className="op-shimmer" style={{ width: 88, height: 88, borderRadius: "50%", display: "block" }} />
      <ShimmerBlock w="140px" h="1rem" radius="6px" />
    </div>
    {/* two section card skeletons */}
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

const InfoSection = ({ title, children }) => {
  // When title is null the card is rendered without a header (used for nested catch-alls)
  if (title === null) return <div className="op-info-grid">{children}</div>;
  return (
    <div className="op-info-section">
      <div className="op-info-section-title">{title}</div>
      <div className="op-info-grid">{children}</div>
    </div>
  );
};

// ─── Field-label map  (exact backend model fields only) ──────────────────────
const FIELD_LABELS = {
  // ── User ──────────────────────────────────────────────────────────────────
  national_code:    "کد ملی",
  name:             "نام و نام خانوادگی",
  phone:            "شماره تماس",
  father_name:      "نام پدر",
  village:          "روستا",
  birth_date:       "تاریخ تولد",
  ownership_type:   "نوع مالکیت",
  profile_image:    "تصویر پروفایل",
  address:          "آدرس",
  province:         "استان",
  city:             "شهر",
  // ── Order ─────────────────────────────────────────────────────────────────
  oid:                 "شناسه سفارش",
  user_id:             "کد ملی کاربر",
  product_id:          "شناسه محصول",
  machinery_id:        "شناسه ماشین",
  payment_method:      "روش پرداخت",
  paid:                "مبلغ پرداخت شده",
  price_at_purchase:   "قیمت در زمان خرید",
  authority:           "شناسه مرجع (درگاه)",
  ref_id:              "کد پیگیری پرداخت",
  status:              "وضعیت سفارش",
  // ── AgriculturalMachinery ─────────────────────────────────────────────────
  id:                "شناسه",
  manufacture_year:  "سال ساخت",
  model:             "مدل",
  owner_id:          "کد ملی مالک",
  chassis_number:    "شماره شاسی",
  engine_number:     "شماره موتور",
  plate_number:      "شماره پلاک",
  performance_class: "کلاس عملکرد",
  // ── Tractor ───────────────────────────────────────────────────────────────
  tractor_type: "نوع تراکتور",
  // ── Combine ───────────────────────────────────────────────────────────────
  usage_type: "نوع کاربری",
  // ── Chopper ───────────────────────────────────────────────────────────────
  chopper_type: "نوع چاپر",
  // ── Product ───────────────────────────────────────────────────────────────
  price: "قیمت",
  description: "توضیحات",
  // ── Timestamps ────────────────────────────────────────────────────────────
  createdAt: "تاریخ ثبت",
  updatedAt: "آخرین بروزرسانی",
};

// Fields whose display value needs special formatting
const MONEY_FIELDS = new Set(["paid", "price_at_purchase", "price"]);
const DATE_FIELDS  = new Set(["createdAt", "updatedAt"]);
const ENUM_FORMATTERS = {
  payment_method: (v) => PAYMENT_FA[v] || v,
  status:         (v) => ORDER_STATUS_FA[v] || v,
  tractor_type:      (v) => TRACTOR_TYPE_FA[v] || v,
  usage_type:        (v) => COMBINE_USAGE_FA[v] || v,
  chopper_type:      (v) => CHOPPER_TYPE_FA[v] || v,
  performance_class: (v) => PERFORMANCE_CLASS_FA[v] || v,
  ownership_type: (v) => ({ personal: "شخصی", professional: "تراکتورچی حرفه‌ای" }[v] || v),
};

const fmtVal = (key, val) => {
  if (val === null || val === undefined || val === "") return null;
  if (ENUM_FORMATTERS[key]) return ENUM_FORMATTERS[key](val);
  if (MONEY_FIELDS.has(key))  return `${Number(val).toLocaleString("fa-IR")} تومان`;
  if (DATE_FIELDS.has(key)) { try { return formatDate(val); } catch { return String(val); } }
  return String(val);
};

// Renders every scalar field in `data` that is not already in the `skip` set
const RemainingFields = ({ data, skip, title = "سایر اطلاعات" }) => {
  const entries = Object.entries(data).filter(([key, val]) => {
    if (skip.has(key)) return false;
    if (typeof val === "object" && val !== null) return false; // skip nested objects
    return true;
  });
  if (entries.length === 0) return null;
  return (
    <InfoSection title={title}>
      {entries.map(([key, val]) => (
        <InfoRow key={key} label={FIELD_LABELS[key] || key} value={fmtVal(key, val)} />
      ))}
    </InfoSection>
  );
};

// Renders every scalar field of a sub-object (tractor / combine / chopper)
const SubObjectFields = ({ data, skip = new Set(), title }) => {
  if (!data) return null;
  const entries = Object.entries(data).filter(([key, val]) => {
    if (skip.has(key)) return false;
    if (typeof val === "object" && val !== null) return false; // skip nested objects
    return true;
  });
  if (entries.length === 0) return null;
  return (
    <InfoSection title={title}>
      {entries.map(([key, val]) => (
        <InfoRow key={key} label={FIELD_LABELS[key] || key} value={fmtVal(key, val)} />
      ))}
    </InfoSection>
  );
};

const buildProfileUrl = (profileImage) => {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  if (profileImage.startsWith("/")) return `${BASE_URL}${profileImage}`;
  return `${BASE_URL}/${profileImage}`;
};

const birthDateInputValue = (u) =>
  u?.birth_date ? String(u.birth_date).split("T")[0] : "";

const userToDraft = (u) => ({
  national_code: u?.national_code ?? "",
  name: u?.name ?? "",
  phone: u?.phone ?? "",
  father_name: u?.father_name ?? "",
  village: u?.village ?? "",
  birth_date: birthDateInputValue(u),
  ownership_type: u?.ownership_type ?? "",
  profile_image: u?.profile_image ?? "",
  address: u?.address ?? "",
  province: u?.province ?? "",
  city: u?.city ?? "",
  password: "",
});

/** Build PATCH body: only keys that diff from baseline (backend requires ≥1 field). */
const buildUserPatch = (baseline, draft) => {
  const body = {};
  const str = (v) => (v == null ? "" : String(v)).trim();
  const keys = [
    "name",
    "phone",
    "father_name",
    "village",
    "birth_date",
    "ownership_type",
    "profile_image",
    "address",
    "province",
    "city",
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

// ─── Editable row (same grid as InfoRow, for superadmin user edit) ───────────
const InfoEditRow = ({ label, children }) => (
  <div className="op-info-row">
    <span className="op-info-label">{label}</span>
    <div className="op-info-edit-cell">{children}</div>
  </div>
);

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
          <input className="op-info-input op-info-input-readonly" value={draft.national_code} readOnly tabIndex={-1} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="نام پدر">
          <input className="op-info-input" value={draft.father_name} onChange={(e) => set("father_name", e.target.value)} dir="rtl" />
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
          <input className="op-info-input" value={draft.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" />
        </InfoEditRow>
      </InfoSection>

      <InfoSection title="آدرس و موقعیت">
        <InfoEditRow label="استان">
          <input className="op-info-input" value={draft.province} onChange={(e) => set("province", e.target.value)} dir="rtl" />
        </InfoEditRow>
        <InfoEditRow label="شهر">
          <input className="op-info-input" value={draft.city} onChange={(e) => set("city", e.target.value)} dir="rtl" />
        </InfoEditRow>
        <InfoEditRow label="روستا">
          <input className="op-info-input" value={draft.village} onChange={(e) => set("village", e.target.value)} dir="rtl" />
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

// ─── Tab content panels ───────────────────────────────────────────────────────

// User — exact fields: national_code, name, phone, father_name, village,
//        birth_date, ownership_type, profile_image, address, province, city,
//        createdAt, updatedAt
const USER_EXPLICIT = new Set([
  "national_code", "name", "phone",
  "father_name", "village", "birth_date", "ownership_type",
  "profile_image", "password",        // profile_image shown as avatar; password never shown
  "address", "province", "city",
  "createdAt", "updatedAt",
]);

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
        <InfoRow label="نوع مالکیت"         value={fmtVal("ownership_type", data.ownership_type)} />
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
        <InfoRow label="تاریخ ثبت‌نام"    value={fmtVal("createdAt", data.createdAt)} />
        <InfoRow label="آخرین بروزرسانی" value={fmtVal("updatedAt", data.updatedAt)} />
      </InfoSection>

      <RemainingFields data={data} skip={USER_EXPLICIT} />
    </div>
  );
};

// Order — exact fields: oid, user_id, product_id, machinery_id,
//         payment_method, paid, price_at_purchase, authority, ref_id,
//         status, createdAt   (NO updatedAt — model has updatedAt:false)
const ORDER_EXPLICIT = new Set([
  "oid", "user_id", "product_id", "machinery_id",
  "payment_method", "paid", "price_at_purchase",
  "authority", "ref_id", "status", "createdAt",
  "user", "product", "machinery",   // nested objects — handled separately
]);

const OrderInfoPanel = ({ data }) => {
  if (!data) return null;
  return (
    <div className="op-info-panel">
      <InfoSection title="مشخصات سفارش">
        <InfoRow label="شناسه سفارش"       value={data.oid} />
        <InfoRow label="وضعیت سفارش"       value={fmtVal("status", data.status)} />
        <InfoRow label="روش پرداخت"        value={fmtVal("payment_method", data.payment_method)} />
        <InfoRow label="مبلغ پرداخت شده"   value={fmtVal("paid", data.paid)} />
        <InfoRow label="قیمت در زمان خرید" value={fmtVal("price_at_purchase", data.price_at_purchase)} />
        <InfoRow label="تاریخ ثبت"         value={fmtVal("createdAt", data.createdAt)} />
      </InfoSection>

      <InfoSection title="اطلاعات پرداخت">
        <InfoRow label="کد پیگیری پرداخت"  value={data.ref_id} />
        <InfoRow label="شناسه مرجع (درگاه)" value={data.authority} />
        <InfoRow label="کد ملی کاربر"       value={data.user_id} />
        <InfoRow label="شناسه محصول"        value={data.product_id} />
        <InfoRow label="شناسه ماشین"        value={data.machinery_id} />
      </InfoSection>

      {data.product && (
        <InfoSection title="محصول">
          <SubObjectFields
            data={data.product}
            title={null}
            skip={new Set(["createdAt", "updatedAt"])}
          />
        </InfoSection>
      )}

      <RemainingFields data={data} skip={ORDER_EXPLICIT} />
    </div>
  );
};

const PAYMENT_METHODS = ["CASH", "INSTALLMENT"];

const orderCreatedAtLocal = (o) => {
  if (!o?.createdAt) return "";
  const d = new Date(o.createdAt);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const orderToDraft = (o) => ({
  oid: o?.oid ?? "",
  user_id: o?.user_id ?? "",
  product_id: o?.product_id != null ? String(o.product_id) : "",
  machinery_id: o?.machinery_id != null ? String(o.machinery_id) : "",
  payment_method: o?.payment_method ?? "",
  paid: o?.paid != null ? String(o.paid) : "",
  price_at_purchase: o?.price_at_purchase != null ? String(o.price_at_purchase) : "",
  authority: o?.authority ?? "",
  ref_id: o?.ref_id ?? "",
  status: o?.status ?? "",
  createdAt: orderCreatedAtLocal(o),
});

const buildOrderPatch = (baseline, draft) => {
  const body = {};
  const s = (v) => (v == null ? "" : String(v)).trim();

  if (s(draft.user_id) !== s(baseline.user_id)) body.user_id = s(draft.user_id);

  const pidOld = baseline.product_id != null ? Math.floor(Number(baseline.product_id)) : NaN;
  const pidNew = draft.product_id === "" ? NaN : Math.floor(Number(draft.product_id));
  if (Number.isFinite(pidOld) && Number.isFinite(pidNew) && pidOld !== pidNew) {
    body.product_id = pidNew;
  }

  const mOld =
    baseline.machinery_id == null || baseline.machinery_id === ""
      ? null
      : Math.floor(Number(baseline.machinery_id));
  const mOldNorm = mOld != null && Number.isFinite(mOld) && mOld > 0 ? mOld : null;
  if (draft.machinery_id === "" || draft.machinery_id == null) {
    if (mOldNorm !== null) body.machinery_id = null;
  } else {
    const mn = Math.floor(Number(draft.machinery_id));
    if (Number.isFinite(mn) && mn > 0 && mn !== mOldNorm) body.machinery_id = mn;
  }

  if (String(draft.payment_method ?? "") !== String(baseline.payment_method ?? "")) {
    body.payment_method = draft.payment_method;
  }
  if (String(draft.status ?? "") !== String(baseline.status ?? "")) {
    body.status = draft.status;
  }

  const paidOld = Math.floor(Number(baseline.paid));
  const paidNew = Math.floor(Number(draft.paid));
  if (Number.isFinite(paidOld) && Number.isFinite(paidNew) && paidOld !== paidNew) {
    body.paid = paidNew;
  }

  const prOld =
    baseline.price_at_purchase == null || baseline.price_at_purchase === ""
      ? null
      : Math.floor(Number(baseline.price_at_purchase));
  const prOldNorm = prOld != null && Number.isFinite(prOld) ? prOld : null;
  if (draft.price_at_purchase === "" || draft.price_at_purchase == null) {
    if (prOldNorm !== null) body.price_at_purchase = null;
  } else {
    const pn = Math.floor(Number(draft.price_at_purchase));
    if (Number.isFinite(pn) && pn >= 0 && pn !== prOldNorm) body.price_at_purchase = pn;
  }

  if (s(draft.authority) !== s(baseline.authority)) body.authority = s(draft.authority);
  if (s(draft.ref_id) !== s(baseline.ref_id)) body.ref_id = s(draft.ref_id);

  const tOld = baseline.createdAt ? new Date(baseline.createdAt).getTime() : null;
  let tNew;
  if (draft.createdAt === "") tNew = null;
  else {
    const d = new Date(draft.createdAt);
    tNew = Number.isNaN(d.getTime()) ? NaN : d.getTime();
  }
  if (tOld !== tNew) {
    if (draft.createdAt === "") body.createdAt = null;
    else {
      const d = new Date(draft.createdAt);
      if (!Number.isNaN(d.getTime())) body.createdAt = d.toISOString();
    }
  }

  return body;
};

const OrderInfoEditForm = ({ draft, onDraftChange, productReadonly }) => {
  const set = (key, value) => onDraftChange({ ...draft, [key]: value });
  return (
    <div className="op-info-panel">
      <InfoSection title="مشخصات سفارش">
        <InfoEditRow label="شناسه سفارش">
          <input className="op-info-input op-info-input-readonly" value={draft.oid} readOnly tabIndex={-1} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="وضعیت سفارش">
          <select className="op-info-input op-info-select" value={draft.status} onChange={(e) => set("status", e.target.value)}>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {ORDER_STATUS_FA[st]}
              </option>
            ))}
          </select>
        </InfoEditRow>
        <InfoEditRow label="روش پرداخت">
          <select
            className="op-info-input op-info-select"
            value={draft.payment_method}
            onChange={(e) => set("payment_method", e.target.value)}
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {PAYMENT_FA[pm]}
              </option>
            ))}
          </select>
        </InfoEditRow>
        <InfoEditRow label="مبلغ پرداخت شده (تومان)">
          <input className="op-info-input" type="number" min={0} value={draft.paid} onChange={(e) => set("paid", e.target.value)} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="قیمت در زمان خرید (تومان)">
          <input
            className="op-info-input"
            type="number"
            min={0}
            value={draft.price_at_purchase}
            onChange={(e) => set("price_at_purchase", e.target.value)}
            dir="ltr"
            placeholder="خالی = بدون مقدار"
          />
        </InfoEditRow>
        <InfoEditRow label="تاریخ ثبت">
          <input
            className="op-info-input"
            type="datetime-local"
            value={draft.createdAt}
            onChange={(e) => set("createdAt", e.target.value)}
            dir="ltr"
          />
        </InfoEditRow>
      </InfoSection>

      <InfoSection title="اطلاعات پرداخت">
        <InfoEditRow label="کد پیگیری پرداخت">
          <input className="op-info-input" value={draft.ref_id} onChange={(e) => set("ref_id", e.target.value)} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="شناسه مرجع (درگاه)">
          <input className="op-info-input" value={draft.authority} onChange={(e) => set("authority", e.target.value)} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="کد ملی کاربر">
          <input className="op-info-input" value={draft.user_id} onChange={(e) => set("user_id", e.target.value)} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="شناسه محصول">
          <input className="op-info-input" type="number" min={1} value={draft.product_id} onChange={(e) => set("product_id", e.target.value)} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="شناسه ماشین">
          <input
            className="op-info-input"
            type="number"
            min={1}
            value={draft.machinery_id}
            onChange={(e) => set("machinery_id", e.target.value)}
            dir="ltr"
            placeholder="خالی = بدون ماشین"
          />
        </InfoEditRow>
      </InfoSection>

      {productReadonly && (
        <InfoSection title="محصول (فقط نمایش)">
          <SubObjectFields data={productReadonly} title={null} skip={new Set(["createdAt", "updatedAt"])} />
        </InfoSection>
      )}
    </div>
  );
};

// AgriculturalMachinery — exact fields: id, manufacture_year, model, owner_id,
//   chassis_number, engine_number, plate_number, performance_class,
//   createdAt, updatedAt
// Tractor  — machinery_id, tractor_type  (no timestamps)
// Combine  — machinery_id, usage_type    (no timestamps)
// Chopper  — machinery_id, chopper_type  (no timestamps)
const MACHINE_EXPLICIT = new Set([
  "id", "manufacture_year", "model", "owner_id",
  "chassis_number", "engine_number", "plate_number", "performance_class",
  "createdAt", "updatedAt",
  "tractor", "combine", "chopper",   // nested
]);

const MachineInfoPanel = ({ data }) => {
  if (!data) return null;
  const { category, subType } = getMachineInfo(data);
  return (
    <div className="op-info-panel">
      <InfoSection title="مشخصات کلی ماشین">
        <InfoRow label="نوع ماشین"         value={category + (subType ? ` · ${subType}` : "")} />
        <InfoRow label="شناسه"             value={data.id} />
        <InfoRow label="مدل"               value={data.model} />
        <InfoRow label="سال ساخت"          value={data.manufacture_year} />
        <InfoRow label="کد ملی مالک"       value={data.owner_id} />
        <InfoRow label="کلاس عملکرد"       value={data.performance_class} />
        <InfoRow label="تاریخ ثبت"         value={fmtVal("createdAt", data.createdAt)} />
        <InfoRow label="آخرین بروزرسانی"   value={fmtVal("updatedAt", data.updatedAt)} />
      </InfoSection>

      <InfoSection title="اطلاعات شناسایی ماشین">
        <InfoRow label="شماره پلاک"  value={data.plate_number} />
        <InfoRow label="شماره شاسی"  value={data.chassis_number} />
        <InfoRow label="شماره موتور" value={data.engine_number} />
      </InfoSection>

      {/* Catch-all for any extra base-machinery fields */}
      <RemainingFields data={data} skip={MACHINE_EXPLICIT} title="سایر مشخصات" />

      {/* Tractor: machinery_id + tractor_type */}
      {data.tractor && (
        <InfoSection title="مشخصات تراکتور">
          <InfoRow label="نوع تراکتور" value={fmtVal("tractor_type", data.tractor.tractor_type)} />
          <InfoRow label="شناسه ماشین" value={data.tractor.machinery_id} />
          <RemainingFields
            data={data.tractor}
            skip={new Set(["machinery_id", "tractor_type"])}
            title={null}
          />
        </InfoSection>
      )}

      {/* Combine: machinery_id + usage_type */}
      {data.combine && (
        <InfoSection title="مشخصات کمباین">
          <InfoRow label="نوع کاربری" value={fmtVal("usage_type", data.combine.usage_type)} />
          <InfoRow label="شناسه ماشین" value={data.combine.machinery_id} />
          <RemainingFields
            data={data.combine}
            skip={new Set(["machinery_id", "usage_type"])}
            title={null}
          />
        </InfoSection>
      )}

      {/* Chopper: machinery_id + chopper_type */}
      {data.chopper && (
        <InfoSection title="مشخصات چاپر">
          <InfoRow label="نوع چاپر"   value={fmtVal("chopper_type", data.chopper.chopper_type)} />
          <InfoRow label="شناسه ماشین" value={data.chopper.machinery_id} />
          <RemainingFields
            data={data.chopper}
            skip={new Set(["machinery_id", "chopper_type"])}
            title={null}
          />
        </InfoSection>
      )}
    </div>
  );
};

const normMachinePlate = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

const machineStrTrim = (v) => (v == null ? "" : String(v)).trim();

const machineToDraft = (m) => ({
  manufacture_year: m.manufacture_year != null ? String(m.manufacture_year) : "",
  model: m.model ?? "",
  chassis_number: m.chassis_number ?? "",
  engine_number: m.engine_number ?? "",
  plate_number: m.plate_number ?? "",
  performance_class: m.performance_class ?? "",
  tractor_type: m.tractor?.tractor_type ?? "",
  usage_type: m.combine?.usage_type ?? "",
  chopper_type: m.chopper?.chopper_type ?? "",
});

const buildMachinePatch = (baseline, draft) => {
  const body = {};

  const yOldNum = Math.floor(Number(baseline.manufacture_year));
  const yNewNum =
    draft.manufacture_year === "" || draft.manufacture_year == null
      ? null
      : Math.floor(Number(draft.manufacture_year));
  const yOldOk = Number.isFinite(yOldNum);
  const yNewOk = yNewNum != null && Number.isFinite(yNewNum);
  if (yOldOk && yNewOk && yOldNum !== yNewNum) body.manufacture_year = yNewNum;
  if (!yOldOk && yNewOk) body.manufacture_year = yNewNum;

  if (machineStrTrim(draft.model) !== machineStrTrim(baseline.model)) {
    body.model = machineStrTrim(draft.model);
  }

  for (const k of ["chassis_number", "engine_number", "plate_number"]) {
    const o = normMachinePlate(baseline[k]);
    const n = normMachinePlate(draft[k]);
    if (o !== n) body[k] = n;
  }

  const pcOld =
    baseline.performance_class == null || baseline.performance_class === ""
      ? null
      : String(baseline.performance_class);
  const pcNew = draft.performance_class === "" ? null : String(draft.performance_class);
  if (pcOld !== pcNew) body.performance_class = pcNew;

  if (baseline.tractor) {
    const tOld = String(baseline.tractor.tractor_type ?? "");
    const tNew = String(draft.tractor_type ?? "");
    if (tOld !== tNew) body.tractor_type = tNew;
  }

  if (baseline.combine) {
    const uOld =
      baseline.combine.usage_type == null || baseline.combine.usage_type === ""
        ? null
        : String(baseline.combine.usage_type);
    const uNew = draft.usage_type === "" ? null : String(draft.usage_type);
    if (uOld !== uNew) body.usage_type = uNew;
  }

  if (baseline.chopper) {
    const cOld = String(baseline.chopper.chopper_type ?? "");
    const cNew = String(draft.chopper_type ?? "");
    if (cOld !== cNew) body.chopper_type = cNew;
  }

  return body;
};

const MachineInfoEditForm = ({
  draft,
  onDraftChange,
  readOnlyMeta,
  hasTractor,
  hasCombine,
  hasChopper,
}) => {
  const set = (key, value) => onDraftChange({ ...draft, [key]: value });
  return (
    <div className="op-info-panel">
      <InfoSection title="مشخصات کلی ماشین">
        <InfoEditRow label="نوع ماشین">
          <input
            className="op-info-input op-info-input-readonly"
            value={readOnlyMeta.categoryLabel}
            readOnly
            tabIndex={-1}
          />
        </InfoEditRow>
        <InfoEditRow label="شناسه">
          <input
            className="op-info-input op-info-input-readonly"
            value={readOnlyMeta.id}
            readOnly
            tabIndex={-1}
            dir="ltr"
          />
        </InfoEditRow>
        <InfoEditRow label="مدل">
          <input className="op-info-input" value={draft.model} onChange={(e) => set("model", e.target.value)} />
        </InfoEditRow>
        <InfoEditRow label="سال ساخت">
          <input
            className="op-info-input"
            type="number"
            value={draft.manufacture_year}
            onChange={(e) => set("manufacture_year", e.target.value)}
            dir="ltr"
          />
        </InfoEditRow>
        <InfoEditRow label="کد ملی مالک">
          <input
            className="op-info-input op-info-input-readonly"
            value={readOnlyMeta.owner_id ?? ""}
            readOnly
            tabIndex={-1}
            dir="ltr"
          />
        </InfoEditRow>
        <InfoEditRow label="کلاس عملکرد">
          <select
            className="op-info-input op-info-select"
            value={draft.performance_class}
            onChange={(e) => set("performance_class", e.target.value)}
          >
            <option value="">بدون مقدار</option>
            {PERFORMANCE_CLASSES.map((pc) => (
              <option key={pc} value={pc}>
                {PERFORMANCE_CLASS_FA[pc]}
              </option>
            ))}
          </select>
        </InfoEditRow>
        <InfoEditRow label="تاریخ ثبت">
          <input
            className="op-info-input op-info-input-readonly"
            value={fmtVal("createdAt", readOnlyMeta.createdAt) ?? "—"}
            readOnly
            tabIndex={-1}
            dir="ltr"
          />
        </InfoEditRow>
        <InfoEditRow label="آخرین بروزرسانی">
          <input
            className="op-info-input op-info-input-readonly"
            value={fmtVal("updatedAt", readOnlyMeta.updatedAt) ?? "—"}
            readOnly
            tabIndex={-1}
            dir="ltr"
          />
        </InfoEditRow>
      </InfoSection>

      <InfoSection title="اطلاعات شناسایی ماشین">
        <InfoEditRow label="شماره پلاک">
          <input className="op-info-input" value={draft.plate_number} onChange={(e) => set("plate_number", e.target.value)} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="شماره شاسی">
          <input className="op-info-input" value={draft.chassis_number} onChange={(e) => set("chassis_number", e.target.value)} dir="ltr" />
        </InfoEditRow>
        <InfoEditRow label="شماره موتور">
          <input className="op-info-input" value={draft.engine_number} onChange={(e) => set("engine_number", e.target.value)} dir="ltr" />
        </InfoEditRow>
      </InfoSection>

      {hasTractor && (
        <InfoSection title="مشخصات تراکتور">
          <InfoEditRow label="نوع تراکتور">
            <select
              className="op-info-input op-info-select"
              value={draft.tractor_type}
              onChange={(e) => set("tractor_type", e.target.value)}
            >
              <option value="">—</option>
              {TRACTOR_TYPES.map((tt) => (
                <option key={tt} value={tt}>
                  {TRACTOR_TYPE_FA[tt]}
                </option>
              ))}
            </select>
          </InfoEditRow>
          <InfoEditRow label="شناسه ماشین">
            <input
              className="op-info-input op-info-input-readonly"
              value={readOnlyMeta.id}
              readOnly
              tabIndex={-1}
              dir="ltr"
            />
          </InfoEditRow>
        </InfoSection>
      )}

      {hasCombine && (
        <InfoSection title="مشخصات کمباین">
          <InfoEditRow label="نوع کاربری">
            <select
              className="op-info-input op-info-select"
              value={draft.usage_type}
              onChange={(e) => set("usage_type", e.target.value)}
            >
              <option value="">بدون مقدار</option>
              {COMBINE_USAGE_TYPES.map((u) => (
                <option key={u} value={u}>
                  {COMBINE_USAGE_FA[u]}
                </option>
              ))}
            </select>
          </InfoEditRow>
          <InfoEditRow label="شناسه ماشین">
            <input
              className="op-info-input op-info-input-readonly"
              value={readOnlyMeta.id}
              readOnly
              tabIndex={-1}
              dir="ltr"
            />
          </InfoEditRow>
        </InfoSection>
      )}

      {hasChopper && (
        <InfoSection title="مشخصات چاپر">
          <InfoEditRow label="نوع چاپر">
            <select
              className="op-info-input op-info-select"
              value={draft.chopper_type}
              onChange={(e) => set("chopper_type", e.target.value)}
            >
              <option value="">—</option>
              {CHOPPER_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {CHOPPER_TYPE_FA[ct]}
                </option>
              ))}
            </select>
          </InfoEditRow>
          <InfoEditRow label="شناسه ماشین">
            <input
              className="op-info-input op-info-input-readonly"
              value={readOnlyMeta.id}
              readOnly
              tabIndex={-1}
              dir="ltr"
            />
          </InfoEditRow>
        </InfoSection>
      )}
    </div>
  );
};

// ─── Info Dialog tabs config ──────────────────────────────────────────────────
const INFO_TABS = [
  { key: "user", label: "اطلاعات کاربر", icon: "bi-person" },
  { key: "order", label: "اطلاعات سفارش", icon: "bi-receipt" },
  { key: "machine", label: "اطلاعات ماشین", icon: "bi-truck" },
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
  const {
    admin,
    getUserInfo,
    getOrderInfo,
    getMachineInfo: fetchMachineInfo,
    updateUser,
    updateOrder,
    updateMachine,
    getAllProducts,
    getUserMachinesWithoutOrder,
    createManualOrder,
  } = useDashboardStore();
  const isSuperAdmin = String(admin?.role ?? "").toLowerCase() === "superadmin";
  const { showSnackbar } = useCustomSnackbar();

  // ─── Info dialog state ──────────────────────────────────────────────────────
  const [infoOrder, setInfoOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("user");
  const [tabData, setTabData] = useState({ user: null, order: null, machine: null });
  const [tabLoading, setTabLoading] = useState({ user: false, order: false, machine: false });
  const [tabError, setTabError] = useState({ user: null, order: null, machine: null });
  const [userEditMode, setUserEditMode] = useState(false);
  const [userFormDraft, setUserFormDraft] = useState(null);
  const [userEditBaseline, setUserEditBaseline] = useState(null);
  const [userSaving, setUserSaving] = useState(false);
  const [orderEditMode, setOrderEditMode] = useState(false);
  const [orderFormDraft, setOrderFormDraft] = useState(null);
  const [orderEditBaseline, setOrderEditBaseline] = useState(null);
  const [orderSaving, setOrderSaving] = useState(false);
  const [machineEditMode, setMachineEditMode] = useState(false);
  const [machineFormDraft, setMachineFormDraft] = useState(null);
  const [machineEditBaseline, setMachineEditBaseline] = useState(null);
  const [machineSaving, setMachineSaving] = useState(false);

  // ─── Create Order modal state ───────────────────────────────────────────────
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [coUserId, setCoUserId] = useState("");
  const [coProductId, setCoProductId] = useState(null);
  const [coMachineId, setCoMachineId] = useState(null);
  const [coPaymentMethod, setCoPaymentMethod] = useState("CASH");
  const [coPaid, setCoPaid] = useState("");
  const [coProducts, setCoProducts] = useState(null);
  const [coProductsLoading, setCoProductsLoading] = useState(false);
  const [coProductsOpen, setCoProductsOpen] = useState(false);
  const [coMachines, setCoMachines] = useState(null);
  const [coMachinesLoading, setCoMachinesLoading] = useState(false);
  const [coMachinesOpen, setCoMachinesOpen] = useState(false);
  const [coSubmitting, setCoSubmitting] = useState(false);

  const openCreateOrder = () => {
    setCoUserId("");
    setCoProductId(null);
    setCoMachineId(null);
    setCoPaymentMethod("CASH");
    setCoPaid("");
    setCoProducts(null);
    setCoProductsOpen(false);
    setCoMachines(null);
    setCoMachinesOpen(false);
    setCreateOrderOpen(true);
  };

  const closeCreateOrder = () => {
    setCreateOrderOpen(false);
  };

  const handleFetchProducts = async () => {
    if (coProductsLoading) return;
    setCoProductsLoading(true);
    setCoProductsOpen(false);
    const result = await getAllProducts();
    setCoProductsLoading(false);
    if (result.success) {
      setCoProducts(result.data);
      setCoProductsOpen(true);
    } else {
      showSnackbar(result.error || "خطا در دریافت محصولات", "error");
    }
  };

  const handleFetchMachines = async () => {
    const nc = coUserId.trim();
    if (!nc) {
      showSnackbar("ابتدا کد ملی کاربر را وارد کنید.", "error");
      return;
    }
    if (coMachinesLoading) return;
    setCoMachinesLoading(true);
    setCoMachinesOpen(false);
    const result = await getUserMachinesWithoutOrder(nc);
    setCoMachinesLoading(false);
    if (result.success) {
      setCoMachines(result.data);
      setCoMachinesOpen(true);
    } else {
      showSnackbar(result.error || "خطا در دریافت ماشین‌ها", "error");
    }
  };

  const handleSubmitCreateOrder = async () => {
    if (!coUserId.trim()) { showSnackbar("کد ملی کاربر الزامی است.", "error"); return; }
    if (!coProductId) { showSnackbar("محصول را انتخاب کنید.", "error"); return; }
    if (!coMachineId) { showSnackbar("ماشین را انتخاب کنید.", "error"); return; }
    const paidNum = Number(coPaid);
    if (coPaid === "" || !Number.isFinite(paidNum) || paidNum < 0) {
      showSnackbar("مبلغ پرداخت شده نامعتبر است.", "error");
      return;
    }
    setCoSubmitting(true);
    const result = await createManualOrder({
      user_id: coUserId.trim(),
      product_id: coProductId.id,
      machinery_id: coMachineId.id,
      payment_method: coPaymentMethod,
      paid: Math.floor(paidNum),
    });
    setCoSubmitting(false);
    if (result.success) {
      showSnackbar(result.message || "سفارش دستی با موفقیت ثبت شد.", "success");
      closeCreateOrder();
      fetchAllUsersOrders({
        query,
        page,
        limit,
        payment_method: filterPaymentMethod || undefined,
        status: filterStatus || undefined,
      });
    } else {
      showSnackbar(result.error || "خطا در ثبت سفارش", "error");
    }
  };

  const fetchTabData = useCallback(async (tab, order) => {
    const nc = order?.user?.national_code;
    const oid = order?.oid;
    if (!nc) return;

    setTabLoading((prev) => ({ ...prev, [tab]: true }));
    setTabError((prev) => ({ ...prev, [tab]: null }));

    let result;
    if (tab === "user") result = await getUserInfo(nc);
    else if (tab === "order") result = await getOrderInfo(nc, oid);
    else result = await fetchMachineInfo(nc, oid);

    if (result.success) {
      setTabData((prev) => ({ ...prev, [tab]: result.data }));
    } else {
      setTabError((prev) => ({ ...prev, [tab]: result.error }));
    }
    setTabLoading((prev) => ({ ...prev, [tab]: false }));
  }, [getUserInfo, getOrderInfo, fetchMachineInfo]);

  const openInfoDialog = (order) => {
    setUserEditMode(false);
    setUserFormDraft(null);
    setUserEditBaseline(null);
    setUserSaving(false);
    setOrderEditMode(false);
    setOrderFormDraft(null);
    setOrderEditBaseline(null);
    setOrderSaving(false);
    setMachineEditMode(false);
    setMachineFormDraft(null);
    setMachineEditBaseline(null);
    setMachineSaving(false);
    setInfoOrder(order);
    setActiveTab("user");
    setTabData({ user: null, order: null, machine: null });
    setTabLoading({ user: false, order: false, machine: false });
    setTabError({ user: null, order: null, machine: null });
    fetchTabData("user", order);
  };

  const closeInfoDialog = () => {
    setUserEditMode(false);
    setUserFormDraft(null);
    setUserEditBaseline(null);
    setUserSaving(false);
    setOrderEditMode(false);
    setOrderFormDraft(null);
    setOrderEditBaseline(null);
    setOrderSaving(false);
    setMachineEditMode(false);
    setMachineFormDraft(null);
    setMachineEditBaseline(null);
    setMachineSaving(false);
    setInfoOrder(null);
  };

  const handleTabChange = (tab) => {
    if (tab !== "user") {
      setUserEditMode(false);
      setUserFormDraft(null);
      setUserEditBaseline(null);
    }
    if (tab !== "order") {
      setOrderEditMode(false);
      setOrderFormDraft(null);
      setOrderEditBaseline(null);
    }
    if (tab !== "machine") {
      setMachineEditMode(false);
      setMachineFormDraft(null);
      setMachineEditBaseline(null);
    }
    setActiveTab(tab);
    setTabData((prev) => {
      if (!prev[tab] && !tabLoading[tab]) {
        fetchTabData(tab, infoOrder);
      }
      return prev;
    });
  };

  const startUserEdit = () => {
    const u = tabData.user;
    if (!u) return;
    setUserEditBaseline({ ...u });
    setUserFormDraft(userToDraft(u));
    setUserEditMode(true);
  };

  const cancelUserEdit = () => {
    setUserEditMode(false);
    setUserFormDraft(null);
    setUserEditBaseline(null);
  };

  const saveUserEdit = async () => {
    const nc = tabData.user?.national_code;
    if (!nc || !userEditBaseline || !userFormDraft) return;
    if (!userFormDraft.name?.trim() || !userFormDraft.phone?.trim()) {
      showSnackbar("نام و شماره تماس نمی‌توانند خالی باشند.", "error");
      return;
    }
    const patch = buildUserPatch(userEditBaseline, userFormDraft);
    if (Object.keys(patch).length === 0) {
      showSnackbar("تغییری برای ذخیره وجود ندارد.", "warning");
      return;
    }
    setUserSaving(true);
    const result = await updateUser(nc, patch);
    setUserSaving(false);
    if (result.success) {
      showSnackbar(result.message || "اطلاعات کاربر به‌روزرسانی شد.", "success");
      const fresh = result.data;
      setTabData((prev) => ({ ...prev, user: fresh }));
      setUserEditMode(false);
      setUserFormDraft(null);
      setUserEditBaseline(null);
      fetchAllUsersOrders({
        query,
        page,
        limit,
        payment_method: filterPaymentMethod || undefined,
        status: filterStatus || undefined,
      });
    } else {
      showSnackbar(result.error, "error");
    }
  };

  const startOrderEdit = () => {
    const o = tabData.order;
    if (!o) return;
    setOrderEditBaseline(JSON.parse(JSON.stringify(o)));
    setOrderFormDraft(orderToDraft(o));
    setOrderEditMode(true);
  };

  const cancelOrderEdit = () => {
    setOrderEditMode(false);
    setOrderFormDraft(null);
    setOrderEditBaseline(null);
  };

  const saveOrderEdit = async () => {
    if (!orderEditBaseline || !orderFormDraft) return;
    const pathNc = orderEditBaseline.user_id;
    const oid = orderEditBaseline.oid;
    if (!pathNc || oid == null) return;

    if (!orderFormDraft.user_id?.trim()) {
      showSnackbar("کد ملی کاربر نمی‌تواند خالی باشد.", "error");
      return;
    }
    if (!orderFormDraft.authority?.trim() || !orderFormDraft.ref_id?.trim()) {
      showSnackbar("کد پیگیری و شناسه مرجع نمی‌توانند خالی باشند.", "error");
      return;
    }
    const pid = Math.floor(Number(orderFormDraft.product_id));
    if (!Number.isFinite(pid) || pid <= 0) {
      showSnackbar("شناسه محصول نامعتبر است.", "error");
      return;
    }
    const paid = Math.floor(Number(orderFormDraft.paid));
    if (!Number.isFinite(paid) || paid < 0) {
      showSnackbar("مبلغ پرداختی نامعتبر است.", "error");
      return;
    }
    if (!PAYMENT_METHODS.includes(orderFormDraft.payment_method)) {
      showSnackbar("روش پرداخت نامعتبر است.", "error");
      return;
    }
    if (!ORDER_STATUSES.includes(orderFormDraft.status)) {
      showSnackbar("وضعیت سفارش نامعتبر است.", "error");
      return;
    }
    if (orderFormDraft.machinery_id !== "" && orderFormDraft.machinery_id != null) {
      const mid = Math.floor(Number(orderFormDraft.machinery_id));
      if (!Number.isFinite(mid) || mid <= 0) {
        showSnackbar("شناسه ماشین نامعتبر است.", "error");
        return;
      }
    }
    if (orderFormDraft.price_at_purchase !== "" && orderFormDraft.price_at_purchase != null) {
      const pr = Math.floor(Number(orderFormDraft.price_at_purchase));
      if (!Number.isFinite(pr) || pr < 0) {
        showSnackbar("قیمت در زمان خرید نامعتبر است.", "error");
        return;
      }
    }
    if (orderFormDraft.createdAt !== "") {
      const d = new Date(orderFormDraft.createdAt);
      if (Number.isNaN(d.getTime())) {
        showSnackbar("تاریخ ثبت نامعتبر است.", "error");
        return;
      }
    }

    const patch = buildOrderPatch(orderEditBaseline, orderFormDraft);
    if (Object.keys(patch).length === 0) {
      showSnackbar("تغییری برای ذخیره وجود ندارد.", "warning");
      return;
    }

    setOrderSaving(true);
    const result = await updateOrder(pathNc, oid, patch);
    setOrderSaving(false);
    if (result.success) {
      showSnackbar(result.message || "سفارش با موفقیت به‌روزرسانی شد.", "success");
      const fresh = result.data;
      setTabData((prev) => ({ ...prev, order: fresh }));
      setOrderEditMode(false);
      setOrderFormDraft(null);
      setOrderEditBaseline(null);
      fetchAllUsersOrders({
        query,
        page,
        limit,
        payment_method: filterPaymentMethod || undefined,
        status: filterStatus || undefined,
      });
    } else {
      showSnackbar(result.error, "error");
    }
  };

  const startMachineEdit = () => {
    const m = tabData.machine;
    if (!m) return;
    setMachineEditBaseline(JSON.parse(JSON.stringify(m)));
    setMachineFormDraft(machineToDraft(m));
    setMachineEditMode(true);
  };

  const cancelMachineEdit = () => {
    setMachineEditMode(false);
    setMachineFormDraft(null);
    setMachineEditBaseline(null);
  };

  const saveMachineEdit = async () => {
    if (!machineEditBaseline || !machineFormDraft || !infoOrder) return;
    const pathNc = tabData.order?.user_id ?? infoOrder?.user?.national_code;
    const oid = infoOrder.oid;
    if (!pathNc || oid == null) {
      showSnackbar("کد ملی صاحب سفارش نامعتبر است.", "error");
      return;
    }

    if (!machineFormDraft.model?.trim()) {
      showSnackbar("مدل نمی‌تواند خالی باشد.", "error");
      return;
    }
    if (machineFormDraft.manufacture_year !== "" && machineFormDraft.manufacture_year != null) {
      const my = Math.floor(Number(machineFormDraft.manufacture_year));
      if (!Number.isFinite(my)) {
        showSnackbar("سال ساخت نامعتبر است.", "error");
        return;
      }
    }
    if (
      machineFormDraft.performance_class &&
      !PERFORMANCE_CLASSES.includes(machineFormDraft.performance_class)
    ) {
      showSnackbar("کلاس عملکرد نامعتبر است.", "error");
      return;
    }
    if (machineEditBaseline.tractor) {
      if (!TRACTOR_TYPES.includes(machineFormDraft.tractor_type)) {
        showSnackbar("نوع تراکتور نامعتبر است.", "error");
        return;
      }
    }
    if (machineEditBaseline.combine) {
      if (
        machineFormDraft.usage_type &&
        !COMBINE_USAGE_TYPES.includes(machineFormDraft.usage_type)
      ) {
        showSnackbar("نوع کاربری کمباین نامعتبر است.", "error");
        return;
      }
    }
    if (machineEditBaseline.chopper) {
      if (!CHOPPER_TYPES.includes(machineFormDraft.chopper_type)) {
        showSnackbar("نوع چاپر نامعتبر است.", "error");
        return;
      }
    }

    const patch = buildMachinePatch(machineEditBaseline, machineFormDraft);
    if (Object.keys(patch).length === 0) {
      showSnackbar("تغییری برای ذخیره وجود ندارد.", "warning");
      return;
    }

    setMachineSaving(true);
    const result = await updateMachine(pathNc, oid, patch);
    setMachineSaving(false);
    if (result.success) {
      showSnackbar(result.message || "اطلاعات ماشین با موفقیت به‌روزرسانی شد.", "success");
      const fresh = result.data;
      setTabData((prev) => ({ ...prev, machine: fresh }));
      setMachineEditMode(false);
      setMachineFormDraft(null);
      setMachineEditBaseline(null);
      fetchAllUsersOrders({
        query,
        page,
        limit,
        payment_method: filterPaymentMethod || undefined,
        status: filterStatus || undefined,
      });
    } else {
      showSnackbar(result.error, "error");
    }
  };

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
        <div className="op-header-row">
          <div>
            <h1>سفارش‌ها</h1>
            <p>مشاهده و مدیریت سفارش‌های کاربران</p>
          </div>
          {isSuperAdmin && (
            <button className="op-create-order-btn" onClick={openCreateOrder}>
              <i className="bi bi-plus-lg" />
              ثبت سفارش دستی
            </button>
          )}
        </div>
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

      <div className={`op-table${isSuperAdmin ? "" : " op-table-no-actions"}`}>
        <div className="op-thead">
          <span className="op-col op-col-user">کاربر</span>
          <span className="op-col op-col-machine">ماشین</span>
          <span className="op-col op-col-payment">پرداخت</span>
          <span className="op-col op-col-amount">مبلغ</span>
          <span className="op-col op-col-date">تاریخ</span>
          <span className="op-col op-col-status">وضعیت</span>
          {isSuperAdmin && <span className="op-col op-col-actions"></span>}
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
              <div
                key={order.oid}
                className="op-row op-row-clickable"
                onClick={() => openInfoDialog(order)}
              >
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
                {isSuperAdmin && (
                  <div
                    className="op-col op-col-actions"
                    data-label="عملیات"
                    ref={openMenuId === order.oid ? menuRef : null}
                    onClick={(e) => e.stopPropagation()}
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
                )}
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

      {/* ─── Order Info Dialog ─── */}
      <Modal
        isOpen={!!infoOrder}
        onClose={closeInfoDialog}
        title={infoOrder ? `سفارش #${infoOrder.oid}` : ""}
        className="modal-dark op-info-modal"
      >
        <div className="op-tabs">
          {INFO_TABS.map((t) => (
            <button
              key={t.key}
              className={`op-tab${activeTab === t.key ? " op-tab-active" : ""}`}
              onClick={() => handleTabChange(t.key)}
            >
              <i className={`bi ${t.icon}`} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="op-tab-body">
          {tabLoading[activeTab] ? (
            <ShimmerInfoGrid />
          ) : tabError[activeTab] ? (
            <div className="op-tab-error">
              <i className="bi bi-exclamation-circle" />
              {tabError[activeTab]}
              <button
                className="op-tab-retry"
                onClick={() => fetchTabData(activeTab, infoOrder)}
              >
                تلاش مجدد
              </button>
            </div>
          ) : !tabData[activeTab] ? (
            <ShimmerInfoGrid />
          ) : activeTab === "user" ? (
            userEditMode && userFormDraft ? (
              <UserInfoEditForm draft={userFormDraft} onDraftChange={setUserFormDraft} />
            ) : (
              <UserInfoPanel data={tabData.user} />
            )
          ) : activeTab === "order" ? (
            orderEditMode && orderFormDraft ? (
              <OrderInfoEditForm
                draft={orderFormDraft}
                onDraftChange={setOrderFormDraft}
                productReadonly={orderEditBaseline?.product}
              />
            ) : (
              <OrderInfoPanel data={tabData.order} />
            )
          ) : machineEditMode && machineFormDraft && machineEditBaseline ? (
            <MachineInfoEditForm
              draft={machineFormDraft}
              onDraftChange={setMachineFormDraft}
              readOnlyMeta={{
                id: machineEditBaseline.id,
                owner_id: machineEditBaseline.owner_id,
                categoryLabel: (() => {
                  const { category, subType } = getMachineInfo(machineEditBaseline);
                  return category + (subType ? ` · ${subType}` : "");
                })(),
                createdAt: machineEditBaseline.createdAt,
                updatedAt: machineEditBaseline.updatedAt,
              }}
              hasTractor={!!machineEditBaseline.tractor}
              hasCombine={!!machineEditBaseline.combine}
              hasChopper={!!machineEditBaseline.chopper}
            />
          ) : (
            <MachineInfoPanel data={tabData.machine} />
          )}
        </div>

        {isSuperAdmin &&
          activeTab === "user" &&
          tabData.user &&
          !tabLoading.user &&
          !tabError.user && (
            <div className="op-user-edit-bar">
              {userEditMode ? (
                <>
                  <button
                    type="button"
                    className="op-user-edit-btn op-user-edit-btn--secondary"
                    onClick={cancelUserEdit}
                    disabled={userSaving}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    className="op-user-edit-btn op-user-edit-btn--primary"
                    onClick={saveUserEdit}
                    disabled={userSaving}
                  >
                    {userSaving ? "در حال ذخیره…" : "ذخیره تغییرات"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="op-user-edit-btn op-user-edit-btn--primary"
                  onClick={startUserEdit}
                >
                  ویرایش کاربر
                </button>
              )}
            </div>
          )}

        {isSuperAdmin &&
          activeTab === "order" &&
          tabData.order &&
          !tabLoading.order &&
          !tabError.order && (
            <div className="op-user-edit-bar">
              {orderEditMode ? (
                <>
                  <button
                    type="button"
                    className="op-user-edit-btn op-user-edit-btn--secondary"
                    onClick={cancelOrderEdit}
                    disabled={orderSaving}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    className="op-user-edit-btn op-user-edit-btn--primary"
                    onClick={saveOrderEdit}
                    disabled={orderSaving}
                  >
                    {orderSaving ? "در حال ذخیره…" : "ذخیره تغییرات"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="op-user-edit-btn op-user-edit-btn--primary"
                  onClick={startOrderEdit}
                >
                  ویرایش سفارش
                </button>
              )}
            </div>
          )}

        {isSuperAdmin &&
          activeTab === "machine" &&
          tabData.machine &&
          !tabLoading.machine &&
          !tabError.machine && (
            <div className="op-user-edit-bar">
              {machineEditMode ? (
                <>
                  <button
                    type="button"
                    className="op-user-edit-btn op-user-edit-btn--secondary"
                    onClick={cancelMachineEdit}
                    disabled={machineSaving}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    className="op-user-edit-btn op-user-edit-btn--primary"
                    onClick={saveMachineEdit}
                    disabled={machineSaving}
                  >
                    {machineSaving ? "در حال ذخیره…" : "ذخیره تغییرات"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="op-user-edit-btn op-user-edit-btn--primary"
                  onClick={startMachineEdit}
                >
                  ویرایش ماشین
                </button>
              )}
            </div>
          )}
      </Modal>

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

      {/* ─── Create Manual Order Modal ─── */}
      <Modal
        isOpen={createOrderOpen}
        onClose={closeCreateOrder}
        title="ثبت سفارش دستی"
        className="modal-dark op-co-modal"
      >
        <div className="op-co-form" dir="rtl">

          {/* User ID */}
          <div className="op-co-field">
            <label className="op-co-label">کد ملی کاربر</label>
            <input
              className="op-co-input"
              type="text"
              dir="ltr"
              placeholder="کد ملی ۱۰ رقمی"
              value={coUserId}
              onChange={(e) => {
                setCoUserId(e.target.value);
                setCoMachines(null);
                setCoMachineId(null);
                setCoMachinesOpen(false);
              }}
            />
          </div>

          {/* Product picker */}
          <div className="op-co-field">
            <label className="op-co-label">محصول</label>
            <div className="op-co-picker-wrap">
              <div
                className={`op-co-picker-trigger${coProductId ? " op-co-picker-trigger--selected" : ""}`}
                onClick={() => {
                  if (coProductsOpen) { setCoProductsOpen(false); }
                  else { handleFetchProducts(); }
                }}
              >
                <span className="op-co-picker-text">
                  {coProductId
                    ? `${coProductId.name} — ${Number(coProductId.price).toLocaleString("fa-IR")} تومان`
                    : "انتخاب محصول..."}
                </span>
                {coProductsLoading
                  ? <span className="op-co-spinner" />
                  : <i className="bi bi-search op-co-picker-icon" />}
              </div>
              {coProductsOpen && coProducts && (
                <div className="op-co-dropdown">
                  {coProducts.length === 0 ? (
                    <div className="op-co-dropdown-empty">محصولی یافت نشد.</div>
                  ) : (
                    coProducts.map((p) => (
                      <div
                        key={p.id}
                        className={`op-co-dropdown-item${coProductId?.id === p.id ? " op-co-dropdown-item--active" : ""}`}
                        onClick={() => {
                          setCoProductId(p);
                          setCoProductsOpen(false);
                        }}
                      >
                        <span className="op-co-di-name">{p.name}</span>
                        <span className="op-co-di-sub">{Number(p.price).toLocaleString("fa-IR")} تومان</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Price at purchase (auto-filled, read-only) */}
          {coProductId && (
            <div className="op-co-field">
              <label className="op-co-label">قیمت در زمان خرید</label>
              <input
                className="op-co-input op-co-input--readonly"
                value={`${Number(coProductId.price).toLocaleString("fa-IR")} تومان`}
                readOnly
                tabIndex={-1}
                dir="ltr"
              />
            </div>
          )}

          {/* Machine picker */}
          <div className="op-co-field">
            <label className="op-co-label">ماشین (بدون سفارش فعال)</label>
            <div className="op-co-picker-wrap">
              <div
                className={`op-co-picker-trigger${coMachineId ? " op-co-picker-trigger--selected" : ""}`}
                onClick={() => {
                  if (coMachinesOpen) { setCoMachinesOpen(false); }
                  else { handleFetchMachines(); }
                }}
              >
                <span className="op-co-picker-text">
                  {coMachineId
                    ? (() => {
                        const { category, subType } = getMachineInfo(coMachineId);
                        return `${coMachineId.model || "—"} · ${category}${subType ? ` · ${subType}` : ""}`;
                      })()
                    : "انتخاب ماشین..."}
                </span>
                {coMachinesLoading
                  ? <span className="op-co-spinner" />
                  : <i className="bi bi-search op-co-picker-icon" />}
              </div>
              {coMachinesOpen && coMachines && (
                <div className="op-co-dropdown">
                  {coMachines.length === 0 ? (
                    <div className="op-co-dropdown-empty">ماشینی بدون سفارش فعال یافت نشد.</div>
                  ) : (
                    coMachines.map((m) => {
                      const { category, subType } = getMachineInfo(m);
                      return (
                        <div
                          key={m.id}
                          className={`op-co-dropdown-item${coMachineId?.id === m.id ? " op-co-dropdown-item--active" : ""}`}
                          onClick={() => {
                            setCoMachineId(m);
                            setCoMachinesOpen(false);
                          }}
                        >
                          <span className="op-co-di-name">{m.model || `ماشین #${m.id}`}</span>
                          <span className="op-co-di-sub">
                            {category}{subType ? ` · ${subType}` : ""}
                            {m.manufacture_year ? ` · ${m.manufacture_year}` : ""}
                            {" · شناسه: "}{m.id}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment method */}
          <div className="op-co-field">
            <label className="op-co-label">روش پرداخت</label>
            <select
              className="op-co-select"
              value={coPaymentMethod}
              onChange={(e) => setCoPaymentMethod(e.target.value)}
            >
              <option value="CASH">نقدی</option>
              <option value="INSTALLMENT">اقساطی</option>
            </select>
          </div>

          {/* Paid amount */}
          <div className="op-co-field">
            <label className="op-co-label">مبلغ پرداخت شده (تومان)</label>
            <input
              className="op-co-input"
              type="number"
              min="0"
              dir="ltr"
              placeholder="0"
              value={coPaid}
              onChange={(e) => setCoPaid(e.target.value)}
            />
          </div>

          <div className="op-co-actions">
            <button
              type="button"
              className="op-user-edit-btn op-user-edit-btn--secondary"
              onClick={closeCreateOrder}
              disabled={coSubmitting}
            >
              انصراف
            </button>
            <button
              type="button"
              className="op-user-edit-btn op-user-edit-btn--primary"
              onClick={handleSubmitCreateOrder}
              disabled={coSubmitting}
            >
              {coSubmitting ? "در حال ثبت…" : "ثبت سفارش"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserOrders;
