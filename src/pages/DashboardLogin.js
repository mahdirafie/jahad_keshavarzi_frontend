import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import backgroundImage from "../assets/images/background.jpg";
import useDashboardStore from "../stores/dashboardStore";
import useCustomSnackbar from "../hooks/useSnackBar";

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

export default function DashboardLoginPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useCustomSnackbar();
  const { login, isLoading } = useDashboardStore();

  const [formData, setFormData] = useState({ national_code: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (field, value) => {
    let error = "";
    if (field === "national_code") {
      if (!value) error = "کد ملی الزامی است";
      else if (!/^\d{10}$/.test(value)) error = "کد ملی باید ۱۰ رقم باشد";
      else if (!validateNationalCode(value)) error = "کد ملی نامعتبر است";
    }
    if (field === "password") {
      if (!value) error = "رمز عبور الزامی است";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
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

  const validateForm = () => {
    const ncOk = validateField("national_code", formData.national_code);
    const pwOk = validateField("password", formData.password);
    return ncOk && pwOk;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ national_code: true, password: true });
    if (!validateForm()) return;

    const result = await login(formData.national_code, formData.password);

    if (result.success) {
      showSnackbar("ورود به داشبورد با موفقیت انجام شد!", "success");
      navigate("/dashboard/userorders");
    } else {
      showSnackbar(result.error, "error");
    }
  };

  return (
    <div className="min-vh-100 position-relative overflow-hidden">
      {/* Background */}
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
            "linear-gradient(135deg, rgba(20, 50, 20, 0.85), rgba(0, 0, 0, 0.9))",
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
              background: "rgba(255, 255, 255, 0.97)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div className="card-body p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)",
                    animation: "fadeInUp 0.6s ease-out 0.1s both",
                  }}
                >
                  <MdDashboard style={{ fontSize: "2rem", color: "#fff" }} />
                </div>
                <h1
                  className="fw-bold mb-1"
                  style={{
                    fontSize: "1.75rem",
                    color: "#2c3e50",
                    animation: "fadeInUp 0.6s ease-out 0.2s both",
                  }}
                >
                  ورود به داشبورد
                </h1>
                <p
                  className="text-muted small"
                  style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}
                >
                  سامانه پایش سوخت ویدا
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* National Code */}
                <div
                  className="mb-4"
                  style={{ animation: "fadeInUp 0.6s ease-out 0.35s both" }}
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
                    placeholder="کد ملی ۱۰ رقمی"
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

                {/* Password */}
                <div
                  className="mb-4"
                  style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}
                >
                  <label
                    htmlFor="password"
                    className="form-label fw-semibold text-dark"
                  >
                    رمز عبور <span className="text-danger">*</span>
                  </label>
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
                      placeholder="رمز عبور خود را وارد کنید"
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
                    <div className="text-danger small mt-2">
                      ⚠️ {errors.password}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div style={{ animation: "fadeInUp 0.6s ease-out 0.5s both" }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-lg w-100 text-white fw-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)",
                      borderRadius: "12px",
                      border: "none",
                      padding: "14px",
                      fontSize: "1.1rem",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(102, 187, 106, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(56, 142, 60, 0.6)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 15px rgba(102, 187, 106, 0.4)";
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        در حال ورود...
                      </>
                    ) : (
                      "ورود به داشبورد"
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
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
