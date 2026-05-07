// pages/ForgotPasswordPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/images/background.jpg";
import apiClient from "../../common/apiClient";
import useCustomSnackbar from "../../hooks/useSnackBar";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useCustomSnackbar();

  const [nationalCode, setNationalCode] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Same national code validation as LoginPage
  const validateNationalCode = (code) => {
    if (!/^\d{10}$/.test(code)) return false;
    const check = parseInt(code[9]);
    const sum = code
      .split("")
      .slice(0, 9)
      .reduce((acc, digit, index) => acc + parseInt(digit) * (10 - index), 0);
    const remainder = sum % 11;
    return (
      (remainder < 2 && check === remainder) ||
      (remainder >= 2 && check === 11 - remainder)
    );
  };

  const handleChange = (e) => {
    setNationalCode(e.target.value);
    if (errors.national_code) setErrors({});
  };

  const handleBlur = () => {
    setTouched(true);
    validateField();
  };

  const validateField = () => {
    let error = "";
    if (!nationalCode) error = "کد ملی الزامی است";
    else if (!/^\d{10}$/.test(nationalCode)) error = "کد ملی باید ۱۰ رقم باشد";
    else if (!validateNationalCode(nationalCode)) error = "کد ملی نامعتبر است";

    setErrors({ national_code: error });
    return !error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!validateField()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/otp/reset-password-otp", { national_code: nationalCode });

      showSnackbar("کد تأیید به شماره همراه شما ارسال شد", "success");
      navigate("/forgot-otp", { state: { national_code: nationalCode } });
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      {/* Background & overlay (same as LoginPage) */}
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
              {/* Header */}
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
                  بازیابی رمز عبور
                </h1>
                <p
                  className="text-muted"
                  style={{
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.6s ease-out 0.4s forwards",
                  }}
                >
                  کد ملی خود را وارد کنید تا کد تأیید برای شما ارسال شود
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* National Code Input */}
                <div
                  className="mb-4"
                  style={{
                    opacity: 0,
                    transform: "translateY(20px)",
                    animation: "fadeInUp 0.6s ease-out 0.3s forwards",
                  }}
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
                      touched && errors.national_code ? "is-invalid" : ""
                    }`}
                    id="national_code"
                    value={nationalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="کد ملی خود را وارد کنید"
                    maxLength="10"
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e0e0e0",
                      transition: "all 0.3s ease",
                    }}
                  />
                  {touched && errors.national_code && (
                    <div className="text-danger small mt-2">
                      ⚠️ {errors.national_code}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
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
                        در حال ارسال...
                      </>
                    ) : (
                      "دریافت کد تأیید"
                    )}
                  </button>
                </div>
              </form>

              {/* Back to login */}
              <p
                className="text-center text-muted mt-4 mb-0 small"
                style={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: "fadeInUp 0.6s ease-out 0.6s forwards",
                }}
              >
                <span
                  onClick={() => navigate("/login")}
                  className="text-decoration-none fw-semibold"
                  style={{
                    color: "#489d4c",
                    cursor: "pointer",
                  }}
                >
                  بازگشت به صفحه ورود
                </span>
              </p>
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