import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import backgroundImage from "../assets/images/background.jpg";
import apiClient from "../common/apiClient";
import useCustomSnackbar from "../hooks/useSnackBar";

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useCustomSnackbar();

  // Get phone number and user data from navigation state
  const { phone, userData } = location.state || {};

  // State management
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  // Refs for each input field
  const inputRefs = useRef([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Handle input change for each OTP field
  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next field if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous field if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight" && index > 0) {
      // RTL: ArrowRight goes to previous (right side)
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index < 5) {
      // RTL: ArrowLeft goes to next (left side)
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste event to fill all fields
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only process if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  // Check if all fields are filled
  const isComplete = otp.every((digit) => digit !== "");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isComplete) {
      showSnackbar("لطفاً تمام فیلدها را پر کنید", "error");
      return;
    }

    setIsSubmitting(true);
    const otpCode = otp.join("");

    try {
      await apiClient.post("/otp/verify_otp", {
        phone: phone,
        code: otpCode,
      });

      showSnackbar("تایید با موفقیت انجام شد!", "success");

      navigate("/password", {
        state: {
          ...userData,
          phone: phone,
        },
      });
    } catch (error) {
      showSnackbar(error.message || "خطا در تایید کد", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    try {
      await apiClient.post("/otp/send_otp", {
        phone: phone,
        national_code: userData.national_code,
      });

      setResendTimer(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      showSnackbar("کد تایید مجدداً ارسال شد", "success");
    } catch (error) {
      showSnackbar(error.message, "error");
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
                  تایید شماره موبایل
                </h1>
                <p
                  className="text-muted"
                  style={{
                    animation: "fadeIn 1s ease-out 0.4s both",
                  }}
                >
                  کد تایید ۶ رقمی به شماره{" "}
                  <span className="fw-semibold" style={{ color: "#2c3e50" }}>
                    {phone || "09121234567"}
                  </span>{" "}
                  ارسال شد
                </p>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit}>
                {/* OTP Input Fields */}
                <div
                  className="mb-4"
                  style={{
                    animation: "fadeInUp 0.8s ease-out 0.3s both",
                  }}
                >
                  <label className="form-label fw-semibold text-dark text-center d-block mb-3">
                    کد تایید <span className="text-danger">*</span>
                  </label>

                  {/* OTP Input Grid - RTL order */}
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

                {/* Resend Code Button */}
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
                      ارسال مجدد کد تایید
                    </button>
                  ) : (
                    <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                      ارسال مجدد کد تا{" "}
                      <span className="fw-semibold" style={{ color: "#2c3e50" }}>
                        {resendTimer}
                      </span>{" "}
                      ثانیه دیگر
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div style={{ animation: "fadeInUp 0.8s ease-out 0.5s both" }}>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isComplete}
                    className="btn btn-lg w-100 text-white fw-semibold position-relative overflow-hidden"
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
                        در حال تایید...
                      </>
                    ) : (
                      "تایید کد"
                    )}
                  </button>
                </div>
              </form>

              {/* Footer text */}
              <p
                className="text-center text-muted mt-4 mb-0 small"
                style={{ animation: "fadeIn 1s ease-out 0.6s both" }}
              >
                شماره اشتباه است؟{" "}
                <span
                  onClick={() => {
                    navigate("/signup");
                  }}
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