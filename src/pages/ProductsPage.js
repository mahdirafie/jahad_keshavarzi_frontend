import React, { useEffect, useState } from "react";
import useDashboardStore from "../stores/dashboardStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import Modal from "../modals/Modal";
import "./ProductsPage.css";

const EMPTY_FORM = { name: "", price: "" };

export default function ProductsPage() {
  const { getAllProducts, addProduct, updateProduct } = useDashboardStore();
  const { showSnackbar } = useCustomSnackbar();

  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null); // full product object
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Search
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setFetching(true);
    setFetchError(null);
    const result = await getAllProducts();
    if (result.success) {
      setProducts(result.data || []);
    } else {
      setFetchError(result.error || "خطا در بارگذاری محصولات");
    }
    setFetching(false);
  };

  // ── Add ─────────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      showSnackbar("نام محصول الزامی است.", "error");
      return;
    }
    const priceNum = Number(addForm.price);
    if (addForm.price === "" || !Number.isFinite(priceNum) || priceNum < 0) {
      showSnackbar("قیمت نامعتبر است.", "error");
      return;
    }
    setAddSubmitting(true);
    const result = await addProduct({
      name: addForm.name.trim(),
      price: Math.floor(priceNum),
    });
    setAddSubmitting(false);
    if (result.success) {
      showSnackbar(result.message || "محصول با موفقیت اضافه شد.", "success");
      setAddOpen(false);
      setAddForm(EMPTY_FORM);
      loadProducts();
    } else {
      showSnackbar(result.error || "خطا در افزودن محصول", "error");
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const openEdit = (product) => {
    setEditTarget(product);
    setEditForm({ name: product.name ?? "", price: String(product.price ?? "") });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.name.trim()) {
      showSnackbar("نام محصول الزامی است.", "error");
      return;
    }
    const priceNum = Number(editForm.price);
    if (editForm.price === "" || !Number.isFinite(priceNum) || priceNum < 0) {
      showSnackbar("قیمت نامعتبر است.", "error");
      return;
    }

    const patch = {};
    if (editForm.name.trim() !== (editTarget.name ?? "")) patch.name = editForm.name.trim();
    if (Math.floor(priceNum) !== Number(editTarget.price)) patch.price = Math.floor(priceNum);

    if (Object.keys(patch).length === 0) {
      showSnackbar("تغییری برای ذخیره وجود ندارد.", "warning");
      return;
    }

    setEditSubmitting(true);
    const result = await updateProduct(editTarget.id, patch);
    setEditSubmitting(false);
    if (result.success) {
      showSnackbar(result.message || "محصول با موفقیت به‌روزرسانی شد.", "success");
      setEditTarget(null);
      loadProducts();
    } else {
      showSnackbar(result.error || "خطا در به‌روزرسانی محصول", "error");
    }
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = products.filter((p) =>
    !searchText.trim() ||
    p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    String(p.id).includes(searchText.trim())
  );

  return (
    <div className="products-page" dir="rtl">
      {/* Header */}
      <div className="pp-header">
        <div className="pp-header-text">
          <h1>محصولات</h1>
          <p>مشاهده، افزودن و ویرایش محصولات سیستم</p>
        </div>
        <button className="pp-add-btn" onClick={openAdd}>
          <i className="bi bi-plus-lg" />
          افزودن محصول
        </button>
      </div>

      {/* Stats */}
      <div className="pp-stats">
        <div className="pp-stat-card">
          <div className="pp-stat-icon green">
            <i className="bi bi-box-seam" />
          </div>
          <div>
            <div className="pp-stat-label">کل محصولات</div>
            <div className="pp-stat-value">{products.length}</div>
          </div>
        </div>
        {products.length > 0 && (
          <div className="pp-stat-card">
            <div className="pp-stat-icon blue">
              <i className="bi bi-currency-exchange" />
            </div>
            <div>
              <div className="pp-stat-label">میانگین قیمت</div>
              <div className="pp-stat-value">
                {Math.round(
                  products.reduce((s, p) => s + Number(p.price || 0), 0) / products.length
                ).toLocaleString("fa-IR")}{" "}
                <span className="pp-stat-unit">تومان</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search / toolbar */}
      <div className="pp-toolbar">
        <div className="pp-search">
          <i className="bi bi-search" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا شناسه..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {!fetching && !fetchError && (
          <span className="pp-count">{filtered.length} محصول</span>
        )}
      </div>

      {/* Table */}
      <div className="pp-table">
        <div className="pp-thead">
          <div className="pp-col pp-col-id">#</div>
          <div className="pp-col pp-col-name">نام محصول</div>
          <div className="pp-col pp-col-price">قیمت</div>
          <div className="pp-col pp-col-date">تاریخ ثبت</div>
          <div className="pp-col pp-col-actions" />
        </div>

        {fetching ? (
          <div className="pp-state-msg">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            در حال بارگذاری...
          </div>
        ) : fetchError ? (
          <div className="pp-state-msg pp-error-msg">
            <i className="bi bi-exclamation-circle" />
            {fetchError}
            <button className="pp-retry-btn" onClick={loadProducts}>تلاش مجدد</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pp-state-msg">
            <i className="bi bi-inbox" />
            {searchText ? "نتیجه‌ای یافت نشد." : "هیچ محصولی ثبت نشده است."}
          </div>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="pp-row pp-row-clickable"
              onClick={() => openEdit(product)}
            >
              <div className="pp-col pp-col-id" data-label="#">{product.id}</div>
              <div className="pp-col pp-col-name" data-label="نام">
                <div className="pp-product-icon">
                  <i className="bi bi-box" />
                </div>
                <span className="pp-product-name">{product.name}</span>
              </div>
              <div className="pp-col pp-col-price" data-label="قیمت">
                <span className="pp-price-value">
                  {Number(product.price).toLocaleString("fa-IR")}
                </span>
                <span className="pp-price-unit">تومان</span>
              </div>
              <div className="pp-col pp-col-date" data-label="تاریخ ثبت">
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString("fa-IR")
                  : "—"}
              </div>
              <div className="pp-col pp-col-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="pp-edit-btn"
                  onClick={() => openEdit(product)}
                  title="ویرایش"
                >
                  <i className="bi bi-pencil" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add Product Modal ── */}
      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setAddForm(EMPTY_FORM); }}
        title="افزودن محصول جدید"
        className="modal-dark"
      >
        <form className="pp-form" onSubmit={handleAddSubmit}>
          <div className="pp-form-group">
            <label className="pp-form-label">نام محصول</label>
            <input
              className="pp-form-input"
              value={addForm.name}
              onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="نام محصول را وارد کنید"
              autoComplete="off"
              dir="rtl"
            />
          </div>
          <div className="pp-form-group">
            <label className="pp-form-label">قیمت (تومان)</label>
            <input
              className="pp-form-input"
              type="number"
              min="0"
              value={addForm.price}
              onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="0"
              dir="ltr"
            />
          </div>
          <div className="pp-form-actions">
            <button
              type="button"
              className="pp-btn-cancel"
              onClick={() => { setAddOpen(false); setAddForm(EMPTY_FORM); }}
              disabled={addSubmitting}
            >
              انصراف
            </button>
            <button type="submit" className="pp-btn-confirm" disabled={addSubmitting}>
              {addSubmitting ? "در حال افزودن..." : "افزودن"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Product Modal ── */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `ویرایش محصول #${editTarget.id}` : ""}
        className="modal-dark"
      >
        {editTarget && (
          <form className="pp-form" onSubmit={handleEditSubmit}>
            <div className="pp-form-group">
              <label className="pp-form-label">شناسه محصول</label>
              <input
                className="pp-form-input pp-form-input--readonly"
                value={editTarget.id}
                readOnly
                tabIndex={-1}
                dir="ltr"
              />
            </div>
            <div className="pp-form-group">
              <label className="pp-form-label">نام محصول</label>
              <input
                className="pp-form-input"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="نام محصول"
                autoComplete="off"
                dir="rtl"
              />
            </div>
            <div className="pp-form-group">
              <label className="pp-form-label">قیمت (تومان)</label>
              <input
                className="pp-form-input"
                type="number"
                min="0"
                value={editForm.price}
                onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="0"
                dir="ltr"
              />
            </div>
            {editTarget.createdAt && (
              <div className="pp-form-group">
                <label className="pp-form-label">تاریخ ثبت</label>
                <input
                  className="pp-form-input pp-form-input--readonly"
                  value={new Date(editTarget.createdAt).toLocaleDateString("fa-IR")}
                  readOnly
                  tabIndex={-1}
                />
              </div>
            )}
            <div className="pp-form-actions">
              <button
                type="button"
                className="pp-btn-cancel"
                onClick={() => setEditTarget(null)}
                disabled={editSubmitting}
              >
                انصراف
              </button>
              <button type="submit" className="pp-btn-confirm" disabled={editSubmitting}>
                {editSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
