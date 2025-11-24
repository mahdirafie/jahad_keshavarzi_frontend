import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  FaWhatsapp, 
  FaTelegram, 
  FaInstagram, 
  // FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';
import './ContactUs.css';

const ContactUs = () => {
  const handleSocialClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="contact-us-container">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="hero-content">
            <h1>تماس با ما</h1>
            <p>ما همیشه آماده پاسخگویی به شما هستیم</p>
          </div>
        </section>

        {/* Main Content */}
        <section className="contact-main">
          <div className="contact-intro">
            <p className="intro-text">
            در ویدا، ارتباط با مشتریان یک اولویت است. تیم پشتیبانی ما در ساعات کاری آماده پاسخگویی سریع و دقیق به سوالات، پیشنهادها و درخواست‌های شماست.
            </p>
            <p className="intro-text">
            از طریق راه‌های ارتباطی زیر می‌توانید با ما در ارتباط باشید و تجربه‌ای مطمئن از خرید و خدمات را با ما رقم بزنید.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="contact-methods-grid">
            <div className="contact-card">
              <FaPhone className="contact-icon" />
              <h3>تماس مستقیم</h3>
              <p>شنبه تا پنجشنبه - ۹ صبح تا ۵ عصر</p>
              <div className="contact-info">
                <p>09991660196</p>
                <p>09188931775</p>
                <p>09217357668</p>
              </div>
            </div>

            <div className="contact-card">
              <FaEnvelope className="contact-icon" />
              <h3>ایمیل</h3>
              <p>پاسخگویی در کمتر از ۲۴ ساعت</p>
              <div className="contact-info">
                <p>vida.shop1399@gmail.com</p>
              </div>
            </div>

            <div className="contact-card">
              <FaMapMarkerAlt className="contact-icon" />
              <h3>آدرس دفتر مرکزی</h3>
              <p>ساعات بازدید: ۹ صبح تا ۴ عصر</p>
              <div className="contact-info">
                <p>تهران، مشریه، خیابان صالحی</p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="social-media-section">
            <h2>ما را در شبکه‌های اجتماعی دنبال کنید</h2>
            <div className="social-grid">
              <button 
                className="social-button whatsapp"
                onClick={() => handleSocialClick('https://wa.me/message/A3JKZLQPPBHJG1')}
              >
                <FaWhatsapp className="social-icon" />
                <span>واتس‌اپ</span>
              </button>

              <button 
                className="social-button telegram"
                onClick={() => handleSocialClick('https://t.me/vida_sup')}
              >
                <FaTelegram className="social-icon" />
                <span>تلگرام</span>
              </button>

              <button 
                className="social-button instagram"
                onClick={() => handleSocialClick('https://www.instagram.com/vida_lights?igsh=MXVla3JlY2Uzc3AyYw==')}
              >
                <FaInstagram className="social-icon" />
                <span>اینستاگرام</span>
              </button>

              {/* <button 
                className="social-button linkedin"
                onClick={() => handleSocialClick('https://linkedin.com/company/vida')}
              >
                <FaLinkedin className="social-icon" />
                <span>لینکدین</span>
              </button> */}
            </div>
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            <h2>ساعات کاری</h2>
            <div className="working-hours">
              <div className="hours-row">
                <span>شنبه تا چهارشنبه</span>
                <span dir='ltr'>۹:۰۰ - ۱٩:۰۰</span>
              </div>
              <div className="hours-row">
                <span>پنجشنبه</span>
                <span dir='ltr'>۹:۰۰ - ۱۶:۰۰</span>
              </div>
              <div className="hours-row">
                <span>جمعه</span>
                <span>تعطیل</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;