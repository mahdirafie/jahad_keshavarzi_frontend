import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import usePaymentStore from "../stores/paymentStore";
import useCustomSnackbar from "../hooks/useSnackBar";
import "./VerifyPayment.css";

import Header from '../components/Header';

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSnackbar } = useCustomSnackbar();
  
  const { verifyPayment, isLoading, verificationData, error } = usePaymentStore();
  
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, failed, already_verified
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    verifyPaymentProcess();
  }, []);

  const verifyPaymentProcess = async () => {
    const authority = searchParams.get('Authority');
    const status = searchParams.get('Status');

    // Check if payment was cancelled by user
    if (status === 'NOK') {
      setVerificationStatus('failed');
      setVerificationMessage('پرداخت توسط شما لغو شد');
      showSnackbar('پرداخت لغو شد', 'error');
      return;
    }

    // Check if we have the required parameters
    if (!authority || status !== 'OK') {
      setVerificationStatus('failed');
      setVerificationMessage('پارامترهای لازم برای تأیید پرداخت موجود نیست');
      showSnackbar('خطا در پارامترهای پرداخت', 'error');
      return;
    }

    try {
        const amount = localStorage.getItem('amount');
      const result = await verifyPayment(authority, amount);
      if (result.success) {
        if (result.code === 100) {
          setVerificationStatus('success');
          setVerificationMessage('پرداخت با موفقیت انجام و تأیید شد');
          showSnackbar('پرداخت با موفقیت انجام شد', 'success');
        } else if (result.code === 101) {
          setVerificationStatus('already_verified');
          setVerificationMessage('این پرداخت قبلاً تأیید شده است');
          showSnackbar('این پرداخت قبلاً تأیید شده است', 'info');
        }
      } else {
        setVerificationStatus('failed');
        setVerificationMessage(result.error || 'خطا در تأیید پرداخت');
        showSnackbar(result.error || 'خطا در تأیید پرداخت', 'error');
      }
    } catch (err) {
      setVerificationStatus('failed');
      setVerificationMessage('خطای غیرمنتظره در تأیید پرداخت');
      showSnackbar('خطای غیرمنتظره در تأیید پرداخت', 'error');
    }
  };

  const handleBackToTractors = () => {
    navigate('/tractors');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return '✅';
      case 'already_verified':
        return 'ℹ️';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'پرداخت موفق';
      case 'already_verified':
        return 'پرداخت قبلاً تأیید شده';
      case 'failed':
        return 'پرداخت ناموفق';
      default:
        return 'در حال تأیید پرداخت';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'success';
      case 'already_verified':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'pending';
    }
  };

  return (
    <div className="verify-payment-page">
      {/* <Header /> */}
      
      <div className="verify-payment-container">
        <div className="verify-payment-card">
          <div className={`status-icon status-${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          
          <h1 className="status-title">{getStatusTitle()}</h1>
          
          {isLoading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>در حال تأیید پرداخت...</p>
            </div>
          )}

          {!isLoading && verificationMessage && (
            <div className="verification-message">
              <p>{verificationMessage}</p>
            </div>
          )}

          {verificationData && verificationStatus === 'success' && (
            <div className="payment-details">
              <h3>مشخصات پرداخت</h3>
              <div className="detail-row">
                <span className="detail-label">کد پیگیری:</span>
                <span className="detail-value">{verificationData.ref_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">شماره کارت:</span>
                <span className="detail-value">{verificationData.card_pan}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">کارمزد:</span>
                <span className="detail-value">
                  {verificationData.fee ? `${verificationData.fee} تومان` : 'رایگان'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">تاریخ و زمان:</span>
                <span className="detail-value">
                  {new Date().toLocaleString('fa-IR')}
                </span>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="error-section">
              <p className="error-text">{error}</p>
            </div>
          )}

          <div className="action-buttons">
            {verificationStatus === 'success' && (
              <button 
                className="btn-success"
                onClick={handleBackToTractors}
              >
                بازگشت به تراکتورها
              </button>
            )}
            
            {(verificationStatus === 'failed' || verificationStatus === 'already_verified') && (
              <button 
                className="btn-primary"
                onClick={handleBackToTractors}
              >
                بازگشت به تراکتورها
              </button>
            )}
            
            <button 
              className="btn-secondary"
              onClick={handleGoToHome}
            >
              بازگشت به صفحه اصلی
            </button>
          </div>

          {/* Debug info - you can remove this in production */}
          <div className="debug-info">
            <details>
              <summary>اطلاعات دیباگ</summary>
              <div className="debug-details">
                <p>Authority: {searchParams.get('Authority')}</p>
                <p>Status: {searchParams.get('Status')}</p>
                <p>Verification Status: {verificationStatus}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPayment;