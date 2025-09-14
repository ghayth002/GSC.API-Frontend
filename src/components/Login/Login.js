import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Loading from "../Loading";
import GoogleLoginButton from "../GoogleLoginButton";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] =
    useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [locationMessage, setLocationMessage] = useState(null);

  const {
    login,
    resendVerification,
    isAuthenticated,
    loading,
    error,
    clearError,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle location state messages (from registration, verification, etc.)
  useEffect(() => {
    if (location.state?.message) {
      setLocationMessage({
        text: location.state.message,
        type: location.state.type || "info",
        email: location.state.email,
      });

      // Clear the location state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
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
    setLocationMessage(null); // Clear any previous messages

    try {
      const result = await login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      if (result.success) {
        navigate("/dashboard");
      } else if (result.emailNotConfirmed) {
        // Show email verification message with resend option
        setShowEmailVerificationMessage(true);
        setEmailForVerification(result.email || formData.email);
        setErrors({
          general:
            "Votre email n'est pas encore vérifié. Veuillez vérifier votre boîte mail ou renvoyer l'email de vérification.",
        });
      } else {
        setErrors({ general: result.message });
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: "Une erreur est survenue lors de la connexion" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);

    try {
      const result = await resendVerification(emailForVerification);

      if (result.success) {
        setLocationMessage({
          text: "Email de vérification renvoyé avec succès ! Vérifiez votre boîte mail.",
          type: "success",
        });
        setShowEmailVerificationMessage(false);
      } else {
        setErrors({ general: result.message });
      }
    } catch (err) {
      console.error("Resend verification error:", err);
      setErrors({
        general: "Erreur lors de l'envoi de l'email de vérification",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleGoogleLoginSuccess = (result) => {
    navigate("/dashboard");
  };

  const handleGoogleLoginError = (errorMessage) => {
    setErrors({ general: errorMessage });
  };

  if (loading) {
    return (
      <Loading
        type="tunisair"
        size="large"
        message="Chargement de votre session..."
        fullScreen={true}
        color="primary"
      />
    );
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-background">
          <div className="logo-container">
            <div className="tunisair-logo">
              <img
                src="/tunisair-logo.svg"
                alt="Tunisair Logo"
                className="logo-image"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h1>GESTION DE LA SOUS TRAITANCE CATERING</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {locationMessage && (
              <div
                className={`alert alert-${
                  locationMessage.type === "success" ? "success" : "info"
                }`}
              >
                {locationMessage.text}
              </div>
            )}
            {error && <div className="alert alert-error">{error}</div>}
            {errors.general && (
              <div className="alert alert-error">{errors.general}</div>
            )}
            {showEmailVerificationMessage && (
              <div className="alert alert-warning">
                <p>Votre email n'est pas encore vérifié.</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="btn-link"
                >
                  {isResendingVerification ? (
                    <>
                      <Loading type="dots" size="small" color="warning" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Renvoyer l'email de vérification"
                  )}
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                LOGIN
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="Entrez votre email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                MOT DE PASSE
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Entrez votre mot de passe"
                disabled={isSubmitting}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="form-group form-check">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="form-check-input"
                disabled={isSubmitting}
              />
              <label htmlFor="rememberMe" className="form-check-label">
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loading type="dots" size="small" color="white" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>

            <div className="divider">
              <span>ou</span>
            </div>

            <GoogleLoginButton
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              disabled={isSubmitting}
            />
          </form>

          <div className="login-links">
            <Link to="/forgot-password" className="link-primary">
              Mot de passe oublié ?
            </Link>
            <span className="link-separator">•</span>
            <Link to="/register" className="link-primary">
              Créer un compte
            </Link>
          </div>

          <div className="supplier-login-section">
            <div className="separator">
              <span>ou</span>
            </div>
            <Link to="/fournisseur-login" className="supplier-login-button">
              <span className="supplier-icon">🏪</span>
              Connexion Fournisseur
            </Link>
          </div>

          <div className="login-footer">
            <p>© 2024 Tunisair - Aviation IT Services Africa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
