// pages/PasswordPage.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import backgroundImage from "../assets/images/background.jpg";
import apiClient from "../common/apiClient";
import useCustomSnackbar from "../hooks/useSnackBar";

export default function PasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useCustomSnackbar();

  // Get user data from navigation state
  const userData = location.state || {};

  // State management
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return "رمز عبور الزامی است";

    if (password.length < 8) return "رمز عبور باید حداقل ۸ کاراکتر باشد";

    if (!/[0-9]/.test(password)) return "رمز عبور باید حداقل شامل یک عدد باشد";

    if (!/[a-zA-Z]/.test(password))
      return "رمز عبور باید شامل حروف انگلیسی باشد";

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "رمز عبور باید شامل حداقل یک کاراکتر ویژه باشد";

    if (/\s/.test(password)) return "رمز عبور نباید شامل فاصله باشد";

    return ""; // no error
  };

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
      case "password":
        error = validatePassword(value);
        break;

      case "confirmPassword":
        if (!value) {
          error = "تکرار رمز عبور الزامی است";
        } else if (value !== formData.password) {
          error = "رمز عبور و تکرار آن مطابقت ندارند";
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

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "تکرار رمز عبور الزامی است";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "رمز عبور و تکرار آن مطابقت ندارند";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ password: true, confirmPassword: true });

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await apiClient.post("/user/create", {
        national_code: userData.national_code,
        name: userData.fullname,
        phone: userData.phone,
        password: formData.password,
      });

      showSnackbar("حساب کاربری با موفقیت ایجاد شد!", "success");

      setFormData({ password: "", confirmPassword: "" });
      setTouched({});

      navigate('/login');
    } catch (error) {
      showSnackbar(error.message, "error");
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
                  تنظیم رمز عبور
                </h1>
                <p
                  className="text-muted"
                  style={{
                    animation: "fadeIn 1s ease-out 0.4s both",
                  }}
                >
                  لطفاً یک رمز عبور قوی برای حساب کاربری خود انتخاب کنید
                </p>
              </div>

              {/* User Info Summary */}
              {userData.fullname && (
                <div
                  className="alert alert-info mb-4"
                  style={{
                    animation: "fadeInUp 0.8s ease-out 0.3s both",
                    borderRadius: "12px",
                    backgroundColor: "rgba(13, 202, 240, 0.1)",
                    border: "1px solid rgba(13, 202, 240, 0.3)",
                  }}
                >
                  <small className="text-muted">
                    <strong>خلاصه اطلاعات:</strong>
                    <div className="mt-2">
                      <div>نام: <strong>{userData.fullname}</strong></div>
                      <div>کد ملی: <strong>{userData.national_code}</strong></div>
                      <div>شماره موبایل: <strong>{userData.phone}</strong></div>
                    </div>
                  </small>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Password Field */}
                <div
                  className="mb-4"
                  style={{ animation: "fadeInUp 0.8s ease-out 0.4s both" }}
                >
                  <label
                    htmlFor="password"
                    className="form-label fw-semibold text-dark"
                  >
                    رمز عبور <span className="text-danger">*</span>
                  </label>

                  {/* Password input with eye icon */}
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control form-control-lg ${
                        touched.password && errors.password
                          ? "is-invalid"
                          : touched.password && !errors.password
                          ? "is-valid"
                          : ""
                      }`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur("password")}
                      placeholder="حداقل ۸ کاراکتر شامل حروف، اعداد و کاراکتر ویژه"
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e0e0e0",
                        transition: "all 0.3s ease",
                        paddingLeft: "45px",
                      }}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "12px",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#2c3e50",
                        fontSize: "1.1rem",
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>

                  {/* Error message */}
                  {touched.password && errors.password && (
                    <div className="text-danger small mt-2">
                      ⚠️ {errors.password}
                    </div>
                  )}

                  {/* Password strength hints */}
                  {!errors.password && formData.password && (
                    <div className="small mt-2 text-success">
                      ✓ رمز عبور معتبر است
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div
                  className="mb-4"
                  style={{ animation: "fadeInUp 0.8s ease-out 0.5s both" }}
                >
                  <label
                    htmlFor="confirmPassword"
                    className="form-label fw-semibold text-dark"
                  >
                    تکرار رمز عبور <span className="text-danger">*</span>
                  </label>

                  {/* Confirm Password input with eye icon */}
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control form-control-lg ${
                        touched.confirmPassword && errors.confirmPassword
                          ? "is-invalid"
                          : touched.confirmPassword && !errors.confirmPassword
                          ? "is-valid"
                          : ""
                      }`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur("confirmPassword")}
                      placeholder="رمز عبور خود را مجدداً وارد کنید"
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e0e0e0",
                        transition: "all 0.3s ease",
                        paddingLeft: "45px",
                      }}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "12px",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#2c3e50",
                        fontSize: "1.1rem",
                      }}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>

                  {/* Error message */}
                  {touched.confirmPassword && errors.confirmPassword && (
                    <div className="text-danger small mt-2">
                      ⚠️ {errors.confirmPassword}
                    </div>
                  )}

                  {/* Match confirmation */}
                  {!errors.confirmPassword &&
                    formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <div className="small mt-2 text-success">
                        ✓ رمز عبور مطابقت دارد
                      </div>
                    )}
                </div>

                {/* Password Requirements Info */}
                <div
                  className="alert alert-info mb-4"
                  style={{
                    animation: "fadeInUp 0.8s ease-out 0.6s both",
                    borderRadius: "12px",
                    backgroundColor: "rgba(13, 202, 240, 0.1)",
                    border: "1px solid rgba(13, 202, 240, 0.3)",
                  }}
                >
                  <small className="text-muted">
                    <strong>الزامات رمز عبور:</strong>
                    <ul className="mb-0 mt-2" style={{ paddingRight: "20px" }}>
                      <li>حداقل ۸ کاراکتر</li>
                      <li>حداقل یک حرف انگلیسی (A-Z یا a-z)</li>
                      <li>حداقل یک عدد (0-9)</li>
                      <li>حداقل یک کاراکتر ویژه (!@#$%^&*...)</li>
                      <li>بدون فاصله</li>
                    </ul>
                  </small>
                </div>

                {/* Submit Button */}
                <div style={{ animation: "fadeInUp 0.8s ease-out 0.7s both" }}>
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
                      if (!isSubmitting) {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(56, 142, 60, 0.6)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 15px rgba(102, 187, 106, 0.4)";
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        در حال ایجاد حساب...
                      </>
                    ) : (
                      "اتمام ثبت‌نام و ورود به داشبورد"
                    )}
                  </button>
                </div>
              </form>

              {/* Footer text */}
              <p
                className="text-center text-muted mt-4 mb-0 small"
                style={{ animation: "fadeIn 1s ease-out 0.8s both" }}
              >
                می‌خواهید به مرحله قبل برگردید؟{" "}
                <span
                  onClick={() => navigate(-1)}
                  className="text-decoration-none fw-semibold"
                  style={{ color: "#489d4c", cursor: "pointer", display: "inline" }}
                >
                  بازگشت
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}