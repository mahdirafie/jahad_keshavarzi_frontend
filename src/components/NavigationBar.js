import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineShop,
} from "react-icons/ai";
import "./NavigationBar.css";
import useCustomSnackbar from "../hooks/useSnackBar";

const NavigationBar = ({ onCartClick, onProfileClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const { showSnackbar } = useCustomSnackbar();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-nav">
      <div
        className={`nav-item ${isActive("/") ? "active" : ""}`}
        onClick={() => navigate("/")}
      >
        <AiOutlineHome className="nav-icon" />
      </div>

      <div
        className={`nav-item ${isActive("/shop") ? "active" : ""}`}
        onClick={() => navigate("/shop")}
      >
        <AiOutlineShop className="nav-icon" />
      </div>

      <div className="nav-item" onClick={() => {
        if (isLoggedIn) {
          onCartClick();
        } else {
          showSnackbar("برای دسترسی به سبد خرید، لطفاً وارد حساب کاربری خود شوید.", "info");
          navigate("/login");
        }
      }}>
        <div className="cart-icon-container">
          <AiOutlineShoppingCart className="nav-icon" />
          {/* {cartItems.length > 0 && (
            <div className="cart-quantity">
              {cartItems.length}
            </div>
          )} */}
        </div>
      </div>

      <div
        className="nav-item"
        onClick={() => {
          if (isLoggedIn) {
            onProfileClick();
          } else {
            showSnackbar("برای دسترسی به حساب کاربری، لطفاً وارد حساب کاربری خود شوید.", "info");
            navigate("/login");
          }
        }}
      >
        <AiOutlineUser className="nav-icon" />
      </div>
    </nav>
  );
};

export default NavigationBar;
