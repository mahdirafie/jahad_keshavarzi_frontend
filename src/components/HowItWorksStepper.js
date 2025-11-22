import React from "react";
import { motion } from "framer-motion";
import "./HowItWorksStepper.css";

const steps = [
  "ثبت‌نام در سامانه",
  "سفارش دستگاه در سامانه",
  "ارسال نصاب برای نصب دستگاه به آدرس ثبت‌شده",
  "جمع‌آوری هوشمند داده‌ها",
  "ارسال خودکار به سرور",
  "تهیه گزارش داده‌ها در بازه‌های مختلف"
];

export default function HowItWorksStepper({ refProp, visible }) {
  return (
    <section 
      className="howitworks-section"
      ref={refProp}
    >
      <motion.h2 
        className="howitworks-title"
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        مراحل کار با ویداسنس
      </motion.h2>

      <div className="stepper-container">
        {steps.map((step, index) => (
          <motion.div 
            className="step-item" 
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ 
              duration: 0.5,
              delay: visible ? index * 0.1 : 0,
              ease: "easeOut"
            }}
          >
            <motion.div 
              className="step-icon"
              initial={{ scale: 0 }}
              animate={visible ? { scale: 1 } : { scale: 0 }}
              transition={{ 
                duration: 0.4,
                delay: visible ? index * 0.1 + 0.2 : 0,
                ease: "backOut"
              }}
            >
              {index + 1}
            </motion.div>
            
            {index !== steps.length - 1 && (
              <div className="step-connector" />
            )}

            <div className="step-content">
              <div className="step-text">
                {step}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}