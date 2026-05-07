import React, { useEffect, useRef, useState } from "react";
import useDashboardStore from "../stores/dashboardStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import Modal from "../modals/Modal";
import ConfirmModal from "../modals/ConfirmModal";
import "./AdminsPage.css";

const ROLE_OPTIONS = [
  { value: "superadmin", label: "سوپرادمین" },
  { value: "admin", label: "ادمین" },
  { value: "employee", label: "کارمند" },
];

const ROLE_LABELS = {
  superadmin: "سوپرادمین",
  admin: "ادمین",
  employee: "کارمند",
};

const ROLE_BADGE_CLASS = {
  superadmin: "op-badge op-badge-dot op-badge-blue",
  admin: "op-badge op-badge-dot op-badge-green",
  employee: "op-badge op-badge-dot op-badge-amber",
};

const EMPTY_ADD_FORM = {
  national_code: "",
  name: "",
  password: "",
  role: "employee",
};

export default function AdminsPage() {
  const { getAllAdmins, addAdmin, changeRole, deleteAdmin, isLoading } =
    useDashboardStore();
  const { showSnackbar } = useCustomSnackbar();

  const [admins, setAdmins] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [fetching, setFetching] = useState(true);

  // Row action menu
  const [openMenuNc, setOpenMenuNc] = useState(null);
  const menuRefs = useRef({});

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Change role modal
  const [roleTarget, setRoleTarget] = useState(null); // { national_code, name, current_role }
  const [selectedRole, setSelectedRole] = useState("");
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null); // { national_code, name }

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadAdmins();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      const openRef = menuRefs.current[openMenuNc];
      if (openRef && !openRef.contains(e.target)) setOpenMenuNc(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuNc]);

  const loadAdmins = async () => {
    setFetching(true);
    setFetchError(null);
    const result = await getAllAdmins();
    if (result.success) {
      setAdmins(result.data || []);
    } else {
      setFetchError(result.error || "خطا در بارگذاری ادمین‌ها");
    }
    setFetching(false);
  };

  // ── Add admin ───────────────────────────────────────────────────────────────
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (
      !addForm.national_code.trim() ||
      !addForm.name.trim() ||
      !addForm.password.trim()
    ) {
      showSnackbar("لطفاً تمام فیلدها را پر کنید", "warning");
      return;
    }
    setAddSubmitting(true);
    const result = await addAdmin(addForm);
    setAddSubmitting(false);
    if (result.success) {
      showSnackbar("ادمین با موفقیت اضافه شد", "success");
      setAddOpen(false);
      setAddForm(EMPTY_ADD_FORM);
      loadAdmins();
    } else {
      showSnackbar(result.error || "خطا در افزودن ادمین", "error");
    }
  };

  // ── Change role ─────────────────────────────────────────────────────────────
  const openChangeRole = (admin) => {
    setRoleTarget(admin);
    setSelectedRole(admin.role);
    setOpenMenuNc(null);
  };

  const handleRoleSubmit = async () => {
    if (!roleTarget || !selectedRole) return;
    setRoleSubmitting(true);
    const result = await changeRole(roleTarget.national_code, selectedRole);
    setRoleSubmitting(false);
    if (result.success) {
      showSnackbar("سطح دسترسی با موفقیت تغییر یافت", "success");
      setRoleTarget(null);
      loadAdmins();
    } else {
      showSnackbar(result.error || "خطا در تغییر سطح دسترسی", "error");
    }
  };

  // ── Delete admin ────────────────────────────────────────────────────────────
  const openDelete = (admin) => {
    setDeleteTarget(admin);
    setOpenMenuNc(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await deleteAdmin(deleteTarget.national_code);
    if (result.success) {
      showSnackbar("ادمین با موفقیت حذف شد", "success");
      setDeleteTarget(null);
      loadAdmins();
    } else {
      showSnackbar(result.error || "خطا در حذف ادمین", "error");
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalSuperadmins = admins.filter((a) => a.role === "superadmin").length;
  const totalAdmins = admins.filter((a) => a.role === "admin").length;
  const totalEmployees = admins.filter((a) => a.role === "employee").length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="admins-page" dir="rtl">
      {/* Header */}
      <div className="ap-header">
        <div className="ap-header-text">
          <h1>مدیریت ادمین‌ها</h1>
          <p>مشاهده، افزودن و مدیریت سطوح دسترسی مدیران سیستم</p>
        </div>
        <button className="ap-add-btn" onClick={() => setAddOpen(true)}>
          <i className="bi bi-plus-lg" />
          افزودن ادمین
        </button>
      </div>

      {/* Stats */}
      <div className="ap-stats">
        <div className="ap-stat-card">
          <div className="ap-stat-icon purple">
            <i className="bi bi-shield-check" />
          </div>
          <div>
            <div className="ap-stat-label">سوپرادمین‌ها</div>
            <div className="ap-stat-value">{totalSuperadmins}</div>
          </div>
        </div>
        <div className="ap-stat-card">
          <div className="ap-stat-icon blue">
            <i className="bi bi-person-badge" />
          </div>
          <div>
            <div className="ap-stat-label">ادمین‌ها</div>
            <div className="ap-stat-value">{totalAdmins}</div>
          </div>
        </div>
        <div className="ap-stat-card">
          <div className="ap-stat-icon green">
            <i className="bi bi-people" />
          </div>
          <div>
            <div className="ap-stat-label">کارمندان</div>
            <div className="ap-stat-value">{totalEmployees}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ap-table">
        {/* Head */}
        <div className="ap-thead">
          <div>#</div>
          <div>نام</div>
          <div>کد ملی</div>
          <div>سطح دسترسی</div>
          <div />
        </div>

        {/* Body */}
        {fetching ? (
          <div className="ap-state-msg">
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
            در حال بارگذاری...
          </div>
        ) : fetchError ? (
          <div className="ap-state-msg ap-error-msg">
            <i className="bi bi-exclamation-circle" />
            {fetchError}
          </div>
        ) : admins.length === 0 ? (
          <div className="ap-state-msg">
            <i className="bi bi-inbox" />
            هیچ ادمینی یافت نشد
          </div>
        ) : (
          admins.map((admin, index) => (
            <div key={admin.national_code} className="ap-row">
              {/* # */}
              <div className="ap-col-num">{index + 1}</div>

              {/* Name */}
              <div className="ap-col-name">
                <div className="ap-avatar">
                  <i className="bi bi-person" />
                </div>
                <div className="ap-name-text">
                  <span className="ap-name-main">
                    {admin.name || "—"}
                  </span>
                </div>
              </div>

              {/* National code */}
              <div className="ap-col-nc">{admin.national_code}</div>

              {/* Role badge */}
              <div className="ap-col-role">
                <span
                  className={
                    ROLE_BADGE_CLASS[admin.role] ||
                    "op-badge op-badge-dot op-badge-amber"
                  }
                >
                  {ROLE_LABELS[admin.role] || admin.role}
                </span>
              </div>

              {/* Actions */}
              <div className="ap-col-actions">
                <div
                  className="ap-row-menu-wrap"
                  ref={(el) => (menuRefs.current[admin.national_code] = el)}
                >
                  <button
                    className="ap-row-menu-btn"
                    onClick={() =>
                      setOpenMenuNc(
                        openMenuNc === admin.national_code
                          ? null
                          : admin.national_code
                      )
                    }
                    aria-label="گزینه‌ها"
                  >
                    <i className="bi bi-three-dots-vertical" />
                  </button>
                  {openMenuNc === admin.national_code && (
                    <div className="ap-row-dropdown">
                      <button onClick={() => openChangeRole(admin)}>
                        <i className="bi bi-arrow-repeat" />
                        تغییر سطح دسترسی
                      </button>
                      <button
                        className="ap-action-danger"
                        onClick={() => openDelete(admin)}
                      >
                        <i className="bi bi-trash" />
                        حذف ادمین
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add Admin Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAddForm(EMPTY_ADD_FORM);
        }}
        title="افزودن ادمین جدید"
        className="modal-dark"
      >
        <form className="ap-form" onSubmit={handleAddSubmit}>
          <div className="ap-form-group">
            <label className="ap-form-label">نام و نام خانوادگی</label>
            <input
              className="ap-form-input"
              name="name"
              value={addForm.name}
              onChange={handleAddChange}
              placeholder="نام و نام خانوادگی"
              autoComplete="off"
            />
          </div>
          <div className="ap-form-group">
            <label className="ap-form-label">کد ملی</label>
            <input
              className="ap-form-input"
              name="national_code"
              value={addForm.national_code}
              onChange={handleAddChange}
              placeholder="۱۰ رقمی"
              maxLength={10}
              autoComplete="off"
              style={{ direction: "ltr" }}
            />
          </div>
          <div className="ap-form-group">
            <label className="ap-form-label">رمز عبور</label>
            <input
              className="ap-form-input"
              name="password"
              type="password"
              value={addForm.password}
              onChange={handleAddChange}
              placeholder="رمز عبور"
              autoComplete="new-password"
            />
          </div>
          <div className="ap-form-group">
            <label className="ap-form-label">سطح دسترسی</label>
            <select
              className="ap-form-select"
              name="role"
              value={addForm.role}
              onChange={handleAddChange}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ap-form-actions">
            <button
              type="button"
              className="ap-btn-cancel"
              onClick={() => {
                setAddOpen(false);
                setAddForm(EMPTY_ADD_FORM);
              }}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="ap-btn-confirm"
              disabled={addSubmitting}
            >
              {addSubmitting ? "در حال افزودن..." : "افزودن"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Change Role Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!roleTarget}
        onClose={() => setRoleTarget(null)}
        title="تغییر سطح دسترسی"
        className="modal-dark"
      >
        {roleTarget && (
          <div className="ap-form">
            <p className="op-status-modal-hint">
              تغییر سطح دسترسی برای{" "}
              <strong>{roleTarget.name || roleTarget.national_code}</strong>
            </p>
            <div className="ap-form-group">
              <label className="ap-form-label">سطح دسترسی جدید</label>
              <select
                className="ap-form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="ap-form-actions">
              <button
                className="ap-btn-cancel"
                onClick={() => setRoleTarget(null)}
              >
                انصراف
              </button>
              <button
                className="ap-btn-confirm"
                onClick={handleRoleSubmit}
                disabled={roleSubmitting || selectedRole === roleTarget.role}
              >
                {roleSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm Modal ────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="حذف ادمین"
        className="modal-dark"
        message={
          deleteTarget
            ? `آیا مطمئن هستید که می‌خواهید "${
                deleteTarget.name || deleteTarget.national_code
              }" را حذف کنید؟ این عمل قابل بازگشت نیست.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
