// src/pages/adminLogin.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './adminLogin.css';
// import AdminLoginBackground from "../assets/images/admin_login_background.jpg";
import JahadLogo from "../assets/images/logo.png";
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded credentials
    if (username === 'admin' && password === 'farm2025') {
      alert('به پنل مدیریتی خوش آمدید!');
      // Redirect or set auth state here
      navigate('/dashboard', {replace: true});
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است!');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="card login-card shadow-lg p-4">
          <div className="card-body">
            <div className="text-center mb-4">
              <img
                src={JahadLogo}
                alt="Tractor"
                width={100}
                height={100}
                className="mb-3"
              />
              <h2 className="text-success fw-bold">ورود به پنل ادمین</h2>
              <p className="text-muted">برای بازدید پنل لطفا وارد شوید.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label text-success fw-semibold">نام کاربری</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-success fw-semibold">رمز عبور</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="d-grid">
                <button type="submit" className="btn btn-success btn-lg">
                  ورود
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;