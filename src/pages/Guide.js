import React from "react";
import { motion } from "framer-motion";
import "./Guide.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    title: "ثبت‌نام در سامانه",
    description:
      "ابتدا در سامانه وی پایش ثبت‌نام کنید. این فرآیند تنها چند دقیقه زمان می‌برد و پس از تایید شماره و کد ملی حساب کاربری شما فعال می‌شود.",
  },
  {
    title: "سفارش دستگاه در سامانه",
    description:
      "پس از ثبت‌نام، وارد پروفایل کاربری شده و به بخش 'تراکتورها' بروید. در این بخش می‌توانید تراکتورهایی که قصد نصب دستگاه روی آنها را دارید، تعریف و اضافه کنید. سپس با کلیک روی دکمه 'ثبت سفارش' به درگاه پرداخت متصل شده و پس از تکمیل پرداخت، سفارش شما نهایی می‌شود.",
  },
  {
    title: "ارجاع به تکنسین نصب",
    description:
      "با ثبت هر سفارش کارشناسان ما بعد از بررسی و اخذ نوبت جهت فرایند نصب و اجرا در محل با شما تماس خواهند گرفت .",
  },
  {
    title: "شروع داده برداری",
    description:
      "دستگاه  از زمان نصب شروع به برداشت و ارسال داده مصرفی تراکتور یا کمباین شما  به مرکز مخابراتی می‌نماید",
  },
  {
    title: "محاسبه سوخت",
    description:
      "تمامی داده‌های مصرفی،موقعیت مکانی و زمانی تراکتور یا کمباین در بازه زمانی های مشخص تجزیه و تحلیل و مقدار سوخت مصرفی با دقت محاسبه و ذخیره می‌گردد.",
  },
  {
    title: "تهیه گزارش و تخصیص سوخت",
    description:
      "در انتهای هر دوره سوخت مصرف شده هر ماشین آلات محاسبه می‌شود ، این عدد مصرفی مبنای افزایش و یا تخصیص سوخت در دوره بعدی خواهد بود",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const iconVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 12,
      duration: 0.5,
    },
  },
};

export default function Guide() {
  const navigate = useNavigate();
  return (
    <div className="guide-page">
      <Header />
      {/* Header Section */}
      <section className="guide-header">
        <div className="container">
          <motion.h1
            className="guide-main-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            راهنمای خرید و نصب دستگاه وی پایش
          </motion.h1>
          <motion.p
            className="guide-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            در کمتر از ۲۴ ساعت پس از ثبت سفارش، سفارش شما توسط کارشناسان ما
            بررسی میشود
          </motion.p>
        </div>
      </section>

      {/* Stepper Section */}
      <motion.section
        className="guide-stepper-section"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container">
          <motion.h2 className="guide-section-title" variants={itemVariants}>
            مراحل خرید و نصب دستگاه
          </motion.h2>

          <div className="stepper-with-description">
            {steps.map((step, index) => (
              <motion.div
                className="step-container"
                key={index}
                variants={itemVariants}
              >
                <div className="step-content-wrapper">
                  {/* Step Number and Icon */}
                  <div className="step-left">
                    <motion.div className="step-icon" variants={iconVariants}>
                      {index + 1}
                    </motion.div>

                    {index !== steps.length - 1 && (
                      <div className="step-connector" />
                    )}
                  </div>

                  {/* Step Text Content */}
                  <div className="step-right">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="guide-cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3>آماده شروع هستید؟</h3>
            <p>
              همین حالا ثبت‌نام کنید و اولین قدم برای مدیریت هوشمند تراکتورهای
              خود را بردارید
            </p>
            <div className="cta-buttons">
              {localStorage.getItem("authToken") ? (
                <div></div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigate("/signup");
                  }}
                >
                  ثبت‌نام در سامانه
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={() => {
                  navigate("/contactus");
                }}
              >
                تماس با پشتیبانی
              </button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
