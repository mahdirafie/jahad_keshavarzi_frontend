import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import AboutUs from "./pages/AboutUs";
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
import MachineryPage from "./pages/MachineryPage";
import ContactUs from "./pages/ContactUs";
import Guide from "./pages/Guide";
import CompleteProfile from "./pages/completeProfile";
import VerfityPayment from "./pages/VerfityPayment";

export default function App() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
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
      <Route path="/aboutus" element={< AboutUs/>} />
      <Route path="/contactus" element={< ContactUs/>} />
      <Route path="/guide" element={< Guide/>} />
      <Route path="/complete-profile" element={< CompleteProfile/>} />
      <Route path="/machines" element={<MachineryPage />} />
      <Route path="/verify-payment" element={<VerfityPayment />} />
      <Route path="/tractor/:tractorId" element={<TractorDetailPage />} />
    </Routes>
  );
}
