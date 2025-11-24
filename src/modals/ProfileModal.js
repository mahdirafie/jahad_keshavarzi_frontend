import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import "./ProfileModal.css";
import useAuthStore from "../stores/authStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import { formatDate } from "../utils/DateFormat";
import { useNavigate } from "react-router-dom";
import Spacer from "../components/Spacer";

function ProfileModal({ isOpen, onClose }) {
  const { getProfile } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const { showSnackbar } = useCustomSnackbar();

  // Fetch profile data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getProfile();

      if (result.success) {
        setUserData(result.data);
      } else {
        setError(result.error);
        showSnackbar("خطا در دریافت اطلاعات کاربر", "error");
      }
    } catch (err) {
      setError("خطا در دریافت اطلاعات کاربر");
      showSnackbar("خطا در دریافت اطلاعات کاربر", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="حساب کاربری"
      className="profile-modal"
    >
      {isLoading ? (
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری اطلاعات...</p>
        </div>
      ) : (
        <div className="profile-content">
          <div className="profile-field">
            <label>نام و نام خانوادگی</label>
            <div className="field-value">{userData?.user?.name || "---"}</div>
          </div>

          <div className="profile-field">
            <label>کد ملی</label>
            <div className="field-value">
              {userData?.user?.national_code || "---"}
            </div>
          </div>

          <div className="profile-field">
            <label>شماره موبایل</label>
            <div className="field-value">{userData?.user?.phone || "---"}</div>
          </div>

          <div className="profile-date-container">
            <div className="profile-date-desc">تاریخ ساخت حساب کاربری:</div>
            <div className="profile-date">
              {userData?.user?.createdAt ? formatDate(userData.user.createdAt) : "---"}
            </div>
          </div>

          {error && <div className="profile-error">{error}</div>}
          
          <Spacer height={20}/>
          <button
            onClick={() => navigate("/complete-profile")}
            className="complete-profile-btn"
          >
            تکمیل اطلاعات
          </button>
        </div>
      )}
    </Modal>
  );
}

export default ProfileModal;
