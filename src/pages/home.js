import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import BannerPic from "../assets/images/banner.jpg";
import TractorLandingPic from "../assets/images/tractor_landing.jpeg";
import VidaBrainAnim from "../components/VidaBrain";
import "./home.css";
import { motion } from "framer-motion";

import Header from "../components/Header";

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
import Footer from "../components/Footer";
import HowItWorksStepper from "../components/HowItWorksStepper";
import { useNavigate } from "react-router-dom";

const features = [
  "محاسبه دقیق مصرف سوخت: ثبت و محاسبه دقیق میزان مصرف سوخت در هر بازه زمانی",
  "موقعیت‌یابی دقیق تراکتور: ردیابی لحظه‌ای موقعیت و مسیر حرکت تراکتور",
  "ارسال داده هر یک ساعت: به‌روزرسانی خودکار اطلاعات ۲۴ بار در شبانه‌روز",
  "گزارش‌های جامع: نمایش گزارش‌های دقیق روزانه، هفتگی و ماهیانه",
  "نمایش دور موتور: پایش RPM و عملکرد موتور در زمان واقعی",
  "کاهش هزینه و افزایش بهره‌وری: مدیریت بهینه منابع و کاهش هزینه‌های عملیاتی",
];

const listItemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.3, duration: 0.6, ease: "easeOut" },
  }),
};

const AnimatedFuelChart = ({ isVisible }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (isVisible) {
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

  return (
    <div className="fuel-chart-card">
      <h5 className="fuel-chart-title">مصرف سوخت هفتگی</h5>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            className="fuel-chart-xaxis"
            angle={0}
            textAnchor="middle"
          />
          <YAxis
            className="fuel-chart-yaxis"
            domain={[30, 70]}
            label={{
              value: "لیتر",
              angle: -90,
              position: "insideLeft",
              className: "fuel-chart-label",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Line
            type="monotone"
            dataKey="fuelUsage"
            stroke="var(--color-special)"
            strokeWidth={4}
            className="fuel-chart-line-gradient"
            dot={{ className: "fuel-chart-dot" }}
            activeDot={{ className: "fuel-chart-active-dot" }}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="fuel-chart-average">
        <small>
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

/* Custom Tooltip Component */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="fuel-chart-tooltip">
        <div style={{ textAlign: "right", direction: "rtl" }}>
          <strong style={{ color: "var(--color-special)" }}>
            روز: {label}
          </strong>
        </div>
        <div style={{ textAlign: "right", direction: "rtl" }}>
          <span style={{ color: "var(--color-special)", fontWeight: "bold" }}>
            {payload[0].value} لیتر
          </span>{" "}
          مصرف سوخت
        </div>
      </div>
    );
  }
  return null;
};

/* Custom Legend Component */
const CustomLegend = () => (
  <div className="fuel-chart-legend">
    <span style={{ color: "var(--color-special)" }}>مصرف سوخت</span>
  </div>
);

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
      { threshold: 0.3 }
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
  // Animation refs for sections
  const [heroRef, heroVisible] = useInViewAnimation();
  const [aboutRef, aboutVisible] = useInViewAnimation();
  const [problemsRef, problemsVisible] = useInViewAnimation();
  const [featuresRef, featuresVisible] = useInViewAnimation();
  const [howItWorksRef, howItWorksVisible] = useInViewAnimation();

  const navigate = useNavigate();

  console.log(process.env);

  return (
    <div style={{ fontFamily: "Tahoma, Arial, sans-serif" }}>
      {/* Header */}
      <Header behavior={true}/>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`hero-section fade-in ${heroVisible ? "visible" : ""}`}
      >
        {/* Optional: Subtle decorative element */}
        <div className="hero-decor"></div>

        <div className="container position-relative hero-content">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold hero-title">
                وی پایش؛ نسل جدید پایش هوشمند تراکتور
              </h1>
              <p className="lead hero-subtitle">
                سیستمی برای اندازه‌گیری مصرف سوخت، مکان‌یابی، دور موتور و ارسال
                خودکار داده‌ها هر یک ساعت
              </p>
              <button onClick={() => {
                if(localStorage.getItem("authToken")) {
                  navigate("/machines")
                } else {
                  navigate("/signup")
                }
              }} className="btn-custom-outline">سفارش دهید</button>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div className="landing-img-container">
                <img
                  className="landing-img"
                  src={TractorLandingPic}
                  alt="وی پایش - سیستم پایش تراکتور"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Device Section */}
      <section
        id="about-device"
        ref={aboutRef}
        className={`about-device-section fade-in ${
          aboutVisible ? "visible" : ""
        }`}
      >
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="about-device-title fw-bold mb-4">
                وی پایش چیست؟
              </h2>
              <p className="about-device-text">
                وی پایش یک ابزار هوشمند برای مدیریت و پایش تراکتورهای کشاورزی
                است که با نصب بر روی تراکتور، به صورت خودکار اطلاعات مصرف سوخت،
                موقعیت جغرافیایی، دور موتور و سایر پارامترهای مهم را ثبت و هر یک
                ساعت یکبار به سرور ارسال می‌کند. این سیستم روزانه ۲۴ گزارش دقیق
                ارائه می‌دهد که به کشاورزان کمک می‌کند تا هزینه‌های خود را
                مدیریت کنند، از هدررفت سوخت جلوگیری کنند و بهره‌وری ماشین‌آلات
                خود را افزایش دهند.
              </p>
            </div>
            <div className="col-lg-6">
              <AnimatedFuelChart isVisible={aboutVisible} />
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section
        ref={problemsRef}
        className={`problems-section fade-in ${
          problemsVisible ? "visible" : ""
        }`}
      >
        <div className="container">
          <h2 className="problems-title text-center mb-5">
            مشکلاتی که وی پایش حل می‌کند
          </h2>

          <div className="row g-4">
            {[
              {
                title: "هدررفت سوخت",
                text: "عدم اطلاع دقیق از میزان مصرف سوخت و هدررفت آن",
              },
              {
                title: "ناشناخته بودن مسیر",
                text: "عدم اطلاع از مسیر حرکت و موقعیت دقیق تراکتور",
              },
              {
                title: "ثبت نادرست ساعات کار",
                text: "عدم ثبت صحیح ساعات کارکرد واقعی تراکتور",
              },
              {
                title: "فقدان سوابق مصرف",
                text: "عدم دسترسی به گزارش‌های تاریخی و تحلیل عملکرد",
              },
            ].map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="feature-card-hover">
                  <div className="feature-decoration"></div>
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="feature-text">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why VidaSense Section */}
      <section
        ref={featuresRef}
        className={`why-vida-section fade-in ${
          featuresVisible ? "visible" : ""
        }`}
      >
        <div className="container">
          <h2 className="why-vida-title text-center">چرا وی پایش؟</h2>

          <div className="row align-items-center">
            {/* Right column: List (RTL) */}
            <div className="col-lg-6 order-lg-1 order-2">
              <ul className="features-list">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    custom={index}
                    initial="hidden"
                    animate={featuresVisible ? "visible" : "hidden"}
                    variants={listItemVariants}
                  >
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Left column: Animation */}
            <div className="col-lg-6 order-lg-2 order-1 mb-4 mb-lg-0">
              <VidaBrainAnim />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksStepper refProp={howItWorksRef} visible={howItWorksVisible}/>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
