import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./FournisseurLogin.css";

const FournisseurLogin = () => {
  const [formData, setFormData] = useState({
    email: "demo.fournisseur@gsc.com",
    password: "Fournisseur123!",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🏪 Fournisseur login attempt:", formData.email);

      const response = await fetch("http://localhost:5114/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok && data.token) {
        // Store the authentication data
        const userData = {
          ...data.user,
          token: data.token,
          roles: data.user?.roles || ["Fournisseur"],
        };

        // Use the login function from AuthContext
        await login(userData);

        console.log("✅ Fournisseur logged in successfully:", userData);

        // Redirect to fournisseur dashboard
        navigate("/dashboard/fournisseur");
      } else {
        setError(data.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fournisseur-login-container">
      <div className="fournisseur-login-card">
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">🏪</div>
            <h1>GSC Fournisseur</h1>
            <p>Espace Fournisseur - Système de Demandes de Menus</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Connexion Fournisseur</h2>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre.email@entreprise.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Mot de passe
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Connexion en cours...
              </>
            ) : (
              <>
                <span className="login-icon">🚀</span>
                Se connecter
              </>
            )}
          </button>

          <div className="demo-info">
            <div className="demo-header">
              <span className="demo-icon">💡</span>
              <strong>Compte de démonstration</strong>
            </div>
            <div className="demo-credentials">
              <div className="demo-field">
                <span className="field-label">Email:</span>
                <code>demo.fournisseur@gsc.com</code>
              </div>
              <div className="demo-field">
                <span className="field-label">Mot de passe:</span>
                <code>Fournisseur123!</code>
              </div>
            </div>
          </div>

          <div className="login-links">
            <Link to="/login" className="link">
              👨‍💼 Connexion Admin/Manager
            </Link>
            <Link to="/register" className="link">
              📝 Créer un compte
            </Link>
          </div>
        </form>

        <div className="login-footer">
          <p>© 2024 GSC - Système de Gestion de Restauration Aérienne</p>
          <div className="footer-links">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
            <span>•</span>
            <Link to="/help">Aide</Link>
          </div>
        </div>
      </div>

      <div className="background-decoration">
        <div className="floating-icon icon-1">🍽️</div>
        <div className="floating-icon icon-2">✈️</div>
        <div className="floating-icon icon-3">📋</div>
        <div className="floating-icon icon-4">🏪</div>
        <div className="floating-icon icon-5">💬</div>
        <div className="floating-icon icon-6">✅</div>
      </div>
    </div>
  );
};

export default FournisseurLogin;

