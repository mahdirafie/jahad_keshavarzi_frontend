import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useTractorStore from "../stores/tractorStore";
import useAuthStore from "../stores/authStore";
import usePaymentStore from "../stores/paymentStore";
import ConfirmModal from "../modals/ConfirmModal";
import useCustomSnackbar from "../hooks/useSnackBar";
import moment from "moment-jalaali";
import "./TractorsPage.css";
import { formatPriceWithCurrency } from "../utils/PriceFormat";

import Header from "../components/Header";
import Footer from "../components/Footer";

const TractorsPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useCustomSnackbar();

  // Stores
  const {
    tractors,
    price,
    isLoading,
    error,
    getTractorsByUser,
    createTractor,
    deleteTractor,
  } = useTractorStore();
  const { user } = useAuthStore();
  const { requestPayment, isLoading: isPaymentLoading } = usePaymentStore();

  // States
  const [showAddTractorModal, setShowAddTractorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tractorToDelete, setTractorToDelete] = useState(null);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [formData, setFormData] = useState({
    model: "",
    production_year: "",
    power: "",
    cylinder_no: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const observerRef = useRef(null);

  useEffect(() => {
    fetchTractors();
    setupIntersectionObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
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

  const fetchTractors = async () => {
    const result = await getTractorsByUser();
    if (!result.success) {
      showSnackbar(result.error, "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.model.trim()) {
      errors.model = "مدل تراکتور الزامی است";
    }

    if (!formData.production_year.trim()) {
      errors.production_year = "سال تولید الزامی است";
    } else if (!/^\d{4}$/.test(formData.production_year)) {
      errors.production_year = "سال تولید باید ۴ رقم باشد";
    } else {
      const year = parseInt(formData.production_year);
      const currentJalaaliYear = moment().jYear(); // Get current Jalaali year

      // Jalaali years range from 1300 to current year + 1
      if (year < 1300 || year > currentJalaaliYear + 1) {
        errors.production_year = `سال تولید باید بین ۱۳۰۰ تا ${toPersianDigits(
          currentJalaaliYear + 1
        )} باشد`;
      }
    }

    if (formData.power && !/^\d+$/.test(formData.power)) {
      errors.power = "قدرت باید عدد باشد";
    }

    if (formData.cylinder_no && !/^\d+$/.test(formData.cylinder_no)) {
      errors.cylinder_no = "تعداد سیلندر باید عدد باشد";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTractor = async () => {
    if (!validateForm()) {
      showSnackbar("لطفا فیلدهای ضروری را پر کنید", "error");
      return;
    }

    const tractorData = {
      model: formData.model,
      production_year: formData.production_year, // Keep as string
      ...(formData.power && { power: parseInt(formData.power) }),
      ...(formData.cylinder_no && {
        cylinder_no: parseInt(formData.cylinder_no),
      }),
    };

    const result = await createTractor(tractorData);

    if (result.success) {
      showSnackbar("تراکتور با موفقیت اضافه شد", "success");
      setShowAddTractorModal(false);
      setFormData({
        model: "",
        production_year: "",
        power: "",
        cylinder_no: "",
      });
      setVisibleItems(new Set());
    } else {
      showSnackbar(result.error, "error");
    }
  };

  const handleDeleteClick = (tractor) => {
    setTractorToDelete(tractor);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (tractorToDelete) {
      const result = await deleteTractor(tractorToDelete.id);
      if (result.success) {
        showSnackbar("تراکتور با موفقیت حذف شد", "success");
      } else {
        showSnackbar(result.error, "error");
      }
    }
    setShowDeleteModal(false);
    setTractorToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTractorToDelete(null);
  };

  // Handle order submission and payment
  const handleOrderSubmit = async () => {
    if (!tractors || tractors.length === 0) {
      showSnackbar("لطفا حداقل یک تراکتور اضافه کنید", "error");
      return;
    }

    if (!price) {
      showSnackbar("قیمت در دسترس نیست. لطفا稍后 تلاش کنید", "error");
      return;
    }

    const totalAmount = tractors.length * price;

    const orderData = {
      amount: totalAmount * 10,
      description: `خرید دستگاه ویداسنس برای ${tractors.length} تراکتور`,
    };

    const result = await requestPayment(orderData);

    localStorage.setItem('amount', totalAmount * 10);

    if (result.success && result.authority) {
      // Redirect to Zarinpal payment gateway
      window.location.href = `https://sandbox.zarinpal.com/pg/StartPay/${result.authority}`;
    } else {
      showSnackbar(result.error || "خطا در اتصال به درگاه پرداخت", "error");
    }
  };

  const formatPersianDate = (dateString) => {
    if (!dateString) return "---";

    try {
      return moment(dateString).format("jYYYY/jMM/jDD");
    } catch (error) {
      return "---";
    }
  };

  // toPersianDigits function remains the same
  const toPersianDigits = (num) => {
    if (num === null || num === undefined) return "";
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (d) => persianDigits[d]);
  };

  const observeElement = (element) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return (
    <div className="tractors-page-container">
      <Header />
      {/* Header */}
      <header className="tractors-page-header">
        <div className="container">
          <div className="tractors-header-content">
            <h1 className="tractors-page-title">تراکتورهای من</h1>
            <p className="tractors-welcome-text">
              خوش آمدید، {user?.name || "کاربر"} - در این بخش مشخصات تراکتور یا
              تراکتور های خود را که میخواهید برای آن دستگاه را سفارش دهید وارد
              نمایید.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container tractors-page-content">
        <div className="tractors-actions-section">
          <button
            className="btn-add-tractor"
            onClick={() => setShowAddTractorModal(true)}
          >
            افزودن تراکتور جدید
          </button>
        </div>

        {isLoading && (
          <div className="tractors-loading-state">
            <div className="tractors-loading-spinner"></div>
            <p>در حال بارگذاری تراکتورها...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="tractors-error-state">
            <p>خطا در دریافت اطلاعات: {error}</p>
          </div>
        )}

        {!isLoading && !error && tractors.length === 0 && (
          <div className="tractors-empty-state">
            <div className="tractors-empty-icon">🚜</div>
            <h3>تراکتوری یافت نشد</h3>
            <p>اولین تراکتور خود را اضافه کنید</p>
          </div>
        )}

        {!isLoading && !error && tractors.length > 0 && (
          <div className="tractors-grid-container">
            {tractors.map((tractor, index) => (
              <div
                key={tractor.id}
                ref={(el) => observeElement(el)}
                data-id={tractor.id}
                className={`tractor-item-card ${
                  visibleItems.has(tractor.id) ? "visible" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  className="tractor-delete-btn"
                  onClick={() => handleDeleteClick(tractor)}
                  title="حذف تراکتور"
                >
                  ×
                </button>

                <div className="tractor-item-model">{tractor.model}</div>

                <div className="tractor-details-list">
                  <div className="tractor-detail-item">
                    <span className="tractor-detail-label">سال تولید:</span>
                    <span className="tractor-detail-value">
                      {toPersianDigits(tractor.production_year)}
                    </span>
                  </div>

                  {tractor.power && (
                    <div className="tractor-detail-item">
                      <span className="tractor-detail-label">
                        قدرت (اسب بخار):
                      </span>
                      <span className="tractor-detail-value">
                        {toPersianDigits(tractor.power)}
                      </span>
                    </div>
                  )}

                  {tractor.cylinder_no && (
                    <div className="tractor-detail-item">
                      <span className="tractor-detail-label">
                        تعداد سیلندر:
                      </span>
                      <span className="tractor-detail-value">
                        {toPersianDigits(tractor.cylinder_no)}
                      </span>
                    </div>
                  )}

                  <div className="tractor-detail-item">
                    <span className="tractor-detail-label">تاریخ ثبت:</span>
                    <span className="tractor-detail-value">
                      {formatPersianDate(tractor.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Button */}
        <div className="tractors-order-section">
          <button
            className="btn-tractor-order"
            onClick={handleOrderSubmit}
            disabled={
              isPaymentLoading || !tractors || tractors.length === 0 || !price
            }
          >
            {isPaymentLoading ? "در حال اتصال به درگاه..." : "ثبت سفارش"}
          </button>
          {price && (
            <div className="tractor-price-container">
              <div className="tractor-order-price">
                قیمت دستگاه به ازای هر تراکتور: {formatPriceWithCurrency(price)}
              </div>
              <div className="tractor-total-price">
                هزینه کل برای شما:{" "}
                {formatPriceWithCurrency(tractors.length * price)}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer/>

      {/* Add Tractor Modal */}
      {showAddTractorModal && (
        <div
          className="tractor-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowAddTractorModal(false)
          }
        >
          <div className="tractor-modal-content">
            <h3 className="tractor-modal-title">افزودن تراکتور جدید</h3>

            <div className="tractor-form-group">
              <label className="tractor-form-label">مدل تراکتور *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={`tractor-form-input ${
                  formErrors.model ? "error" : ""
                }`}
                placeholder="مثال: John Deere 5075E"
              />
              {formErrors.model && (
                <span className="tractor-error-message">
                  {formErrors.model}
                </span>
              )}
            </div>

            <div className="tractor-form-group">
              <label className="tractor-form-label">سال تولید *</label>
              <input
                type="text"
                name="production_year"
                value={formData.production_year}
                onChange={handleInputChange}
                className={`tractor-form-input ${
                  formErrors.production_year ? "error" : ""
                }`}
                placeholder="مثال: 1400"
                maxLength="4"
              />
              {formErrors.production_year && (
                <span className="tractor-error-message">
                  {formErrors.production_year}
                </span>
              )}
            </div>

            <div className="tractor-form-group">
              <label className="tractor-form-label">قدرت (اسب بخار)</label>
              <input
                type="text"
                name="power"
                value={formData.power}
                onChange={handleInputChange}
                className={`tractor-form-input ${
                  formErrors.power ? "error" : ""
                }`}
                placeholder="اختیاری"
              />
              {formErrors.power && (
                <span className="tractor-error-message">
                  {formErrors.power}
                </span>
              )}
            </div>

            <div className="tractor-form-group">
              <label className="tractor-form-label">تعداد سیلندر</label>
              <input
                type="text"
                name="cylinder_no"
                value={formData.cylinder_no}
                onChange={handleInputChange}
                className={`tractor-form-input ${
                  formErrors.cylinder_no ? "error" : ""
                }`}
                placeholder="اختیاری"
              />
              {formErrors.cylinder_no && (
                <span className="tractor-error-message">
                  {formErrors.cylinder_no}
                </span>
              )}
            </div>

            <div className="tractor-modal-actions">
              <button
                onClick={handleCreateTractor}
                className="tractor-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "در حال ثبت..." : "ثبت تراکتور"}
              </button>
              <button
                onClick={() => setShowAddTractorModal(false)}
                className="tractor-btn-secondary"
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
        onCancel={handleDeleteCancel}
        title="تایید حذف تراکتور"
        message={`آیا مطمئن هستید که می‌خواهید تراکتور "${tractorToDelete?.model}" را حذف کنید؟`}
      />
    </div>
  );
};

export default TractorsPage;
