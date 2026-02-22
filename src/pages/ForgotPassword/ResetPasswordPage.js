// pages/ResetPasswordPage.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import backgroundImage from "../../assets/images/background.jpg";
import BASE_URL from "../../common/baseUrl";
import useCustomSnackbar from "../../hooks/useSnackBar";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useCustomSnackbar();

  const { national_code } = location.state || {};
  if (!national_code) {
    navigate("/forgot-password");
  }

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (password) => {
    if (!password) return "رمز عبور الزامی است";
    if (password.length < 6) return "رمز عبور باید حداقل ۶ کاراکتر باشد";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = "";
    if (field === "password") {
      error = validatePassword(value);
    } else if (field === "confirmPassword") {
      if (!value) error = "تکرار رمز عبور الزامی است";
      else if (value !== formData.password) error = "رمز عبور و تکرار آن یکسان نیستند";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const validateForm = () => {
    const newErrors = {};
    const pwdError = validatePassword(formData.password);
    if (pwdError) newErrors.password = pwdError;
    if (!formData.confirmPassword) newErrors.confirmPassword = "تکرار رمز عبور الزامی است";
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "رمز عبور و تکرار آن یکسان نیستند";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          national_code,
          new_password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showSnackbar("رمز عبور با موفقیت تغییر کرد", "success");
        navigate('/login');
      } else {
        throw new Error(data.message || "خطا در تغییر رمز عبور");
      }
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      {/* Background & overlay */}
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
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(67, 67, 67, 0.8), rgba(0, 0, 0, 0.85))",
          zIndex: -1,
        }}
      />

      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div
          className="col-12 col-md-8 col-lg-5"
          style={{
            opacity: 0,
            transform: "translateY(30px)",
            animation: "fadeInUp 0.8s ease-out forwards",
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
              <div className="text-center mb-4">
                <h1
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "2rem",
                    color: "#2c3e50",
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.6s ease-out 0.2s forwards",
                  }}
                >
                  تعیین رمز عبور جدید
                </h1>
                <p
                  className="text-muted"
                  style={{
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.6s ease-out 0.4s forwards",
                  }}
                >
                  رمز عبور جدید خود را وارد کنید
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* New Password */}
                <div
                  className="mb-4"
                  style={{
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.6s ease-out 0.3s forwards",
                  }}
                >
                  <label htmlFor="password" className="form-label fw-semibold text-dark">
                    رمز عبور جدید <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control form-control-lg ${
                        touched.password && errors.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur("password")}
                      placeholder="حداقل ۶ کاراکتر"
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
                  {touched.password && errors.password && (
                    <div className="text-danger small mt-2">⚠️ {errors.password}</div>
                  )}
                </div>

                {/* Confirm Password */}
                <div
                  className="mb-4"
                  style={{
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.6s ease-out 0.4s forwards",
                  }}
                >
                  <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark">
                    تکرار رمز عبور <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className={`form-control form-control-lg ${
                        touched.confirmPassword && errors.confirmPassword ? "is-invalid" : ""
                      }`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur("confirmPassword")}
                      placeholder="تکرار رمز عبور"
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #e0e0e0",
                        transition: "all 0.3s ease",
                        paddingLeft: "45px",
                      }}
                    />
                    <span
                      onClick={() => setShowConfirm(!showConfirm)}
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
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <div className="text-danger small mt-2">⚠️ {errors.confirmPassword}</div>
                  )}
                </div>

                {/* Submit */}
                <div
                  style={{
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.6s ease-out 0.5s forwards",
                  }}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-lg w-100 text-white fw-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)",
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
                        در حال تغییر...
                      </>
                    ) : (
                      "تغییر رمز عبور"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}