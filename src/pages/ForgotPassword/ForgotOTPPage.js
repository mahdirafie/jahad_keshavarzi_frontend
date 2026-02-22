// pages/ForgotOTPPage.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import backgroundImage from "../../assets/images/background.jpg";
import BASE_URL from "../../common/baseUrl";
import useCustomSnackbar from "../../hooks/useSnackBar";

export default function ForgotOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useCustomSnackbar();

  const { national_code } = location.state || {};
  if (!national_code) {
    // If no national code, redirect back
    navigate("/forgot-password");
  }

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete) {
      showSnackbar("لطفاً تمام فیلدها را پر کنید", "error");
      return;
    }

    setIsSubmitting(true);
    const otpCode = otp.join("");

    try {
      const response = await fetch(`${BASE_URL}/otp/verify-forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          national_code: national_code,
          code: otpCode,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showSnackbar("کد تأیید صحیح است", "success");
        // Navigate to reset password page with national code
        navigate("/reset-password", { state: { national_code } });
      } else {
        throw new Error(data.message || "کد نامعتبر است");
      }
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const response = await fetch(`${BASE_URL}/otp/reset-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ national_code }),
      });

      const data = await response.json();
      if (response.ok) {
        setResendTimer(120);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        showSnackbar("کد جدید ارسال شد", "success");
      } else {
        throw new Error(data.message || "خطا در ارسال مجدد");
      }
    } catch (error) {
      showSnackbar(error.message, "error");
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
              <div className="text-center mb-4">
                <h1
                  className="fw-bold mb-2"
                  style={{
                    fontSize: "2rem",
                    color: "#2c3e50",
                    animation: "fadeIn 1s ease-out 0.2s both",
                  }}
                >
                  تأیید کد
                </h1>
                <p
                  className="text-muted"
                  style={{
                    animation: "fadeIn 1s ease-out 0.4s both",
                  }}
                >
                  کد ۶ رقمی ارسال‌شده به شماره همراه خود را وارد کنید
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div
                  className="mb-4"
                  style={{
                    animation: "fadeInUp 0.8s ease-out 0.3s both",
                  }}
                >
                  <label className="form-label fw-semibold text-dark text-center d-block mb-3">
                    کد تأیید <span className="text-danger">*</span>
                  </label>

                  <div
                    className="d-flex justify-content-center gap-2"
                    dir="ltr"
                    style={{ maxWidth: "400px", margin: "0 auto" }}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="form-control form-control-lg text-center"
                        style={{
                          width: "50px",
                          height: "60px",
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          borderRadius: "12px",
                          border: digit ? "2px solid #66bb6a" : "2px solid #e0e0e0",
                          backgroundColor: digit ? "rgba(102, 187, 106, 0.1)" : "white",
                          transition: "all 0.3s ease",
                        }}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className="text-center mb-4"
                  style={{
                    animation: "fadeInUp 0.8s ease-out 0.4s both",
                  }}
                >
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="btn btn-link text-decoration-none fw-semibold"
                      style={{
                        color: "#489d4c",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                      }}
                    >
                      ارسال مجدد کد
                    </button>
                  ) : (
                    <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                      ارسال مجدد تا{" "}
                      <span className="fw-semibold" style={{ color: "#2c3e50" }}>
                        {resendTimer}
                      </span>{" "}
                      ثانیه
                    </p>
                  )}
                </div>

                <div style={{ animation: "fadeInUp 0.8s ease-out 0.5s both" }}>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isComplete}
                    className="btn btn-lg w-100 text-white fw-semibold"
                    style={{
                      background: isComplete
                        ? "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)"
                        : "linear-gradient(135deg, #9e9e9e 0%, #757575 100%)",
                      borderRadius: "12px",
                      border: "none",
                      padding: "14px",
                      fontSize: "1.1rem",
                      transition: "all 0.3s ease",
                      transform: "translateY(0)",
                      boxShadow: isComplete
                        ? "0 4px 15px rgba(102, 187, 106, 0.4)"
                        : "0 4px 15px rgba(158, 158, 158, 0.3)",
                      cursor: isComplete ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={(e) => {
                      if (isComplete && !isSubmitting) {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(56, 142, 60, 0.6)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = isComplete
                        ? "0 4px 15px rgba(102, 187, 106, 0.4)"
                        : "0 4px 15px rgba(158, 158, 158, 0.3)";
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        در حال تأیید...
                      </>
                    ) : (
                      "تأیید کد"
                    )}
                  </button>
                </div>
              </form>

              <p
                className="text-center text-muted mt-4 mb-0 small"
                style={{ animation: "fadeIn 1s ease-out 0.6s both" }}
              >
                <span
                  onClick={() => navigate("/forgot-password")}
                  className="text-decoration-none fw-semibold"
                  style={{ color: "#489d4c", cursor: "pointer" }}
                >
                  ویرایش کد ملی
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}