import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
// import AdminLoginPage from "./pages/adminLogin";

import { Routes, Route } from "react-router-dom";
import DashBoardPage from "./pages/dashboard";
import TractorDetailPage from "./pages/TractorDetail";
import { useNavigate } from "react-router-dom";
import SignUpPage from "./pages/signup";
import OTPPage from "./pages/OTPCard";
import PasswordPage from "./pages/password";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";
import TractorsPage from "./pages/tractors";

export default function App() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<SignUpPage />} />
      <Route
        path="/dashboard"
        element={
          <DashBoardPage
            onLogout={() => {
              navigate("/", { replace: true });
            }}
          />
        }
      />
      <Route path="/otp" element={<OTPPage />} />
      <Route path="/password" element={<PasswordPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/tractors" element={<TractorsPage />} />
      <Route path="/tractor/:tractorId" element={<TractorDetailPage />} />
    </Routes>
  );
}
