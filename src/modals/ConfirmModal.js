import React from "react";
import Modal from "./Modal";
import "./ConfirmModal.css";

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  message,
  title
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="confirm-modal-content">
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            لغو
          </button>
          <button className="confirm-btn-confirm" onClick={onConfirm}>
            بله
          </button>
        </div>
      </div>
    </Modal>
  );
}