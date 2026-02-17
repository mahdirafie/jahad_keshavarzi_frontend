import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import NavigationBar from "./NavigationBar";
import { FaTractor } from "react-icons/fa";
import "./Header.css";

import useCustomSnackbar from "../hooks/useSnackBar";
import { FiClock } from "react-icons/fi";
import ConfirmModal from "../modals/ConfirmModal";
import ProfileModal from "../modals/ProfileModal";
import OrdersModal from "../modals/OrderModal";

// Profile icon component
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
    className="profile-icon-svg"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

// User icon
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
    className="dropdown-icon"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

// Logout icon
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
    className="dropdown-icon"
  >
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

export default function Header({ behavior }) {
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("authToken")
  );
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const { showSnackbar } = useCustomSnackbar();

  const navItemsRef = useRef([
    { title: "خانه", isChosen: true, path: "/" },
    { title: "درباره ما", isChosen: false, path: "/aboutus" },
    { title: "ارتباط با ما", isChosen: false, path: "/contactus" },
    { title: "راهنمای سامانه", isChosen: false, path: "/guide" },
  ]);

  const [navItems, setNavItems] = useState(navItemsRef.current);
  const [hasScrolledPastThreshold, setHasScrolledPastThreshold] = useState(
    behavior ? false : true
  );

  // Effects
  useEffect(() => {
    const checkTokenInStorage = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };

    checkTokenInStorage();
    window.addEventListener("storage", checkTokenInStorage);
    return () => window.removeEventListener("storage", checkTokenInStorage);
  }, []);

  useEffect(() => {
    const updatedNavItems = navItemsRef.current.map((item) => ({
      ...item,
      isChosen: item.path === location.pathname,
    }));
    setNavItems(updatedNavItems);
  }, [location.pathname]);

  const handleScroll = useCallback(() => {
    const shouldBeActive = window.scrollY > window.innerHeight;
    if (shouldBeActive !== hasScrolledPastThreshold) {
      setHasScrolledPastThreshold(shouldBeActive);
      setIsProfileMenuOpen(false);
    }
  }, [hasScrolledPastThreshold]);

  const behaviorRef = useRef(behavior);
  useEffect(() => {
    behaviorRef.current = behavior;
  }, [behavior]);

  useEffect(() => {
    if (!behaviorRef.current) return;
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleNavItemClick = (index) => {
    if (navItems[index].path) {
      navigate(navItems[index].path);
      setIsProfileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    showSnackbar("با موفقیت خارج شدید!", "success");
  };

  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleTractorsClick = () => {
    setIsProfileMenuOpen(false);
    navigate("/machines");
  };

  const handleAccountClick = async () => {
    try {
      setIsProfileModalOpen(true);
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // const handleCartClick = () => {
  //   setIsCartModalOpen(true);
  //   setIsProfileMenuOpen(false);
  // };

  // const handleCategoryClick = (category) => {
  //   navigate(`/product/${category.id}`);
  //   setIsMobileMenuOpen(false);
  // };

  return (
    <>
      {/* Desktop Header */}
      <div className="desktop-header">
        <div className="header-wrapper">
          <div
            className={
              hasScrolledPastThreshold
                ? "header-container"
                : "header-container1"
            }
          >
            <div className="nav-items non-selectable">
              {navItems.map((item, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => handleNavItemClick(index)}
                    className={`nav-item ${item.isChosen ? "chosen" : ""}`}
                  >
                    {item.title}
                  </div>
                );
              })}
            </div>

            <div className="auth-section" ref={profileMenuRef}>
              {isLoggedIn ? (
                <div className="auth-section-container">
                  {/* <div className="cart-icon-container" onClick={() => setIsCartModalOpen(true)}>
                    {cartItems.length > 0 && (
                      <div className="cart-quantity">
                        {cartItems.length}
                      </div>
                    )}
                    <CartIcon />
                  </div> */}
                  <div className="profile-menu-container">
                    <button
                      className="profile-icon-button"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      aria-label="Profile Menu"
                      // disabled={isLoading}
                    >
                      <ProfileIcon />
                    </button>
                    {isProfileMenuOpen && (
                      <div className="profile-dropdown">
                        <button
                          onClick={handleAccountClick}
                          className="dropdown-item"
                        >
                          <span>حساب کاربری</span>
                          <UserIcon />
                        </button>
                        <button
                          onClick={handleTractorsClick}
                          className="dropdown-item"
                        >
                          <span>تراکتور ها</span>
                          <FaTractor />
                        </button>
                        <button
                          onClick={() => setIsOrdersModalOpen(true)}
                          className="dropdown-item"
                        >
                          <span>سفارشات اخیر</span>
                          <FiClock className="dropdown-icon" />
                        </button>
                        <button
                          onClick={handleLogoutClick}
                          className="dropdown-item"
                          // disabled={isLoading}
                        >
                          <span>خروج</span>
                          <LogoutIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    onClick={() => navigate("/login")}
                    className="login-btn"
                  >
                    ورود
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="signup-btn"
                  >
                    ثبت نام
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <FaBars />
      </button>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-sidebar-header">
          <button
            className="close-sidebar-button"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <IoMdClose />
          </button>
        </div>

        <div className="mobile-sidebar-content">
          {/* About Us Link */}
          <div
            className="mobile-menu-item"
            onClick={() => {
              navigate("/aboutus");
              setIsMobileMenuOpen(false);
            }}
          >
            درباره ما
          </div>

          {/* Contact Us Link */}
          <div
            className="mobile-menu-item"
            onClick={() => {
              navigate("/contactus");
              setIsMobileMenuOpen(false);
            }}
          >
            ارتباط با ما
          </div>

	  <div
            className="mobile-menu-item"
            onClick={() => {
              navigate("/guide");
            }}
          >
            <span>راهنمای سامانه</span>
          </div>

          {isLoggedIn && (
            <>
              <div
                className="mobile-menu-item"
                onClick={() => {
                  setIsOrdersModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span>سفارشات اخیر</span>
              </div>

              <div
                className="mobile-menu-item"
                onClick={() => {
                  navigate('/machines');
                }}
              >
                <span>تراکتور ها</span>
              </div>

              <div
                className="mobile-menu-item logout"
                onClick={() => {
                  setIsLogoutConfirmOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span>خروج</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <NavigationBar
        // onCartClick={handleCartClick}
        onProfileClick={handleAccountClick}
      />

      {/* Modals */}
      {/* <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      /> */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          handleLogout();
	  navigate('/home');
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        title={"تایید خروج"}
        message={"آیا مطمئن هستید که می‌خواهید خارج شوید؟"}
      />
    </>
  );
}
