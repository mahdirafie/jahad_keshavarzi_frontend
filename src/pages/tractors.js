import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const TractorsPage = () => {
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ model: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const observerRef = useRef(null);

  // Get auth token from localStorage
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    fetchTractors();
    setupIntersectionObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const setupIntersectionObserver = () => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, entry.target.dataset.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
  };

  const fetchTractors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/tractor/by_user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
      
      const data = await response.json();
      setTractors(data.tractors || []);
    } catch (err) {
      setError(err.message);
      // Mock data for demonstration
      setTractors([
        { _id: '1', model: 'جان دیر 6120', city: 'تهران', createdAt: new Date().toISOString() },
        { _id: '2', model: 'مسی فرگوسن 285', city: 'اصفهان', createdAt: new Date().toISOString() },
        { _id: '3', model: 'نیوهالند T6', city: 'شیراز', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTractor = async () => {
    if (!formData.model || !formData.city) return;

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:4000/tractor/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: formData.model,
          city: formData.city
        })
      });

      if (!response.ok) throw new Error('خطا در ثبت تراکتور');

      setShowModal(false);
      setFormData({ model: '', city: '' });
      setVisibleItems(new Set());
      await fetchTractors();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toPersianDigits = (num) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianDigits[d]);
  };

  const formatPersianDate = (dateString) => {
    const date = new Date(dateString);
    const year = toPersianDigits(date.getFullYear());
    const month = toPersianDigits(date.getMonth() + 1);
    const day = toPersianDigits(date.getDate());
    return `${year}/${month}/${day}`;
  };

  const observeElement = (element) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Tahoma, Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <style>{`
        * { direction: rtl; }
        
        .header {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 1rem 0;
        }

        .nav-link {
          color: white !important;
          margin: 0 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .nav-link:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }

        .nav-link.active {
          background: rgba(255,255,255,0.3);
          font-weight: bold;
        }

        .btn-auth {
          background: white;
          color: #4CAF50;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          margin: 0 0.25rem;
          font-weight: bold;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-auth:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .user-dropdown {
          position: relative;
        }

        .user-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .dropdown-menu-custom {
          position: absolute;
          top: 50px;
          left: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 0.5rem 0;
          min-width: 150px;
          animation: fadeIn 0.3s ease;
        }

        .dropdown-item-custom {
          padding: 0.75rem 1.5rem;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: right;
        }

        .dropdown-item-custom:hover {
          background: #f0f0f0;
        }

        .page-title {
          color: #4CAF50;
          font-size: 2rem;
          font-weight: bold;
          margin: 2rem 0 1rem 0;
        }

        .btn-add {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: bold;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(76,175,80,0.3);
        }

        .btn-add:hover {
          background: #45a049;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(76,175,80,0.4);
        }

        .tractor-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(30px);
          margin-bottom: 1.5rem;
        }

        .tractor-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .tractor-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .tractor-model {
          font-size: 1.25rem;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 0.5rem;
        }

        .tractor-info {
          color: #666;
          margin: 0.25rem 0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        .modal-content-custom {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          animation: slideUp 0.3s ease;
        }

        .form-control-custom {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          font-family: Tahoma, Arial, sans-serif;
        }

        .form-control-custom:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76,175,80,0.1);
        }

        .loading-spinner {
          text-align: center;
          padding: 3rem;
          color: #4CAF50;
          font-size: 1.5rem;
        }

        .error-message {
          text-align: center;
          padding: 2rem;
          color: #f44336;
          background: #ffebee;
          border-radius: 8px;
          margin: 2rem 0;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #999;
          font-size: 1.25rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .page-title { font-size: 1.5rem; }
          .nav-link { margin: 0.25rem; padding: 0.5rem; font-size: 0.9rem; }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <nav className="d-flex align-items-center">
              <a href="/" className="nav-link">صفحه اصلی</a>
              <a href="/tractors" className="nav-link active">تراکتورها</a>
              <a href="/about" className="nav-link">درباره ما</a>
              <a href="/contact" className="nav-link">تماس با ما</a>
            </nav>

            <div>
              {isLoggedIn ? (
                <div className="user-dropdown">
                  <div className="user-icon" onClick={() => setShowDropdown(!showDropdown)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#4CAF50">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  {showDropdown && (
                    <div className="dropdown-menu-custom">
                      <button className="dropdown-item-custom">پروفایل</button>
                      <button className="dropdown-item-custom">تراکتورها</button>
                      <button className="dropdown-item-custom" onClick={() => setIsLoggedIn(false)}>خروج</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="btn-auth">ورود</button>
                  <button className="btn-auth">ثبت‌نام</button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="page-title">تراکتورهای من</h1>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            افزودن تراکتور جدید
          </button>
        </div>

        {loading && (
          <div className="loading-spinner">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
            <p className="mt-3">در حال بارگذاری...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-message">
            خطا در دریافت اطلاعات: {error}
          </div>
        )}

        {!loading && !error && tractors.length === 0 && (
          <div className="empty-state">
            تراکتوری یافت نشد
          </div>
        )}

        {!loading && !error && tractors.length > 0 && (
          <div className="row">
            {tractors.map((tractor, index) => (
              <div key={tractor._id} className="col-12 col-md-6 col-lg-4">
                <div
                  ref={(el) => observeElement(el)}
                  data-id={tractor._id}
                  className={`tractor-card ${visibleItems.has(tractor._id) ? 'visible' : ''}`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="tractor-model">{tractor.model}</div>
                  <div className="tractor-info">
                    <strong>شهر:</strong> {tractor.city}
                  </div>
                  <div className="tractor-info">
                    <strong>تاریخ ثبت:</strong> {formatPersianDate(tractor.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content-custom">
            <h3 style={{ color: '#4CAF50', marginBottom: '1.5rem' }}>افزودن تراکتور جدید</h3>
            <div>
              <input
                type="text"
                className="form-control-custom"
                placeholder="مدل تراکتور"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
              <input
                type="text"
                className="form-control-custom"
                placeholder="شهر"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <div className="d-flex gap-2">
                <button onClick={handleCreateTractor} className="btn-add flex-grow-1" disabled={submitting}>
                  {submitting ? 'در حال ثبت...' : 'ثبت تراکتور'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-auth"
                  style={{ background: '#f5f5f5', color: '#666' }}
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TractorsPage;