import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = "medium", // small, medium, large, xl
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  actions = null,
  className = "",
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-${size} ${className}`}>
        {/* Header */}
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="modal-close-button"
              aria-label="Fermer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer with actions */}
        {actions && <div className="modal-footer">{actions}</div>}
      </div>
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "warning", // warning, danger, info
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const actions = (
    <div className="confirmation-actions">
      <button onClick={onClose} className="btn btn-secondary">
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        className={`btn btn-${
          type === "danger" ? "danger" : type === "info" ? "info" : "warning"
        }`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      actions={actions}
      className={`confirmation-modal confirmation-${type}`}
    >
      <div className="confirmation-content">
        <div className="confirmation-icon">
          {type === "danger" && "⚠️"}
          {type === "warning" && "❓"}
          {type === "info" && "ℹ️"}
        </div>
        <p className="confirmation-message">{message}</p>
      </div>
    </Modal>
  );
};

export default Modal;
