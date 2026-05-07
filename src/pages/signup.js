// pages/SignUpPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../common/apiClient";
import useCustomSnackbar from "../hooks/useSnackBar";
import backgroundImage from "../assets/images/background.jpg";

// Iranian National Code Validation Algorithm
const validateNationalCode = (code) => {
  if (!/^\d{10}$/.test(code)) return false;

  const check = parseInt(code[9]);
  const sum = code
    .split("")
    .slice(0, 9)
    .reduce((acc, digit, index) => {
      return acc + parseInt(digit) * (10 - index);
    }, 0);

  const remainder = sum % 11;
  return (
    (remainder < 2 && check === remainder) ||
    (remainder >= 2 && check === 11 - remainder)
  );
};

// Iranian Phone Number Validation
const validatePhoneNumber = (phone) => {
  return /^09\d{9}$/.test(phone);
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useCustomSnackbar();

  const [formData, setFormData] = useState({
    fullname: "",
    national_code: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle field blur for validation
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // Validate individual field
  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "fullname":
        if (!value.trim()) {
          error = "نام و نام خانوادگی الزامی است";
        } else if (value.trim().length < 3) {
          error = "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد";
        }
        break;

      case "national_code":
        if (!value) {
          error = "کد ملی الزامی است";
        } else if (!/^\d{10}$/.test(value)) {
          error = "کد ملی باید دقیقاً ۱۰ رقم باشد";
        } else if (!validateNationalCode(value)) {
          error = "کد ملی نامعتبر است";
        }
        break;

      case "phone":
        if (!value) {
          error = "شماره موبایل الزامی است";
        } else if (!validatePhoneNumber(value)) {
          error =
            "شماره موبایل باید با 09 شروع شده و 11 رقم باشد (مثلاً 09121234567)";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "نام و نام خانوادگی الزامی است";
    } else if (formData.fullname.trim().length < 3) {
      newErrors.fullname = "نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد";
    }

    if (!formData.national_code) {
      newErrors.national_code = "کد ملی الزامی است";
    } else if (!/^\d{10}$/.test(formData.national_code)) {
      newErrors.national_code = "کد ملی باید دقیقاً ۱۰ رقم باشد";
    } else if (!validateNationalCode(formData.national_code)) {
      newErrors.national_code = "کد ملی نامعتبر است";
    }

    if (!formData.phone) {
      newErrors.phone = "شماره موبایل الزامی است";
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone =
        "شماره موبایل باید با 09 شروع شده و 11 رقم باشد (مثلاً 09121234567)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ fullname: true, national_code: true, phone: true });

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await apiClient.post("/otp/send_otp", {
        phone: formData.phone,
        national_code: formData.national_code,
      });

      navigate("/otp", {
        state: {
          phone: formData.phone,
          userData: formData,
        },
      });

      showSnackbar("ارسال کد انجام شد!", "success");
    } catch (error) {
      showSnackbar(error.message || "ارسال کد OTP موفقیت‌آمیز نبود", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      {/* Background with blur and overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          transform: "scale(1.1)",
          zIndex: -2,
        }}
      />

      {/* Dark overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(67, 67, 67, 0.8), rgba(0, 0, 0, 0.85))",
          zIndex: -1,
        }}
      />

      {/* Main content */}
      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div
          className="col-12 col-md-8 col-lg-5"
          style={{
            animation: "fadeInUp 0.8s ease-out",
          }}
        >
          <div
            className="card border-0 shadow-lg"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div className="card-body p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h1
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "2rem",
                    color: "#2c3e50",
                    animation: "fadeIn 1s ease-out 0.2s both",
                  }}
                >
                  ایجاد حساب کاربری
                </h1>
                <p
                  className="text-muted"
                  style={{
                    animation: "fadeIn 1s ease-out 0.4s both",
                  }}
                >
                  لطفاً اطلاعات خود را برای ثبت‌نام وارد کنید
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Full Name Field */}
                <div
                  className="mb-4"
                  style={{ animation: "fadeInUp 0.8s ease-out 0.3s both" }}
                >
                  <label
                    htmlFor="fullname"
                    className="form-label fw-semibold text-dark"
                  >
                    نام و نام خانوادگی <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${
                      touched.fullname && errors.fullname
                        ? "is-invalid"
                        : touched.fullname && !errors.fullname
                        ? "is-valid"
                        : ""
                    }`}
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    onBlur={() => handleBlur("fullname")}
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e0e0e0",
                      transition: "all 0.3s ease",
                    }}
                  />
                  {touched.fullname && errors.fullname && (
                    <div className="text-danger small mt-2">⚠️ {errors.fullname}</div>
                  )}
                </div>

                {/* National Code Field */}
                <div
                  className="mb-4"
                  style={{ animation: "fadeInUp 0.8s ease-out 0.4s both" }}
                >
                  <label
                    htmlFor="national_code"
                    className="form-label fw-semibold text-dark"
                  >
                    کد ملی <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${
                      touched.national_code && errors.national_code
                        ? "is-invalid"
                        : touched.national_code && !errors.national_code
                        ? "is-valid"
                        : ""
                    }`}
                    id="national_code"
                    name="national_code"
                    value={formData.national_code}
                    onChange={handleChange}
                    onBlur={() => handleBlur("national_code")}
                    placeholder="کد ملی ۱۰ رقمی خود را وارد کنید"
                    maxLength="10"
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e0e0e0",
                      transition: "all 0.3s ease",
                    }}
                  />
                  {touched.national_code && errors.national_code && (
                    <div className="text-danger small mt-2">
                      ⚠️ {errors.national_code}
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div
                  className="mb-4"
                  style={{ animation: "fadeInUp 0.8s ease-out 0.5s both" }}
                >
                  <label htmlFor="phone" className="form-label fw-semibold text-dark">
                    شماره موبایل <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control form-control-lg ${
                      touched.phone && errors.phone
                        ? "is-invalid"
                        : touched.phone && !errors.phone
                        ? "is-valid"
                        : ""
                    }`}
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur("phone")}
                    placeholder="مثلاً 09121234567"
                    maxLength="11"
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e0e0e0",
                      transition: "all 0.3s ease",
                    }}
                  />
                  {touched.phone && errors.phone && (
                    <div className="text-danger small mt-2">⚠️ {errors.phone}</div>
                  )}
                </div>

                {/* Submit Button */}
                <div style={{ animation: "fadeInUp 0.8s ease-out 0.6s both" }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-lg w-100 text-white fw-semibold position-relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)",
                      borderRadius: "12px",
                      border: "none",
                      padding: "14px",
                      fontSize: "1.1rem",
                      transition: "all 0.3s ease",
                      transform: "translateY(0)",
                      boxShadow: "0 4px 15px rgba(102, 187, 106, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(56, 142, 60, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(102, 187, 106, 0.4)";
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        در حال پردازش...
                      </>
                    ) : (
                      "ثبت‌نام"
                    )}
                  </button>
                </div>
              </form>

              {/* Footer text */}
              <p
                className="text-center text-muted mt-4 mb-0 small"
                style={{ animation: "fadeIn 1s ease-out 0.8s both" }}
              >
                قبلاً ثبت‌نام کرده‌اید؟{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="text-decoration-none fw-semibold"
                  style={{ color: "#489d4c", cursor: "pointer" }}
                >
                  وارد شوید
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}