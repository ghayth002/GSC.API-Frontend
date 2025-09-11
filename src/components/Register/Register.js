import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Loading from "../Loading";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, isAuthenticated, loading, clearError } = useAuth();
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

    // Real-time password confirmation validation
    if (name === "confirmPassword" || name === "password") {
      const updatedFormData = { ...formData, [name]: value };
      if (updatedFormData.password && updatedFormData.confirmPassword) {
        if (updatedFormData.password !== updatedFormData.confirmPassword) {
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
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Le nom d'utilisateur est requis";
    } else if (formData.userName.trim().length < 3) {
      newErrors.userName =
        "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
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
      // Try different backend field name patterns
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        // Alternative field names that backends might expect
        password_confirmation: formData.confirmPassword,
        passwordConfirmation: formData.confirmPassword,
      };

      console.log("Sending registration data:", registrationData);
      console.log(
        "Password match check:",
        formData.password === formData.confirmPassword
      );

      const result = await register(registrationData);

      if (result.success) {
        setShowSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Inscription réussie ! Vérifiez votre email pour activer votre compte.",
              email: formData.email,
            },
          });
        }, 3000);
      } else {
        console.log("Registration failed:", result);
        if (result.errors) {
          console.log("Backend validation errors:", result.errors);
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ general: "Une erreur est survenue lors de l'inscription" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Loading
        type="gradient"
        size="large"
        message="Préparation de votre inscription..."
        fullScreen={true}
        color="primary"
      />
    );
  }

  if (showSuccess) {
    return (
      <div className="register-container">
        <div className="register-success">
          <div className="success-icon">✓</div>
          <h2>Inscription réussie !</h2>
          <p>
            Un email de vérification a été envoyé à{" "}
            <strong>{formData.email}</strong>. Veuillez vérifier votre boîte
            mail et cliquer sur le lien pour activer votre compte.
          </p>
          <p>Redirection vers la page de connexion...</p>
          <Loading type="dots" size="medium" color="success" />
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-background">
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

      <div className="register-right">
        <div className="register-form-container">
          <div className="register-header">
            <h1>CRÉER UN COMPTE</h1>
            <p>Rejoignez le système GsC de Tunisair</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {errors.general && (
              <div className="alert alert-error">{errors.general}</div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  PRÉNOM
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`form-control ${
                    errors.firstName ? "is-invalid" : ""
                  }`}
                  placeholder="Entrez votre prénom"
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <div className="invalid-feedback">{errors.firstName}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  NOM
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`form-control ${
                    errors.lastName ? "is-invalid" : ""
                  }`}
                  placeholder="Entrez votre nom"
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <div className="invalid-feedback">{errors.lastName}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="userName" className="form-label">
                NOM D'UTILISATEUR
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className={`form-control ${
                  errors.userName ? "is-invalid" : ""
                }`}
                placeholder="Choisissez un nom d'utilisateur"
                disabled={isSubmitting}
              />
              {errors.userName && (
                <div className="invalid-feedback">{errors.userName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                EMAIL
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

            <div className="form-row">
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

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  CONFIRMER
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
                      : formData.password &&
                        formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                      ? "is-valid"
                      : ""
                  }`}
                  placeholder="Confirmez votre mot de passe"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">
                    {errors.confirmPassword}
                  </div>
                )}
                {!errors.confirmPassword &&
                  formData.password &&
                  formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <div className="valid-feedback">
                      ✓ Les mots de passe correspondent
                    </div>
                  )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Création du compte...
                </>
              ) : (
                "Créer le compte"
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="link-primary">
                Se connecter
              </Link>
            </p>
            <p>© 2024 Tunisair - Aviation IT Services Africa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
