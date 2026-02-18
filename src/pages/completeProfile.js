import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import "./completeProfile.css";
import BASE_URL from "../common/baseUrl";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { completeProfile, getProfile, isLoading, error } = useAuthStore();
  const { showSnackbar } = useCustomSnackbar();

  const backendUrl = 'http://localhost:4000';
  // const backendUrl = 'https://peymash.ir/api';

  const markaziCities = [
    "اراک",
    "آشتیان",
    "تفرش",
    "خمین",
    "دلیجان",
    "زرندیه",
    "ساوه",
    "شازند",
    "فراهان",
    "کمیجان",
    "محلات",
    "خنداب",
  ];

  // Persian years (1300-1400)
  const persianYears = Array.from({ length: 101 }, (_, i) => 1300 + i);
  const persianMonths = [
    { value: 1, label: "فروردین" },
    { value: 2, label: "اردیبهشت" },
    { value: 3, label: "خرداد" },
    { value: 4, label: "تیر" },
    { value: 5, label: "مرداد" },
    { value: 6, label: "شهریور" },
    { value: 7, label: "مهر" },
    { value: 8, label: "آبان" },
    { value: 9, label: "آذر" },
    { value: 10, label: "دی" },
    { value: 11, label: "بهمن" },
    { value: 12, label: "اسفند" },
  ];
  const persianDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const [formData, setFormData] = useState({
    father_name: "",
    village: "",
    birth_year: "",
    birth_month: "",
    birth_day: "",
    ownership_type: "",
    profile_image: "",
    address: "",
    province: "مرکزی",
    city: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsFetching(true);
      const result = await getProfile();

      if (result.success && result.data) {
        const userData = result.data.user || result.data;

        let birth_year = "",
          birth_month = "",
          birth_day = "";
        if (userData.birth_date) {
          try {
            // Parse Jalaali date from backend (format: 1402-10-15)
            // Remove time part if exists
            const dateString = userData.birth_date.split("T")[0];
            const [year, month, day] = dateString.split("-");
            birth_year = year;
            birth_month = month.startsWith("0") ? month.substring(1) : month; // Remove leading zero
            birth_day = day.startsWith("0") ? day.substring(1) : day; // Remove leading zero
          } catch (err) {
            console.error("Error parsing date:", err);
          }
        }

        const existingData = {
          father_name: userData.father_name || "",
          village: userData.village || "",
          birth_year,
          birth_month,
          birth_day,
          ownership_type: userData.ownership_type || "",
          profile_image: userData.profile_image || "",
          address: userData.address || "",
          province: userData.province || "مرکزی",
          city: userData.city || "",
        };

        setFormData(existingData);

        // Set image preview - add cache busting
        if (existingData.profile_image) {
          const baseUrl =
            BASE_URL || backendUrl;
          const imagePath = existingData.profile_image;

          console.log("Setting image preview from profile data:");
          console.log("Image path from DB:", imagePath);

          let fullImageUrl;
          if (imagePath.startsWith("http")) {
            fullImageUrl = `${imagePath}?t=${Date.now()}`;
          } else if (imagePath.startsWith("/")) {
            fullImageUrl = `${baseUrl}${imagePath}?t=${Date.now()}`;
          } else {
            fullImageUrl = `${baseUrl}/${imagePath}?t=${Date.now()}`;
          }

          console.log("Constructed URL:", fullImageUrl);
          setImagePreview(fullImageUrl);
        } else {
          setImagePreview("");
        }

        const hasData = Object.values(existingData).some(
          (value) => value && value !== "مرکزی" && value !== ""
        );
        setHasExistingData(hasData);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      showSnackbar("خطا در دریافت اطلاعات کاربر", "error");
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploadingImage(true);

      const formDataToSend = new FormData();
      formDataToSend.append("profile_image", file);

      const token = localStorage.getItem("authToken") || "";

      console.log("=== STARTING FILE UPLOAD ===");
      console.log(
        "API URL:",
        BASE_URL || backendUrl
      );
      console.log(
        "Upload endpoint:",
        `${
          BASE_URL || backendUrl
        }/user/upload-profile-image`
      );
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const response = await fetch(
        `${
          BASE_URL || backendUrl
        }/user/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      console.log("Upload response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          `Server returned ${response.status}: ${text.substring(0, 100)}`
        );
      }

      const data = await response.json();

      console.log("Upload response data:", data);

      if (response.ok && data.success) {
        const imagePath = data.profile_image;
        console.log("Received image path from backend:", imagePath);

        // Update form data
        setFormData((prev) => ({ ...prev, profile_image: imagePath }));

        // Update preview with cache busting - FIXED VERSION
        const baseUrl =
          BASE_URL || backendUrl;
        let newImageUrl;

        if (imagePath.startsWith("http")) {
          // Full URL already provided
          newImageUrl = `${imagePath}?t=${Date.now()}`;
        } else if (imagePath.startsWith("/")) {
          // Path starts with /, so append directly to base URL
          newImageUrl = `${baseUrl}${imagePath}?t=${Date.now()}`;
        } else {
          // Relative path without leading slash
          newImageUrl = `${baseUrl}/${imagePath}?t=${Date.now()}`;
        }

        console.log("Constructed image URL for preview:", newImageUrl);

        // Test the image URL before setting it
        const testImage = new Image();
        testImage.onload = () => {
          console.log("Image test PASSED - setting preview");
          setImagePreview(newImageUrl);
          showSnackbar("تصویر با موفقیت آپلود شد", "success");
        };

        testImage.onerror = () => {
          console.error(
            "Image test FAILED - trying alternative URL construction"
          );

          // Try alternative URL construction
          let alternativeUrl;
          if (imagePath.startsWith("/")) {
            // Try with double slash (sometimes needed)
            alternativeUrl = `${baseUrl}${imagePath}?t=${Date.now()}`;
          } else {
            // Try as absolute path
            alternativeUrl = `${baseUrl}${
              imagePath.startsWith("/") ? "" : "/"
            }${imagePath}?t=${Date.now()}`;
          }

          console.log("Trying alternative URL:", alternativeUrl);

          const testImage2 = new Image();
          testImage2.onload = () => {
            console.log("Alternative URL worked!");
            setImagePreview(alternativeUrl);
            showSnackbar("تصویر با موفقیت آپلود شد", "success");
          };

          testImage2.onerror = () => {
            console.error("All URL constructions failed");
            // Keep the blob URL as preview
            showSnackbar("تصویر آپلود شد اما نمایش آن ممکن نیست", "warning");
          };

          testImage2.src = alternativeUrl;
        };

        testImage.src = newImageUrl;

        // Also update the form data with the correct path
        setFormData((prev) => ({
          ...prev,
          profile_image: imagePath,
        }));
      } else {
        console.error("Upload failed:", data.message);
        showSnackbar(
          data.message || `خطا در آپلود تصویر (${response.status})`,
          "error"
        );

        // Restore blob preview if upload failed
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        showSnackbar(
          "خطا در اتصال به سرور. لطفا اتصال اینترنت خود را بررسی کنید",
          "error"
        );
      } else if (error.message.includes("404")) {
        showSnackbar("آدرس آپلود تصویر پیدا نشد", "error");
      } else if (error.message.includes("413")) {
        showSnackbar("حجم فایل بسیار زیاد است", "error");
      } else if (
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        showSnackbar("دسترسی غیرمجاز. لطفا مجددا وارد شوید", "error");
      } else {
        showSnackbar(error.message || "خطا در آپلود تصویر", "error");
      }

      // Restore blob preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showSnackbar("حجم فایل نباید بیشتر از ۲ مگابایت باشد", "error");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        showSnackbar("فقط فایل‌های تصویر (JPEG, PNG, GIF) مجاز هستند", "error");
        return;
      }

      // Create temporary preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Upload file
      handleFileUpload(file);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const token = localStorage.getItem("authToken") || "";

      const response = await fetch(
        `${
          BASE_URL || backendUrl
        }/user/delete-profile-image`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Delete response status:", response.status);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON delete response:", text);
        throw new Error(
          `Server returned ${response.status}: ${text.substring(0, 100)}`
        );
      }

      const data = await response.json();
      console.log("Delete response data:", data);

      if (response.ok && data.success) {
        // Clear local state
        setFormData((prev) => ({ ...prev, profile_image: "" }));
        setImagePreview("");

        // Show success message with green background
        showSnackbar("تصویر پروفایل حذف شد", "success");

        // Refresh profile data
        setTimeout(() => {
          fetchUserProfile();
        }, 1000);
      } else {
        showSnackbar(data.message || "خطا در حذف تصویر", "error");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      showSnackbar("خطا در حذف تصویر", "error");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.father_name.trim()) {
      errors.father_name = "نام پدر الزامی است";
    } else if (formData.father_name.trim().length < 2) {
      errors.father_name = "نام پدر باید حداقل ۲ کاراکتر باشد";
    }

    if (formData.village.trim() && formData.village.trim().length < 2) {
      errors.village = "نام روستا باید حداقل ۲ کاراکتر باشد";
    }

    // Check if any date field is filled
    const hasAnyDateField =
      formData.birth_year || formData.birth_month || formData.birth_day;
    if (hasAnyDateField) {
      if (!formData.birth_year) errors.birth_year = "سال تولد الزامی است";
      if (!formData.birth_month) errors.birth_month = "ماه تولد الزامی است";
      if (!formData.birth_day) errors.birth_day = "روز تولد الزامی است";
    }

    if (!formData.address.trim()) {
      errors.address = "آدرس الزامی است";
    } else if (formData.address.trim().length < 10) {
      errors.address = "آدرس باید حداقل ۱۰ کاراکتر باشد";
    }

    if (!formData.city) {
      errors.city = "شهر الزامی است";
    }

    if (!formData.ownership_type) {
      errors.ownership_type = "نوع مالکیت الزامی است";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showSnackbar("لطفا تمام فیلدهای ضروری را پر کنید", "error");
      return;
    }

    // Store Jalaali date directly
    let dataToSend = { ...formData };

    if (formData.birth_year && formData.birth_month && formData.birth_day) {
      // Store as Jalaali date (YYYY-MM-DD) - ensure proper formatting
      const formattedDate = `${
        formData.birth_year
      }-${formData.birth_month.padStart(2, "0")}-${formData.birth_day.padStart(
        2,
        "0"
      )}`;
      dataToSend.birth_date = formattedDate;
    }

    // Remove separate date fields
    delete dataToSend.birth_year;
    delete dataToSend.birth_month;
    delete dataToSend.birth_day;

    const result = await completeProfile(dataToSend);

    if (result.success) {
      showSnackbar(
        hasExistingData
          ? "پروفایل با موفقیت بروزرسانی شد"
          : "پروفایل با موفقیت تکمیل شد",
        "success"
      );
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      showSnackbar(result.error, "error");
    }
  };

  // Format displayed date (show only date, no time)
  const getDisplayedDate = () => {
    if (formData.birth_year && formData.birth_month && formData.birth_day) {
      const monthObj = persianMonths.find(
        (m) => m.value === formData.birth_month
      );
      const monthName = monthObj ? monthObj.label : formData.birth_month;
      return `${formData.birth_year}/${monthName}/${formData.birth_day}`;
    }
    return "برای انتخاب تاریخ کلیک کنید";
  };

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (isFetching) {
    return (
      <div className="complete-profile-page">
        <div className="complete-profile-container">
          <div className="complete-profile-card">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>در حال دریافت اطلاعات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-container">
        <div className="complete-profile-card">
          <h1 className="complete-profile-title">
            {hasExistingData ? "بروزرسانی پروفایل" : "تکمیل پروفایل"}
          </h1>
          <p className="complete-profile-subtitle">
            {hasExistingData
              ? "اطلاعات پروفایل شما نمایش داده می‌شود. می‌توانید آنها را ویرایش کنید."
              : "لطفا اطلاعات زیر را برای تکمیل پروفایل خود وارد کنید"}
          </p>

          <form onSubmit={handleSubmit} className="complete-profile-form">
            {/* Father Name */}
            <div className="form-group">
              <label htmlFor="father_name" className="form-label">
                نام پدر *
              </label>
              <input
                type="text"
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={handleInputChange}
                className={`form-input ${
                  formErrors.father_name ? "error" : ""
                }`}
                placeholder="نام پدر خود را وارد کنید"
              />
              {formErrors.father_name && (
                <span className="error-message">{formErrors.father_name}</span>
              )}
            </div>

            {/* Village */}
            <div className="form-group">
              <label htmlFor="village" className="form-label">
                روستا
              </label>
              <input
                type="text"
                id="village"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                className={`form-input ${formErrors.village ? "error" : ""}`}
                placeholder="نام روستای خود را وارد کنید"
              />
              {formErrors.village && (
                <span className="error-message">{formErrors.village}</span>
              )}
            </div>

            {/* Birth Date - Simple Persian Picker */}
            <div className="form-group">
              <label className="form-label">تاریخ تولد (شمسی) *</label>
              <div className="date-picker-container">
                <div
                  className={`date-picker-input ${
                    formErrors.birth_year ||
                    formErrors.birth_month ||
                    formErrors.birth_day
                      ? "error"
                      : ""
                  }`}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  {getDisplayedDate()}
                  <span className="calendar-icon">📅</span>
                </div>

                {showDatePicker && (
                  <div className="date-picker-popup">
                    <div className="persian-date-picker">
                      <div className="date-picker-header">
                        <span>انتخاب تاریخ تولد</span>
                        <button
                          type="button"
                          className="close-date-picker"
                          onClick={() => setShowDatePicker(false)}
                        >
                          ×
                        </button>
                      </div>

                      <div className="date-picker-body">
                        <div className="date-field-group">
                          <label className="date-field-label">سال</label>
                          <select
                            value={formData.birth_year}
                            onChange={handleInputChange}
                            name="birth_year"
                            className={`date-field-select ${
                              formErrors.birth_year ? "error" : ""
                            }`}
                          >
                            <option value="">انتخاب سال</option>
                            {persianYears.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          {formErrors.birth_year && (
                            <span className="date-field-error">
                              {formErrors.birth_year}
                            </span>
                          )}
                        </div>

                        <div className="date-field-group">
                          <label className="date-field-label">ماه</label>
                          <select
                            value={formData.birth_month}
                            onChange={handleInputChange}
                            name="birth_month"
                            className={`date-field-select ${
                              formErrors.birth_month ? "error" : ""
                            }`}
                          >
                            <option value="">انتخاب ماه</option>
                            {persianMonths.map((month) => (
                              <option key={month.value} value={month.value}>
                                {month.label}
                              </option>
                            ))}
                          </select>
                          {formErrors.birth_month && (
                            <span className="date-field-error">
                              {formErrors.birth_month}
                            </span>
                          )}
                        </div>

                        <div className="date-field-group">
                          <label className="date-field-label">روز</label>
                          <select
                            value={formData.birth_day}
                            onChange={handleInputChange}
                            name="birth_day"
                            className={`date-field-select ${
                              formErrors.birth_day ? "error" : ""
                            }`}
                          >
                            <option value="">انتخاب روز</option>
                            {persianDays.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                          {formErrors.birth_day && (
                            <span className="date-field-error">
                              {formErrors.birth_day}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="date-picker-footer">
                        <button
                          type="button"
                          className="date-picker-confirm"
                          onClick={() => setShowDatePicker(false)}
                        >
                          تأیید
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {(formErrors.birth_year ||
                formErrors.birth_month ||
                formErrors.birth_day) && (
                <span className="error-message">
                  لطفا تاریخ تولد را کامل وارد کنید
                </span>
              )}
            </div>

            {/* Ownership Type */}
            <div className="form-group">
              <label className="form-label">نوع مالکیت *</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="ownership_type"
                    value="personal"
                    checked={formData.ownership_type === "personal"}
                    onChange={handleInputChange}
                  />
                  <span className="radio-label">شخصی</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="ownership_type"
                    value="professional"
                    checked={formData.ownership_type === "professional"}
                    onChange={handleInputChange}
                  />
                  <span className="radio-label">تراکتورچی حرفه‌ای</span>
                </label>
              </div>
              {formErrors.ownership_type && (
                <span className="error-message">
                  {formErrors.ownership_type}
                </span>
              )}
            </div>

            {/* Profile Image */}
            <div className="form-group">
              <label className="form-label">عکس پروفایل</label>
              <div className="image-upload-section">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img
                        src={imagePreview}
                        alt="پیش‌نمایش"
                        className="preview-image"
                        onError={(e) => {
                          console.error("=== IMAGE LOAD ERROR ===");
                          console.error("Failed src:", e.target.src);
                          console.error(
                            "Current imagePreview state:",
                            imagePreview
                          );

                          // Check if it's a blob URL (temporary preview)
                          if (e.target.src.startsWith("blob:")) {
                            console.log(
                              "Blob URL failed, this is normal for expired URLs"
                            );
                            return;
                          }

                          // Try to fix the URL
                          const currentSrc = e.target.src;
                          const baseUrl =
                            BASE_URL ||
                            backendUrl;

                          // Check if we need to add base URL
                          if (
                            !currentSrc.includes(baseUrl) &&
                            !currentSrc.startsWith("blob:")
                          ) {
                            // Try to construct proper URL
                            if (currentSrc.startsWith("/")) {
                              const fixedUrl = `${baseUrl}${
                                currentSrc.split("?")[0]
                              }?t=${Date.now()}`;
                              console.log("Trying fixed URL:", fixedUrl);
                              e.target.src = fixedUrl;
                            } else {
                              // Try with base URL
                              const fixedUrl = `${baseUrl}/${
                                currentSrc.split("?")[0]
                              }?t=${Date.now()}`;
                              console.log("Trying fixed URL:", fixedUrl);
                              e.target.src = fixedUrl;
                            }
                          } else {
                            // Already has base URL, try with new timestamp
                            const urlWithoutParams = currentSrc.split("?")[0];
                            const fixedUrl = `${urlWithoutParams}?t=${Date.now()}`;
                            console.log(
                              "Refreshing with new timestamp:",
                              fixedUrl
                            );
                            e.target.src = fixedUrl;
                          }
                        }}
                        onLoad={() =>
                          console.log(
                            "✅ Image loaded successfully:",
                            imagePreview
                          )
                        }
                      />
                      {!uploadingImage && (
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                          title="حذف عکس"
                        >
                          ×
                        </button>
                      )}
                      {uploadingImage && (
                        <div className="uploading-overlay">
                          <div className="uploading-spinner"></div>
                        </div>
                      )}
                    </div>
                    <div className="image-upload-actions">
                      <label
                        htmlFor="profile_image"
                        className="file-input-label"
                      >
                        {uploadingImage ? "در حال آپلود..." : "تغییر عکس"}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <label htmlFor="profile_image" className="file-input-label">
                      <span className="upload-icon">📷</span>
                      <span>انتخاب عکس</span>
                      <small>JPEG, PNG, GIF (حداکثر 2MB)</small>
                    </label>
                  </div>
                )}
                <input
                  type="file"
                  id="profile_image"
                  name="profile_image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                  disabled={uploadingImage}
                />
              </div>
            </div>

            {/* Province (Fixed) */}
            <div className="form-group">
              <label htmlFor="province" className="form-label">
                استان *
              </label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                className="form-input"
                disabled
              />
              <small className="form-help">استان قابل تغییر نیست</small>
            </div>

            {/* City */}
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                شهر *
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`form-select ${formErrors.city ? "error" : ""}`}
              >
                <option value="">انتخاب شهر</option>
                {markaziCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {formErrors.city && (
                <span className="error-message">{formErrors.city}</span>
              )}
            </div>

            {/* Address */}
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                آدرس کامل *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`form-textarea ${formErrors.address ? "error" : ""}`}
                placeholder="آدرس کامل خود را وارد کنید..."
                rows="4"
              />
              {formErrors.address && (
                <span className="error-message">{formErrors.address}</span>
              )}
            </div>

            {/* Error Display */}
            {error && <div className="form-error">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || uploadingImage}
            >
              {isLoading
                ? "در حال ارسال..."
                : hasExistingData
                ? "بروزرسانی پروفایل"
                : "تکمیل پروفایل"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
