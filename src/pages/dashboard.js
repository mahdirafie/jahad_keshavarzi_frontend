// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Table, Badge, Spinner, Button } from "react-bootstrap";
import { IoLogOut, IoGrid, IoMenu, IoClose } from "react-icons/io5";
import BASE_URL from "../common/baseUrl";
import Map from "../components/Map";
import "./dashboard.css";

import { useNavigate } from "react-router-dom";

import JahadLogo from "../assets/images/logo.png";

export default function DashboardPage({ onLogout }) {
  const [tractors, setTractors] = useState([]);
  const [cities, setCities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTractorData();
  }, []);

  const fetchTractorData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/tractor/info_all`);
      if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
      const data = await res.json();
      setTractors(data.tractors ?? []);
      setCities(data.cities ?? {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Intl.DateTimeFormat("fa-IR").format(new Date(d));

  return (
    <div className={`dashboard-wrapper ${!drawerOpen ? "drawer-closed" : ""}`}>
      {/* Mobile Header */}
      <div className="mobile-header">
        <Button
          variant="link"
          className="menu-toggle"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          {drawerOpen ? <IoClose /> : <IoMenu />}
        </Button>
        <h5>پنل مدیریت تراکتورها</h5>
      </div>

      {/* Sidebar Drawer */}
      <aside className={`sidebar-drawer ${drawerOpen ? "open" : "closed"}`}>
        <header className="drawer-header">
          <div className="logo-section">
            <img src={JahadLogo} width={75} height={75} alt="logo"/>
            <div className="logo-text">
              <h5>پنل مدیریت</h5>
              <small>سامانه مدیریت تراکتورها</small>
            </div>
          </div>
        </header>

        <nav className="drawer-nav">
          <Button className="nav-btn active">
            <IoGrid className="nav-icon" />
            <span>نمای کلی</span>
          </Button>

          <Button
            className="nav-btn logout-btn"
            onClick={() => setShowLogoutDialog(true)}
          >
            <IoLogOut className="nav-icon" />
            <span>خروج</span>
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="container-fluid">
          <div className="page-header">
            <h1>نمای کلی تراکتورهای استان مرکزی</h1>
            <p>مشاهده و مدیریت اطلاعات تراکتورها</p>
          </div>

          {loading && (
            <div className="loading-center">
              <Spinner animation="border" variant="primary" />
              <p>در حال دریافت اطلاعات...</p>
            </div>
          )}

          {error && (
            <div className="error-alert">
              <span>{error}</span>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={fetchTractorData}
              >
                تلاش مجدد
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Stats + Map Section */}
              <Row className="stats-section justify-content-between">
                <Col lg={8}>
                  <div className="modern-card stats-card">
                    <div className="card-header">
                      <div className="stats-icon">🚜</div>
                      <div className="stats-info">
                        <h3>{tractors.length}</h3>
                        <span>تراکتور فعال</span>
                      </div>
                    </div>

                    <div className="distribution-section">
                      <h6>توزیع جغرافیایی</h6>
                      <div className="cities-badges">
                        {Object.entries(cities).map(([city, cnt]) => (
                          <Badge key={city} className="city-badge">
                            {city} <span>({cnt})</span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="tip-box">
                      <strong>💡 نکته:</strong> سامانه به شما امکان مشاهده
                      لحظه‌ای وضعیت تمامی تراکتورها را می‌دهد.
                    </div>
                  </div>
                </Col>

                <Col
                  lg={4}
                  className="d-flex justify-content-center align-items-center"
                >
                  <Map cities={cities} />
                </Col>
              </Row>

              {/* Table Section */}
              <div className="modern-card table-card">
                <div className="card-title">
                  <h5>لیست تراکتورها</h5>
                </div>

                {tractors.length === 0 ? (
                  <div className="empty-state">
                    <p>هیچ تراکتوری ثبت نشده است</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <Table hover className="modern-table">
                      <thead>
                        <tr>
                          <th>ردیف</th>
                          <th>مدل</th>
                          <th>کد ملی</th>
                          <th>شهر</th>
                          <th>تاریخ ثبت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tractors.map((t, i) => (
                          <tr
                            onClick={() => {
                              navigate(`/tractor/${t.id}`);
                            }}
                            key={t.id}
                          >
                            <td className="row-number">{i + 1}</td>
                            <td className="model-cell">{t.model}</td>
                            <td className="national-code">{t.national_code}</td>
                            <td>
                              <Badge className="city-table-badge">
                                {t.city}
                              </Badge>
                            </td>
                            <td className="date-cell">
                              {formatDate(t.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutDialog && (
        <div
          className="modal-overlay"
          onClick={() => setShowLogoutDialog(false)}
        >
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h6>تأیید خروج</h6>
            </div>
            <div className="modal-body">
              <p>آیا مطمئن هستید که می‌خواهید خارج شوید؟</p>
            </div>
            <div className="modal-footer">
              <Button
                variant="outline-secondary"
                onClick={() => setShowLogoutDialog(false)}
              >
                انصراف
              </Button>
              <Button
                variant="danger"
                className="logout-confirm-btn"
                onClick={() => {
                  setShowLogoutDialog(false);
                  onLogout?.();
                }}
              >
                خروج
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
