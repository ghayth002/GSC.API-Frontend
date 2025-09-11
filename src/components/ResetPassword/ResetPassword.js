import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const { resetPassword, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract email and token from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (!emailParam || !tokenParam) {
      setErrors({ 
        general: "Lien de réinitialisation invalide. Paramètres manquants." 
      });
      return;
    }

    setEmail(emailParam);
    setToken(tokenParam);
  }, [searchParams]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Le nouveau mot de passe est requis";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !token) {
      setErrors({ general: "Lien de réinitialisation invalide." });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword(email, token, formData.newPassword);

      if (result.success) {
        setShowSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
              type: "success"
            }
          });
        }, 3000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setErrors({ general: "Une erreur est survenue lors de la réinitialisation" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
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
              Votre mot de passe a été réinitialisé avec succès.
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <p className="redirect-message">
              Redirection vers la page de connexion dans quelques secondes...
            </p>
            
            <div className="success-actions">
              <Link to="/login" className="btn btn-primary">
                Aller à la connexion
              </Link>
            </div>
          </div>
          
          <div className="reset-password-footer">
            <p>© 2024 Tunisair - Aviation IT Services Africa</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="logo-container">
          <img
            src="/tunisair-logo.svg"
            alt="Tunisair Logo"
            className="logo-image"
          />
        </div>
        
        <div className="reset-password-header">
          <h1>Réinitialiser le mot de passe</h1>
          <p>Entrez votre nouveau mot de passe ci-dessous.</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {errors.general && (
            <div className="alert alert-error">{errors.general}</div>
          )}

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
              className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
              placeholder="Entrez votre nouveau mot de passe"
              disabled={isSubmitting}
              autoFocus
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
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              placeholder="Confirmez votre nouveau mot de passe"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">{errors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={isSubmitting || !email || !token}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Réinitialisation...
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </button>
        </form>

        <div className="reset-password-footer">
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

export default ResetPassword;
