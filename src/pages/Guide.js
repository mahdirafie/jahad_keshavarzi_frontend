import React from "react";
import { motion } from "framer-motion";
import "./Guide.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

const steps = [
  {
    title: "ثبت‌نام در سامانه",
    description: "ابتدا در سامانه ویداسنس ثبت‌نام کنید. این فرآیند تنها چند دقیقه زمان می‌برد و پس از تایید شماره و کد ملی حساب کاربری شما فعال می‌شود."
  },
  {
    title: "سفارش دستگاه در سامانه",
    description: "پس از ثبت‌نام، وارد پروفایل کاربری شده و به بخش 'تراکتورها' بروید. در این بخش می‌توانید تراکتورهایی که قصد نصب دستگاه روی آنها را دارید، تعریف و اضافه کنید. سپس با کلیک روی دکمه 'ثبت سفارش' به درگاه پرداخت متصل شده و پس از تکمیل پرداخت، سفارش شما نهایی می‌شود."
  },
  {
    title: "ارسال نصاب برای نصب دستگاه",
    description: "کارشناسان ما پس از بررسی سفارش، در اسرع وقت با شما تماس گرفته و هماهنگی‌های لازم را انجام می‌دهند. سپس نصاب‌های متخصص به آدرس ثبت‌شده در سامانه اعزام شده و فرآیند نصب دستگاه را انجام می‌دهند."
  },
  {
    title: "جمع‌آوری هوشمند داده‌ها",
    description: "پس از نصب، دستگاه به طور خودکار شروع به جمع‌آوری داده‌های مصرف سوخت، موقعیت جغرافیایی، دور موتور و سایر پارامترهای مهم تراکتور می‌کند."
  },
  {
    title: "ارسال خودکار به سرور",
    description: "دستگاه هر یک ساعت یکبار داده‌های جمع‌آوری شده را به صورت خودکار به سرور مرکزی ویداسنس ارسال می‌کند تا همیشه به اطلاعات به‌روز دسترسی داشته باشید."
  },
  {
    title: "تهیه گزارش داده‌ها در بازه‌های مختلف",
    description: "در پنل کاربری می‌توانید گزارش‌های دقیق روزانه، هفتگی و ماهیانه را مشاهده کنید. این گزارش‌ها به شما در مدیریت بهتر هزینه‌ها و افزایش بهره‌وری کمک می‌کنند."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const iconVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 12,
      duration: 0.5
    }
  }
};

export default function Guide() {
  return (
    <div className="guide-page">
        <Header/>
      {/* Header Section */}
      <section className="guide-header">
        <div className="container">
          <motion.h1 
            className="guide-main-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            راهنمای خرید و نصب دستگاه ویداسنس
          </motion.h1>
          <motion.p 
            className="guide-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            در کمتر از ۲۴ ساعت پس از ثبت سفارش، سفارش شما توسط کارشناسان ما بررسی میشود
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
          <motion.h2 
            className="guide-section-title"
            variants={itemVariants}
          >
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
                    <motion.div 
                      className="step-icon"
                      variants={iconVariants}
                    >
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
            <p>همین حالا ثبت‌نام کنید و اولین قدم برای مدیریت هوشمند تراکتورهای خود را بردارید</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">ثبت‌نام در سامانه</button>
              <button className="btn btn-outline">تماس با پشتیبانی</button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}