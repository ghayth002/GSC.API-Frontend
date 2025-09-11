import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email input, 2: Code + Password input
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  const {
    requestPasswordReset,
    resetPasswordDirect,
    isAuthenticated,
    clearError,
  } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Countdown timer for code expiration
  useEffect(() => {
    let interval = null;
    if (step === 2 && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setErrors({
        general: "Le code de vérification a expiré. Veuillez recommencer.",
      });
      setStep(1);
      setTimeLeft(900);
    }
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Real-time password confirmation validation for step 2
    if (step === 2 && (name === "confirmPassword" || name === "newPassword")) {
      const updatedFormData = { ...formData, [name]: value };
      if (updatedFormData.newPassword && updatedFormData.confirmPassword) {
        if (updatedFormData.newPassword !== updatedFormData.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Les mots de passe ne correspondent pas",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "",
          }));
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors }; // Start with current errors to preserve real-time validation

    if (step === 1) {
      if (!formData.email.trim()) {
        newErrors.email = "L'email est requis";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      } else {
        delete newErrors.email; // Clear email error if valid
      }
    } else if (step === 2) {
      if (!formData.code.trim()) {
        newErrors.code = "Le code de vérification est requis";
      } else if (formData.code.length !== 6) {
        newErrors.code = "Le code doit contenir 6 chiffres";
      } else if (!/^\d{6}$/.test(formData.code)) {
        newErrors.code = "Le code doit contenir uniquement des chiffres";
      } else {
        delete newErrors.code; // Clear code error if valid
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "Le nouveau mot de passe est requis";
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword =
          "Le mot de passe doit contenir au moins 8 caractères";
      } else {
        delete newErrors.newPassword; // Clear password error if valid
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "La confirmation du mot de passe est requise";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      } else {
        delete newErrors.confirmPassword; // Clear confirm password error if valid
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (step === 1) {
        // Step 1: Request password reset code
        const result = await requestPasswordReset(formData.email);

        if (result.success) {
          setStep(2);
          setTimeLeft(900); // Reset timer to 15 minutes
          setErrors({});
        } else {
          setErrors({ general: result.message });
        }
      } else if (step === 2) {
        // Step 2: Reset password with code
        const result = await resetPasswordDirect(
          formData.email,
          formData.code,
          formData.newPassword,
          formData.confirmPassword
        );

        if (result.success) {
          setShowSuccess(true);
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setErrors({
        general:
          step === 1
            ? "Une erreur est survenue lors de l'envoi du code"
            : "Une erreur est survenue lors de la réinitialisation",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setFormData((prev) => ({
      ...prev,
      code: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setErrors({});
    setTimeLeft(900);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (showSuccess) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="logo-container">
            <img
              src="/tunisair-logo.svg"
              alt="Tunisair Logo"
              className="logo-image"
            />
          </div>

          <div className="success-content">
            <div className="success-icon">✓</div>
            <h2>Mot de passe réinitialisé !</h2>
            <p>
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez
              maintenant vous connecter avec votre nouveau mot de passe.
            </p>

            <div className="success-actions">
              <Link to="/login" className="btn btn-primary">
                Aller à la connexion
              </Link>
            </div>
          </div>

          <div className="forgot-password-footer">
            <p>© 2024 Tunisair - Aviation IT Services Africa</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="logo-container">
          <img
            src="/tunisair-logo.svg"
            alt="Tunisair Logo"
            className="logo-image"
          />
        </div>

        <div className="forgot-password-header">
          <h1>
            {step === 1
              ? "Mot de passe oublié"
              : "Entrez le code de vérification"}
          </h1>
          <p>
            {step === 1
              ? "Entrez votre adresse email et nous vous enverrons un code de vérification."
              : `Un code de 6 chiffres a été envoyé à ${
                  formData.email
                }. Le code expire dans ${formatTime(timeLeft)}.`}
          </p>
          {step === 2 && (
            <button
              type="button"
              onClick={handleBackToStep1}
              className="btn-link back-button"
            >
              ← Changer l'adresse email
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          {errors.general && (
            <div className="alert alert-error">{errors.general}</div>
          )}

          {step === 1 && (
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                ADRESSE EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="Entrez votre adresse email"
                disabled={isSubmitting}
                autoFocus
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="code" className="form-label">
                  CODE DE VÉRIFICATION
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`form-control code-input ${
                    errors.code ? "is-invalid" : ""
                  }`}
                  placeholder="123456"
                  disabled={isSubmitting}
                  maxLength="6"
                  autoFocus
                />
                {errors.code && (
                  <div className="invalid-feedback">{errors.code}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  NOUVEAU MOT DE PASSE
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`form-control ${
                    errors.newPassword ? "is-invalid" : ""
                  }`}
                  placeholder="Entrez votre nouveau mot de passe"
                  disabled={isSubmitting}
                />
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  CONFIRMER LE MOT DE PASSE
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-control ${
                    errors.confirmPassword
                      ? "is-invalid"
                      : formData.newPassword &&
                        formData.confirmPassword &&
                        formData.newPassword === formData.confirmPassword
                      ? "is-valid"
                      : ""
                  }`}
                  placeholder="Confirmez votre nouveau mot de passe"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">
                    {errors.confirmPassword}
                  </div>
                )}
                {!errors.confirmPassword &&
                  formData.newPassword &&
                  formData.confirmPassword &&
                  formData.newPassword === formData.confirmPassword && (
                    <div className="valid-feedback">
                      ✓ Les mots de passe correspondent
                    </div>
                  )}
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                {step === 1 ? "Envoi en cours..." : "Réinitialisation..."}
              </>
            ) : step === 1 ? (
              "Envoyer le code"
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p>
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link to="/login" className="link-primary">
              Se connecter
            </Link>
          </p>
          <p>© 2024 Tunisair - Aviation IT Services Africa</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
