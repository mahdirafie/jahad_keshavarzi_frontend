import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import AboutUs from "./pages/AboutUs";
import DashboardLoginPage from "./pages/DashboardLogin";
import DashboardLayout from "./pages/DashboardLayout";
import AdminsPage from "./pages/AdminsPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import ReadyToInstallPage from "./pages/ReadyToInstallPage";
import InstalledOrdersPage from "./pages/InstalledOrdersPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ReportsPage from "./pages/ReportsPage";
import DeviceAnalyticsPage from "./pages/DeviceAnalyticsPage";
import SystemConfigPage from "./pages/SystemConfigPage";
import OverviewPage from "./pages/OverviewPage";

import { Routes, Route, Navigate } from "react-router-dom";
import DashBoardPage from "./pages/dashboard";
import TractorDetailPage from "./pages/TractorDetail";
import SignUpPage from "./pages/signup";
import OTPPage from "./pages/OTPCard";
import PasswordPage from "./pages/password";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";
import MachineryPage from "./pages/MachineryPage";
import ContactUs from "./pages/ContactUs";
import Guide from "./pages/Guide";
import CompleteProfile from "./pages/completeProfile";
import VerifyPayment from "./pages/VerifyPayment";
import UserOrders from "./pages/userOrders";
import ForgotPasswordPage from "./pages/ForgotPassword/ForgotPasswordPage";
import ForgotOTPPage from "./pages/ForgotPassword/ForgotOTPPage";
import ResetPasswordPage from "./pages/ForgotPassword/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/otp" element={<OTPPage />} />
      <Route path="/password" element={<PasswordPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/contactus" element={<ContactUs />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/machines" element={<MachineryPage />} />
      <Route path="/verify-payment" element={<VerifyPayment />} />
      <Route path="/tractor/:tractorId" element={<TractorDetailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot-otp" element={<ForgotOTPPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin dashboard — login stands alone (no layout) */}
      <Route path="/dashboard/login" element={<DashboardLoginPage />} />

      {/* Admin dashboard — all protected pages share DashboardLayout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="userorders" element={<UserOrders />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="ready-to-install" element={<ReadyToInstallPage />} />
        <Route path="installed-orders" element={<InstalledOrdersPage />} />
        <Route path="my-orders" element={<MyOrdersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="device-analytics/:deviceId" element={<DeviceAnalyticsPage />} />
        <Route path="system-config" element={<SystemConfigPage />} />
        {/* Legacy tractor overview kept under its own sub-path */}
        <Route path="tractors" element={<DashBoardPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
