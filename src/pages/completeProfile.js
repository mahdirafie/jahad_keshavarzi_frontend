import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import "./completeProfile.css";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { completeProfile, getProfile, isLoading, error } = useAuthStore();
  const { showSnackbar } = useCustomSnackbar();

  // Cities in مرکزی province
  const markaziCities = [
    "اراک",
    "آشتیان",
    "تفرش",
    "خمین",
    "دلیجان",
    "زرندیه",
    "ساوه",
    "شازند",
    "فراهان",
    "کمیجان",
    "محلات",
    "خنداب",
  ];

  const [formData, setFormData] = useState({
    postal_code: "",
    landline_phone: "",
    address: "",
    province: "مرکزی",
    city: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsFetching(true);
      const result = await getProfile();

      if (result.success && result.data) {
        const userData = result.data.user || result.data;

        // Check if user already has profile data
        const existingData = {
          postal_code: userData.postal_code || "",
          landline_phone: userData.landline_phone || "",
          address: userData.address || "",
          province: userData.province || "مرکزی",
          city: userData.city || "",
        };

        setFormData(existingData);

        // Check if any profile data exists
        const hasData = Object.values(existingData).some(
          (value) => value && value !== "مرکزی"
        );
        setHasExistingData(hasData);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      showSnackbar("خطا در دریافت اطلاعات کاربر", "error");
    } finally {
      setIsFetching(false);
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

    if (!formData.postal_code.trim()) {
      errors.postal_code = "کد پستی الزامی است";
    } else if (!/^\d{10}$/.test(formData.postal_code)) {
      errors.postal_code = "کد پستی باید ۱۰ رقم باشد";
    }

    if (!formData.landline_phone.trim()) {
      errors.landline_phone = "تلفن ثابت الزامی است";
    } else if (!/^\d{8,11}$/.test(formData.landline_phone)) {
      errors.landline_phone = "تلفن ثابت باید بین ۸ تا ۱۱ رقم باشد";
    }

    if (!formData.address.trim()) {
      errors.address = "آدرس الزامی است";
    } else if (formData.address.trim().length < 10) {
      errors.address = "آدرس باید حداقل ۱۰ کاراکتر باشد";
    }

    if (!formData.city) {
      errors.city = "شهر الزامی است";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar("لطفا تمام فیلدهای ضروری را پر کنید", "error");
      return;
    }

    const result = await completeProfile(formData);

    if (result.success) {
      showSnackbar(
        hasExistingData
          ? "پروفایل با موفقیت بروزرسانی شد"
          : "پروفایل با موفقیت تکمیل شد",
        "success"
      );
      navigate("/");
    } else {
      showSnackbar(result.error, "error");
    }
  };

  if (isFetching) {
    return (
      <div className="complete-profile-page">
        <div className="complete-profile-container">
          <div className="complete-profile-card">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>در حال دریافت اطلاعات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-container">
        <div className="complete-profile-card">
          <h1 className="complete-profile-title">
            {hasExistingData ? "بروزرسانی پروفایل" : "تکمیل پروفایل"}
          </h1>
          <p className="complete-profile-subtitle">
            {hasExistingData
              ? "اطلاعات پروفایل شما نمایش داده می‌شود. می‌توانید آنها را ویرایش کنید."
              : "لطفا اطلاعات زیر را برای تکمیل پروفایل خود وارد کنید"}
          </p>

          <form onSubmit={handleSubmit} className="complete-profile-form">
            {/* Postal Code */}
            <div className="form-group">
              <label htmlFor="postal_code" className="form-label">
                کد پستی *
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className={`form-input ${
                  formErrors.postal_code ? "error" : ""
                }`}
                placeholder="1234567890"
                maxLength="10"
              />
              {formErrors.postal_code && (
                <span className="error-message">{formErrors.postal_code}</span>
              )}
            </div>

            {/* Landline Phone */}
            <div className="form-group">
              <label htmlFor="landline_phone" className="form-label">
                تلفن ثابت *
              </label>
              <input
                type="text"
                id="landline_phone"
                name="landline_phone"
                value={formData.landline_phone}
                onChange={handleInputChange}
                className={`form-input ${
                  formErrors.landline_phone ? "error" : ""
                }`}
                placeholder="02144556677"
              />
              {formErrors.landline_phone && (
                <span className="error-message">
                  {formErrors.landline_phone}
                </span>
              )}
            </div>

            {/* Province (Fixed) */}
            <div className="form-group">
              <label htmlFor="province" className="form-label">
                استان *
              </label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                className="form-input"
                disabled
              />
              <small className="form-help">استان قابل تغییر نیست</small>
            </div>

            {/* City */}
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                شهر *
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`form-select ${formErrors.city ? "error" : ""}`}
              >
                <option value="">انتخاب شهر</option>
                {markaziCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {formErrors.city && (
                <span className="error-message">{formErrors.city}</span>
              )}
            </div>

            {/* Address */}
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                آدرس کامل *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`form-textarea ${formErrors.address ? "error" : ""}`}
                placeholder="آدرس کامل خود را وارد کنید..."
                rows="4"
              />
              {formErrors.address && (
                <span className="error-message">{formErrors.address}</span>
              )}
            </div>

            {/* Error Display */}
            {error && <div className="form-error">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading
                ? "در حال ارسال..."
                : hasExistingData
                ? "بروزرسانی پروفایل"
                : "تکمیل پروفایل"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
