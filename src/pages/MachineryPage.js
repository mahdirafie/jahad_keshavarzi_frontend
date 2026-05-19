import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useMachineryStore from "../stores/machineryStore";
import useAuthStore from "../stores/authStore";
import usePaymentStore from "../stores/paymentStore";
import useReservationStore from "../stores/reservationStore";
import ConfirmModal from "../modals/ConfirmModal";
import useCustomSnackbar from "../hooks/useSnackBar";
import moment from "moment-jalaali";
import "./MachineryPage.css";
import { formatPriceWithCurrency } from "../utils/PriceFormat";
import Header from "../components/Header";
import Footer from "../components/Footer";
import apiClient from "../common/apiClient";

// ---------- Persian translations for enums ----------
const tractorTypeLabels = {
  ROMANIAN_UNIVERSAL: "رومانی یونیورسال",
  FERGUSON: "فرگوسن",
  JOHN_DEERE: "جان دیر",
  NEW_HOLLAND: "نیوهلند",
  CASE: "کیس",
  OTHER: "سایر",
};

const combineUsageLabels = {
  WHEAT: "گندم",
  RICE: "برنج",
  MULTIPURPOSE: "چندمنظوره",
};

const chopperTypeLabels = {
  SELF_PROPELLED: "خودکششی",
  PULL_TYPE: "دنباله‌بند",
};
// ----------------------------------------------------

const MachineryPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useCustomSnackbar();

  // Stores
  const {
    machines,
    product,
    isLoading,
    error,
    fetchMachines,
    createMachine,
    deleteMachine,
  } = useMachineryStore();
  const { user, checkProfileCompletion } = useAuthStore();
  const { requestPayment, isLoading: isPaymentLoading } = usePaymentStore();
  const { createReservation, isLoading: isReservationLoading } =
    useReservationStore();

  // ---------- UI states ----------
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedMachineType, setSelectedMachineType] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({
    manufacture_year: "",
    model: "",
    tractor_type: "",
    usage_type: "",
    chopper_type: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const observerRef = useRef(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isOrdering, setIsOrdering] = useState(false);

  // ---------- Effects ----------
  useEffect(() => {
    const init = async () => {
      const result = await checkProfileCompletion();
      if (!result.is_complete) {
        showSnackbar("پروفایل شما ناقص است. در حال انتقال به صفحه تکمیل پروفایل...", "warning");
        setTimeout(() => navigate("/complete-profile"), 3000);
        return;
      }
      fetchMachines();
    };
    init();
    setupIntersectionObserver();
    return () => observerRef.current?.disconnect();
  }, []);

  const setupIntersectionObserver = () => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(
              (prev) => new Set([...prev, entry.target.dataset.id])
            );
          }
        });
      },
      { threshold: 0.1 }
    );
  };

  // ---------- Helper functions ----------
  const toPersianDigits = (num) => {
    if (!num && num !== 0) return "";
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (d) => persianDigits[d]);
  };

  const formatPersianDate = (dateString) => {
    if (!dateString) return "---";
    try {
      return moment(dateString).format("jYYYY/jMM/jDD");
    } catch {
      return "---";
    }
  };

  const getMachineTypeLabel = (machine) => {
    if (machine.tractor) return "تراکتور";
    if (machine.combine) return "کمباین";
    if (machine.chopper) return "چاپر";
    return "نامشخص";
  };

  const getTypeSpecificValue = (machine) => {
    if (machine.tractor) {
      return (
        tractorTypeLabels[machine.tractor.tractor_type] ||
        machine.tractor.tractor_type
      );
    }
    if (machine.combine) {
      return (
        combineUsageLabels[machine.combine.usage_type] ||
        machine.combine.usage_type
      );
    }
    if (machine.chopper) {
      return (
        chopperTypeLabels[machine.chopper.chopper_type] ||
        machine.chopper.chopper_type
      );
    }
    return "—";
  };

  // ---------- Form handling ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.manufacture_year?.trim()) {
      errors.manufacture_year = "سال تولید الزامی است";
    } else if (!/^\d{4}$/.test(formData.manufacture_year)) {
      errors.manufacture_year = "سال تولید باید ۴ رقم باشد";
    } else {
      const year = parseInt(formData.manufacture_year);
      const currentJalaaliYear = moment().jYear();
      if (year < 1300 || year > currentJalaaliYear + 1) {
        errors.manufacture_year = `سال تولید باید بین ۱۳۰۰ تا ${toPersianDigits(
          currentJalaaliYear + 1
        )} باشد`;
      }
    }

    if (!formData.model?.trim()) {
      errors.model = "مدل الزامی است";
    }

    if (selectedMachineType === "tractor" && !formData.tractor_type) {
      errors.tractor_type = "نوع تراکتور الزامی است";
    }
    if (selectedMachineType === "combine" && !formData.usage_type) {
      errors.usage_type = "نوع استفاده الزامی است";
    }
    if (selectedMachineType === "chopper" && !formData.chopper_type) {
      errors.chopper_type = "نوع چاپر الزامی است";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---------- Modal flows ----------
  const handleAddMachineClick = () => {
    setShowTypeModal(true);
  };

  const handleTypeConfirm = () => {
    if (!selectedMachineType) {
      showSnackbar("لطفاً نوع ماشین را انتخاب کنید", "error");
      return;
    }
    setShowTypeModal(false);
    setFormData({
      manufacture_year: "",
      model: "",
      tractor_type: "",
      usage_type: "",
      chopper_type: "",
    });
    setFormErrors({});
    setShowDetailModal(true);
  };

  const handleCreateMachine = async () => {
    if (!validateForm()) {
      showSnackbar("لطفاً فیلدهای ضروری را پر کنید", "error");
      return;
    }

    const result = await createMachine(selectedMachineType, formData);
    if (result.success) {
      showSnackbar("ماشین با موفقیت اضافه شد", "success");
      setShowDetailModal(false);
    } else {
      showSnackbar(result.error, "error");
    }
  };

  // ---------- Delete ----------
  const handleDeleteClick = (machine) => {
    setMachineToDelete(machine);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (machineToDelete) {
      const result = await deleteMachine(machineToDelete.id);
      if (result.success) {
        showSnackbar("ماشین با موفقیت حذف شد", "success");
      } else {
        showSnackbar(result.error, "error");
      }
    }
    setShowDeleteModal(false);
    setMachineToDelete(null);
  };

  // ---------- Price calculations ----------
  const totalPrice = machines.length * (product?.price || 0);
  const installmentPrice = totalPrice / 2;

  // ---------- Order submission (new flow) ----------
  const handleOrderSubmit = async () => {
    if (!product) {
      showSnackbar("اطلاعات محصول یافت نشد", "error");
      return;
    }
    if (machines.length === 0) {
      showSnackbar("هیچ ماشینی برای سفارش وجود ندارد", "error");
      return;
    }

    // Check if selling is currently open before proceeding
    try {
      const { data } = await apiClient.get("/config/sell");
      if (!data?.sell_open) {
        showSnackbar("ثبت سفارش موقتا بسته شده است. لطفاً بعداً تلاش کنید.", "error");
        return;
      }
    } catch {
      showSnackbar("خطا در بررسی وضعیت فروش. لطفاً دوباره تلاش کنید.", "error");
      return;
    }

    setIsOrdering(true);

    try {
      // Step 1: Request payment from Zarinpal to get authority
      const amountToPay =
        paymentMethod === "INSTALLMENT" ? installmentPrice : totalPrice;
      const paymentResult = await requestPayment({
        amount: amountToPay,
        description: `خرید محصول ${product.name} (${machines.length} دستگاه)`,
      });

      if (!paymentResult.success) {
        showSnackbar(
          paymentResult.error || "خطا در اتصال به درگاه پرداخت",
          "error"
        );
        setIsOrdering(false);
        return;
      }

      const authority = paymentResult.authority;

      // Step 2: Create a reservation for every machine with the same authority
      const reservationPromises = machines.map((machine) =>
        createReservation(product.id, machine.id, paymentMethod, authority)
      );

      const results = await Promise.allSettled(reservationPromises);

      // Check for failures
      const failed = results.filter(
        (r) => r.status === "rejected" || (r.value && !r.value.success)
      );
      if (failed.length > 0) {
        const firstError =
          failed[0].value?.error ||
          failed[0].reason?.message ||
          "خطا در ایجاد رزرو";
        showSnackbar(
          `ایجاد رزرو برای ${failed.length} ماشین با مشکل مواجه شد: ${firstError}`,
          "error"
        );
        setIsOrdering(false);
        return;
      }

      // All reservations succeeded – prepare data for sessionStorage
      const pendingOrder = {
        authority,
        product_id: product.id,
        payment_method: paymentMethod,
        reservations: results.map((r) => ({
          reservation_id: r.value.data.id,
          machinery_id: r.value.data.machinery_id,
        })),
        product_price: product.price,
      };
      sessionStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));

      // Store amount in localStorage for verification
      localStorage.setItem("amount", (amountToPay).toString());

      // Optionally store authority for debugging
      localStorage.setItem("lastAuthority", authority);

      // Step 3: Redirect to Zarinpal payment page
      const gatewayBaseUrl = 
       process.env.REACT_APP_TYPE === "debugging"
         ? "https://sandbox.zarinpal.com/pg/StartPay/"
         : "https://payment.zarinpal.com/pg/StartPay/";
      window.location.href = `${gatewayBaseUrl}${authority}`;
    } catch (error) {
      showSnackbar("خطا در فرآیند سفارش", "error");
      setIsOrdering(false);
    }
  };

  const observeElement = (element) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return (
    <div className="machinery-page-container">
      <Header />

      <header className="machinery-page-header">
        <div className="container">
          <div className="machinery-header-content">
            <h1 className="machinery-page-title">ماشین‌آلات من</h1>
            <p className="machinery-welcome-text">
              خوش آمدید، {user?.name || "کاربر"} – در این بخش ماشین‌آلات کشاورزی
              خود را اضافه کنید.
            </p>
          </div>
        </div>
      </header>

      <div className="container machinery-page-content">
        <div className="machinery-actions-section">
          <button className="btn-add-machinery" onClick={handleAddMachineClick}>
            افزودن ماشین جدید
          </button>
        </div>

        {isLoading && (
          <div className="machinery-loading-state">
            <div className="machinery-loading-spinner"></div>
            <p>در حال بارگذاری ماشین‌آلات...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="machinery-error-state">
            <p>خطا در دریافت اطلاعات: {error}</p>
          </div>
        )}

        {!isLoading && !error && machines.length === 0 && (
          <div className="machinery-empty-state">
            <div className="machinery-empty-icon">🚜</div>
            <h3>ماشینی یافت نشد</h3>
            <p>اولین ماشین خود را اضافه کنید</p>
          </div>
        )}

        {!isLoading && !error && machines.length > 0 && (
          <div className="machinery-grid-container">
            {machines.map((machine, index) => (
              <div
                key={machine.id}
                ref={(el) => observeElement(el)}
                data-id={machine.id}
                className={`machinery-item-card ${
                  visibleItems.has(String(machine.id)) ? "visible" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  className="machinery-delete-btn"
                  onClick={() => handleDeleteClick(machine)}
                  title="حذف ماشین"
                >
                  ×
                </button>

                <div className="machinery-item-model">{machine.model}</div>
                <div className="machinery-item-type-badge">
                  {getMachineTypeLabel(machine)}
                </div>

                <div className="machinery-details-list">
                  <div className="machinery-detail-item">
                    <span className="machinery-detail-label">سال تولید:</span>
                    <span className="machinery-detail-value">
                      {toPersianDigits(machine.manufacture_year)}
                    </span>
                  </div>

                  <div className="machinery-detail-item">
                    <span className="machinery-detail-label">
                      {machine.tractor && "نوع تراکتور:"}
                      {machine.combine && "نوع استفاده:"}
                      {machine.chopper && "نوع چاپر:"}
                    </span>
                    <span className="machinery-detail-value">
                      {getTypeSpecificValue(machine)}
                    </span>
                  </div>

                  <div className="machinery-detail-item">
                    <span className="machinery-detail-label">تاریخ ثبت:</span>
                    <span className="machinery-detail-value">
                      {formatPersianDate(machine.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Method & Order Section */}
        <div className="machinery-order-section">
          <div className="payment-method-container">
            <h4>روش پرداخت</h4>
            <div className="payment-radio-group">
              <label className="payment-radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === "CASH"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                نقدی
              </label>
              <label className="payment-radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="INSTALLMENT"
                  checked={paymentMethod === "INSTALLMENT"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                اقساط (۲ قسط)
              </label>
            </div>
            {paymentMethod === "INSTALLMENT" && (
              <div className="installment-message">
                <p>توجه: به منظور نهایی سازی مراحل ثبت سفارش خواهشمند است دو فقره چک صیادی به شرح ذیل ثبت و به شرکت یا اتاق اصناف  کشاورزی محل اقامت خود ارائه نمایید:</p>
                <p>
                  چک اول:‌ تاریخ: یک ماه بعد از واریز مبلغ اولیه. &nbsp; به مبلغ: {product ? formatPriceWithCurrency(product.price / 4) : "—"}
                </p>
                <p>
                  چک دوم:‌ تاریخ: یک ماه بعد از تاریخ سررسید چک اول. &nbsp; به مبلغ: {product ? formatPriceWithCurrency(product.price / 4) : "—"}
                </p>
                <p>
                  در وجه شرکت تکاپو گشترش ویدا به شماره شناسه ملی: 14009399112
                </p>
                <p>
                  از حسن اعتماد شما سپاسگزاریم.
                </p>
              </div>
            )}
          </div>

          {/* Price summary */}
          {product && (
            <div className="machinery-price-summary">
              <div className="price-row">
                <span>قیمت هر دستگاه:</span>
                <span>{formatPriceWithCurrency(product.price)}</span>
              </div>
              <div className="price-row">
                <span>تعداد ماشین‌آلات:</span>
                <span>{toPersianDigits(machines.length)}</span>
              </div>
              <div className="price-row total">
                <span>جمع کل:</span>
                <span>{formatPriceWithCurrency(totalPrice)}</span>
              </div>
              {paymentMethod === "INSTALLMENT" && (
                <div className="price-row installment">
                  <span>پرداخت نقدی (قسط اول):</span>
                  <span>{formatPriceWithCurrency(installmentPrice)}</span>
                </div>
              )}
            </div>
          )}

          <button
            className="btn-machinery-order"
            onClick={handleOrderSubmit}
            disabled={
              isPaymentLoading ||
              isOrdering ||
              machines.length === 0 ||
              !product
            }
          >
            {isOrdering ? "در حال ایجاد رزرو..." : "ثبت سفارش"}
          </button>
        </div>
      </div>

      <Footer />

      {/* Modal 1: Choose machine type */}
      {showTypeModal && (
        <div
          className="machinery-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowTypeModal(false)
          }
        >
          <div className="machinery-modal-content machinery-type-modal">
            <h3 className="machinery-modal-title">انتخاب نوع ماشین</h3>
            <div className="machinery-type-options">
              <label className="machinery-type-option">
                <input
                  type="radio"
                  name="machineType"
                  value="tractor"
                  checked={selectedMachineType === "tractor"}
                  onChange={(e) => setSelectedMachineType(e.target.value)}
                />
                تراکتور
              </label>
              <label className="machinery-type-option">
                <input
                  type="radio"
                  name="machineType"
                  value="combine"
                  checked={selectedMachineType === "combine"}
                  onChange={(e) => setSelectedMachineType(e.target.value)}
                />
                کمباین
              </label>
              <label className="machinery-type-option">
                <input
                  type="radio"
                  name="machineType"
                  value="chopper"
                  checked={selectedMachineType === "chopper"}
                  onChange={(e) => setSelectedMachineType(e.target.value)}
                />
                چاپر
              </label>
            </div>
            <div className="machinery-modal-actions">
              <button
                onClick={handleTypeConfirm}
                className="machinery-btn-primary"
              >
                ادامه
              </button>
              <button
                onClick={() => setShowTypeModal(false)}
                className="machinery-btn-secondary"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Fill details */}
      {showDetailModal && (
        <div
          className="machinery-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowDetailModal(false)
          }
        >
          <div className="machinery-modal-content">
            <h3 className="machinery-modal-title">
              {selectedMachineType === "tractor" && "افزودن تراکتور"}
              {selectedMachineType === "combine" && "افزودن کمباین"}
              {selectedMachineType === "chopper" && "افزودن چاپر"}
            </h3>

            {selectedMachineType === "tractor" && (
              <div className="machinery-form-group">
                <label className="machinery-form-label">نوع تراکتور *</label>
                <select
                  name="tractor_type"
                  value={formData.tractor_type}
                  onChange={handleInputChange}
                  className={`machinery-form-select ${
                    formErrors.tractor_type ? "error" : ""
                  }`}
                >
                  <option value="">انتخاب کنید</option>
                  {Object.entries(tractorTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {formErrors.tractor_type && (
                  <span className="machinery-error-message">
                    {formErrors.tractor_type}
                  </span>
                )}
              </div>
            )}

            {selectedMachineType === "combine" && (
              <div className="machinery-form-group">
                <label className="machinery-form-label">نوع استفاده *</label>
                <select
                  name="usage_type"
                  value={formData.usage_type}
                  onChange={handleInputChange}
                  className={`machinery-form-select ${
                    formErrors.usage_type ? "error" : ""
                  }`}
                >
                  <option value="">انتخاب کنید</option>
                  {Object.entries(combineUsageLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {formErrors.usage_type && (
                  <span className="machinery-error-message">
                    {formErrors.usage_type}
                  </span>
                )}
              </div>
            )}

            {selectedMachineType === "chopper" && (
              <div className="machinery-form-group">
                <label className="machinery-form-label">نوع چاپر *</label>
                <select
                  name="chopper_type"
                  value={formData.chopper_type}
                  onChange={handleInputChange}
                  className={`machinery-form-select ${
                    formErrors.chopper_type ? "error" : ""
                  }`}
                >
                  <option value="">انتخاب کنید</option>
                  {Object.entries(chopperTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {formErrors.chopper_type && (
                  <span className="machinery-error-message">
                    {formErrors.chopper_type}
                  </span>
                )}
              </div>
            )}

            <div className="machinery-form-group">
              <label className="machinery-form-label">مدل *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={`machinery-form-input ${
                  formErrors.model ? "error" : ""
                }`}
                placeholder="مثال: John Deere S780"
              />
              {formErrors.model && (
                <span className="machinery-error-message">
                  {formErrors.model}
                </span>
              )}
            </div>

            <div className="machinery-form-group">
              <label className="machinery-form-label">سال تولید *</label>
              <input
                type="text"
                name="manufacture_year"
                value={formData.manufacture_year}
                onChange={handleInputChange}
                className={`machinery-form-input ${
                  formErrors.manufacture_year ? "error" : ""
                }`}
                placeholder="مثال: 1400"
                maxLength="4"
              />
              {formErrors.manufacture_year && (
                <span className="machinery-error-message">
                  {formErrors.manufacture_year}
                </span>
              )}
            </div>

            <div className="machinery-modal-actions">
              <button
                onClick={handleCreateMachine}
                className="machinery-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "در حال ثبت..." : "ثبت"}
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="machinery-btn-secondary"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        title="تایید حذف"
        message={`آیا از حذف "${machineToDelete?.model}" اطمینان دارید؟`}
      />
    </div>
  );
};

export default MachineryPage;
