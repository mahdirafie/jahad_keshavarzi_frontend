import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import BannerPic from "../assets/images/banner.jpg";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const AnimatedFuelChart = ({ isVisible }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (isVisible) {
      // Generate more realistic data with some trend
      const baseValues = [45, 52, 48, 60, 55, 42, 50];
      const data = [
        {
          name: "شنبه",
          fuelUsage: baseValues[0] + Math.floor(Math.random() * 10) - 5,
        },
        {
          name: "یکشنبه",
          fuelUsage: baseValues[1] + Math.floor(Math.random() * 10) - 5,
        },
        {
          name: "دوشنبه",
          fuelUsage: baseValues[2] + Math.floor(Math.random() * 10) - 5,
        },
        {
          name: "سه‌شنبه",
          fuelUsage: baseValues[3] + Math.floor(Math.random() * 10) - 5,
        },
        {
          name: "چهارشنبه",
          fuelUsage: baseValues[4] + Math.floor(Math.random() * 10) - 5,
        },
        {
          name: "پنجشنبه",
          fuelUsage: baseValues[5] + Math.floor(Math.random() * 10) - 5,
        },
        {
          name: "جمعه",
          fuelUsage: baseValues[6] + Math.floor(Math.random() * 10) - 5,
        },
      ];
      setChartData(data);
    } else {
      setChartData([]);
    }
  }, [isVisible]);

  const styles = {
    chartCard: {
      background: "white",
      borderRadius: "15px",
      padding: "20px",
      height: "100%",
    },
    chartTitle: {
      textAlign: "center",
      color: "#4CAF50",
      fontWeight: "bold",
      marginBottom: "20px",
      fontSize: "18px",
    },
  };

  return (
    <div style={styles.chartCard}>
      <h5 style={styles.chartTitle}>مصرف سوخت هفتگی</h5>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#757575"
            style={{ fontSize: "0.8rem" }}
            angle={0}
            textAnchor="middle"
          />
          <YAxis
            stroke="#757575"
            style={{ fontSize: "0.8rem" }}
            domain={[30, 70]}
            label={{
              value: "لیتر",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: "0.8rem", fill: "#757575" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #4CAF50",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "right",
              direction: "rtl",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [
              <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
                {value} لیتر
              </span>,
              "مصرف سوخت",
            ]}
            labelFormatter={(label) => (
              <span style={{ color: "#2e7d32", fontWeight: "600" }}>
                روز: {label}
              </span>
            )}
          />
          <Legend
            wrapperStyle={{
              fontSize: "0.85rem",
              textAlign: "center",
              paddingTop: "10px",
            }}
            formatter={() => (
              <span style={{ color: "#4CAF50" }}>مصرف سوخت</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="fuelUsage"
            stroke="#4CAF50"
            strokeWidth={3}
            dot={{
              fill: "#4CAF50",
              r: 6,
              stroke: "#fff",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 8,
              fill: "#2e7d32",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <small style={{ color: "#666" }}>
          میانگین مصرف هفتگی:{" "}
          {chartData.length
            ? Math.round(
                chartData.reduce((sum, day) => sum + day.fuelUsage, 0) /
                  chartData.length
              )
            : 0}{" "}
          لیتر
        </small>
      </div>
    </div>
  );
};

// Custom hook for scroll animations
const useInViewAnimation = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  // Animation refs for sections
  const [heroRef, heroVisible] = useInViewAnimation();
  const [aboutRef, aboutVisible] = useInViewAnimation();
  const [problemsRef, problemsVisible] = useInViewAnimation();
  const [featuresRef, featuresVisible] = useInViewAnimation();
  const [howItWorksRef, howItWorksVisible] = useInViewAnimation();

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Handle logout with confirmation
  const handleLogout = () => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید خارج شوید؟")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      setIsLoggedIn(false);
      setShowDropdown(false);
    }
  };

  // Handle tractors navigation
  const handleTractorsClick = () => {
    navigate("/tractors");
    setShowDropdown(false);
  };

  return (
    <div dir="rtl" style={{ fontFamily: "Tahoma, Arial, sans-serif" }}>
      <style>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3) !important;
        }
        .btn-custom-green {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .btn-custom-green:hover {
          background-color: #45a049;
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
        }
        .btn-custom-outline {
          background-color: transparent;
          color: #000;
          border: 2px solid #000;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .btn-custom-outline:hover {
          background-color: #000;
          color: white;
        }
        .hero-section {
          min-height: 90vh;
          background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%);
        }
        .feature-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          height: 100%;
        }
        .feature-icon {
          width: 70px;
          height: 70px;
          background: #4CAF50;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 30px;
          color: white;
        }
        .timeline-step {
          position: relative;
          padding: 30px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .timeline-number {
          width: 50px;
          height: 50px;
          background: #4CAF50;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin: 0 auto 20px;
        }
        .navbar-custom {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .dropdown-custom {
          position: relative;
        }
        .dropdown-menu-custom {
          position: absolute;
          left: 0;
          top: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          margin-top: 10px;
          min-width: 150px;
          z-index: 1000;
        }
        .dropdown-item-custom {
          padding: 12px 20px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .dropdown-item-custom:hover {
          background: #f5f5f5;
        }
        .placeholder-image {
          background: #e0e0e0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 14px;
          text-align: center;
          padding: 20px;
        }
      `}</style>

      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
        <div className="container">
          <a
            className="navbar-brand fw-bold"
            href="#a"
            style={{ color: "#4CAF50", fontSize: "24px" }}
          >
            VidaSense | ویدا سنس
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a
                  className="nav-link active fw-bold"
                  href="#a"
                  style={{ color: "#4CAF50" }}
                >
                  صفحه اصلی
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  درباره ما
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  تماس با ما
                </a>
              </li>
            </ul>

            <div className="d-flex gap-2 align-items-center">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                    }}
                    className="btn btn-outline-dark px-4"
                  >
                    ورود
                  </button>
                  <button
                    className="btn btn-success px-4"
                    onClick={() => {
                      navigate("/signup");
                    }}
                    style={{ background: "#4CAF50", border: "none" }}
                  >
                    ثبت‌نام
                  </button>
                </>
              ) : (
                <div className="dropdown-custom">
                  <button
                    className="btn btn-light rounded-circle p-2"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ width: "45px", height: "45px" }}
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                    </svg>
                  </button>
                  {showDropdown && (
                    <div className="dropdown-menu-custom">
                      <div className="dropdown-item-custom">پروفایل</div>
                      <div 
                        className="dropdown-item-custom"
                        onClick={handleTractorsClick}
                      >
                        تراکتورها
                      </div>
                      <div
                        className="dropdown-item-custom"
                        style={{ color: "#dc3545" }}
                        onClick={handleLogout}
                      >
                        خروج
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`fade-in ${heroVisible ? "visible" : ""}`}
        style={{
          minHeight: "95vh",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 25%, #dee2e6 50%, #ced4da 75%, #adb5bd 100%)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Optional: Add some subtle decorative elements */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 80% 20%, rgba(173, 181, 189, 0.1) 0%, transparent 50%)",
            zIndex: 1,
          }}
        ></div>

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1
                className="display-4 fw-bold mb-4"
                style={{ color: "#2e7d32" }}
              >
                ویدا سنس؛ نسل جدید پایش هوشمند تراکتور
              </h1>
              <p
                className="lead mb-4"
                style={{
                  fontSize: "18px",
                  color: "#495057",
                  lineHeight: "1.8",
                }}
              >
                سیستمی برای اندازه‌گیری مصرف سوخت، مکان‌یابی، دور موتور و ارسال
                خودکار داده‌ها هر یک ساعت
              </p>
              <div className="d-flex gap-3">
                <button
                  className="btn-custom-green"
                  style={{
                    background: "linear-gradient(135deg, #66bb6a, #4CAF50)",
                    boxShadow: "0 4px 15px rgba(102, 187, 106, 0.3)",
                  }}
                >
                  مشاهده امکانات
                </button>
                <button
                  className="btn-custom-outline"
                  style={{
                    background: "transparent",
                    color: "#495057",
                    border: "2px solid #495057",
                  }}
                >
                  شروع کنید
                </button>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div
                style={{
                  height: "400px",
                  overflow: "hidden",
                  borderRadius: "15px",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #dee2e6",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                }}
              >
                <img
                  src={BannerPic}
                  alt="ویدا سنس - سیستم پایش تراکتور"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        ref={aboutRef}
        className={`py-5 fade-in ${aboutVisible ? "visible" : ""}`}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="fw-bold mb-4" style={{ color: "#4CAF50" }}>
                ویدا سنس چیست؟
              </h2>
              <p style={{ fontSize: "16px", lineHeight: "1.8", color: "#333" }}>
                ویدا سنس یک ابزار هوشمند برای مدیریت و پایش تراکتورهای کشاورزی
                است که با نصب بر روی تراکتور، به صورت خودکار اطلاعات مصرف سوخت،
                موقعیت جغرافیایی، دور موتور و سایر پارامترهای مهم را ثبت و هر یک
                ساعت یکبار به سرور ارسال می‌کند. این سیستم روزانه ۲۴ گزارش دقیق
                ارائه می‌دهد که به کشاورزان کمک می‌کند تا هزینه‌های خود را
                مدیریت کنند، از هدررفت سوخت جلوگیری کنند و بهره‌وری ماشین‌آلات
                خود را افزایش دهند.
              </p>
            </div>
            <div className="col-lg-6">
              <div
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  height: "400px",
                }}
              >
                <AnimatedFuelChart isVisible={aboutVisible} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section
        ref={problemsRef}
        className={`py-5 fade-in ${problemsVisible ? "visible" : ""}`}
        style={{ background: "#f8f9fa" }}
      >
        <div className="container">
          <h2 className="text-center fw-bold mb-5" style={{ color: "#4CAF50" }}>
            مشکلاتی که ویداسنس حل می‌کند
          </h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="feature-card hover-lift text-center">
                <div className="feature-icon">⛽</div>
                <h5 className="fw-bold mb-3">هدررفت سوخت</h5>
                <p style={{ color: "#666" }}>
                  عدم اطلاع دقیق از میزان مصرف سوخت و هدررفت آن
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card hover-lift text-center">
                <div className="feature-icon">📍</div>
                <h5 className="fw-bold mb-3">ناشناخته بودن مسیر</h5>
                <p style={{ color: "#666" }}>
                  عدم اطلاع از مسیر حرکت و موقعیت دقیق تراکتور
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card hover-lift text-center">
                <div className="feature-icon">⏱️</div>
                <h5 className="fw-bold mb-3">ثبت نادرست ساعات کار</h5>
                <p style={{ color: "#666" }}>
                  عدم ثبت صحیح ساعات کارکرد واقعی تراکتور
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card hover-lift text-center">
                <div className="feature-icon">📊</div>
                <h5 className="fw-bold mb-3">فقدان سوابق مصرف</h5>
                <p style={{ color: "#666" }}>
                  عدم دسترسی به گزارش‌های تاریخی و تحلیل عملکرد
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className={`py-5 fade-in ${featuresVisible ? "visible" : ""}`}
      >
        <div className="container">
          <h2 className="text-center fw-bold mb-5" style={{ color: "#4CAF50" }}>
            چرا ویداسنس؟
          </h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="feature-card hover-lift">
                <div className="feature-icon">⚡</div>
                <h5 className="fw-bold mb-3">محاسبه دقیق مصرف سوخت</h5>
                <p style={{ color: "#666" }}>
                  ثبت و محاسبه دقیق میزان مصرف سوخت در هر بازه زمانی
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card hover-lift">
                <div className="feature-icon">🗺️</div>
                <h5 className="fw-bold mb-3">موقعیت‌یابی دقیق تراکتور</h5>
                <p style={{ color: "#666" }}>
                  ردیابی لحظه‌ای موقعیت و مسیر حرکت تراکتور
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card hover-lift">
                <div className="feature-icon">🔄</div>
                <h5 className="fw-bold mb-3">ارسال داده هر یک ساعت</h5>
                <p style={{ color: "#666" }}>
                  به‌روزرسانی خودکار اطلاعات ۲۴ بار در شبانه‌روز
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card hover-lift">
                <div className="feature-icon">📈</div>
                <h5 className="fw-bold mb-3">گزارش‌های جامع</h5>
                <p style={{ color: "#666" }}>
                  نمایش گزارش‌های دقیق روزانه، هفتگی و ماهیانه
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card hover-lift">
                <div className="feature-icon">⚙️</div>
                <h5 className="fw-bold mb-3">نمایش دور موتور</h5>
                <p style={{ color: "#666" }}>
                  پایش RPM و عملکرد موتور در زمان واقعی
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="feature-card hover-lift">
                <div className="feature-icon">💰</div>
                <h5 className="fw-bold mb-3">کاهش هزینه و افزایش بهره‌وری</h5>
                <p style={{ color: "#666" }}>
                  مدیریت بهینه منابع و کاهش هزینه‌های عملیاتی
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={howItWorksRef}
        className={`py-5 fade-in ${howItWorksVisible ? "visible" : ""}`}
        style={{ background: "#f8f9fa" }}
      >
        <div className="container">
          <h2 className="text-center fw-bold mb-5" style={{ color: "#4CAF50" }}>
            نحوه کار
          </h2>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="timeline-step hover-lift text-center">
                <div className="timeline-number">۱</div>
                <div
                  className="placeholder-image mb-3"
                  style={{ height: "150px" }}
                >
                  <div>
                    <svg width="60" height="60" fill="#999" viewBox="0 0 16 16">
                      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                    </svg>
                  </div>
                </div>
                <h5 className="fw-bold mb-3">نصب دستگاه روی تراکتور</h5>
                <p style={{ color: "#666" }}>
                  نصب آسان و سریع دستگاه ویداسنس بر روی تراکتور شما
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="timeline-step hover-lift text-center">
                <div className="timeline-number">۲</div>
                <div
                  className="placeholder-image mb-3"
                  style={{ height: "150px" }}
                >
                  <div>
                    <svg width="60" height="60" fill="#999" viewBox="0 0 16 16">
                      <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3zM6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
                    </svg>
                  </div>
                </div>
                <h5 className="fw-bold mb-3">جمع‌آوری هوشمند داده‌ها</h5>
                <p style={{ color: "#666" }}>
                  ثبت خودکار و هوشمند تمامی اطلاعات مهم تراکتور
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="timeline-step hover-lift text-center">
                <div className="timeline-number">۳</div>
                <div
                  className="placeholder-image mb-3"
                  style={{ height: "150px" }}
                >
                  <div>
                    <svg width="60" height="60" fill="#999" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" />
                    </svg>
                  </div>
                </div>
                <h5 className="fw-bold mb-3">ارسال خودکار به سرور</h5>
                <p style={{ color: "#666" }}>
                  ارسال ۲۴ گزارش در روز به سرور و دسترسی آنلاین به داده‌ها
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5" style={{ background: "#000", color: "white" }}>
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4 mb-md-0">
              <h5 className="fw-bold mb-3" style={{ color: "#4CAF50" }}>
                ویدا سنس
              </h5>
              <p style={{ color: "#ccc" }}>
                سیستم هوشمند پایش و مدیریت تراکتورهای کشاورزی
              </p>
            </div>
            <div className="col-md-4 mb-4 mb-md-0">
              <h5 className="fw-bold mb-3" style={{ color: "#4CAF50" }}>
                لینک‌های مفید
              </h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a
                    href="#a"
                    style={{ color: "#ccc", textDecoration: "none" }}
                  >
                    صفحه اصلی
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#about"
                    style={{ color: "#ccc", textDecoration: "none" }}
                  >
                    درباره ما
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#a"
                    style={{ color: "#ccc", textDecoration: "none" }}
                  >
                    امکانات
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#contact"
                    style={{ color: "#ccc", textDecoration: "none" }}
                  >
                    تماس با ما
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="fw-bold mb-3" style={{ color: "#4CAF50" }}>
                تماس با ما
              </h5>
              <p style={{ color: "#ccc" }}>
                📧 info@vidasense.com
                <br />
                📞 ۰۲۱-۱۲۳۴۵۶۷۸
                <br />
                📍 تهران، ایران
              </p>
            </div>
          </div>
          <hr style={{ borderColor: "#444", margin: "30px 0" }} />
          <div className="text-center">
            <p className="mb-0" style={{ color: "#999" }}>
              © ۱۴۰۳ شرکت ویدا. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;