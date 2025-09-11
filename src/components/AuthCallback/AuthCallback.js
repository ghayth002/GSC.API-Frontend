import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../Loading";
import "./AuthCallback.css";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const email = params.get("email");
        const errorParam = params.get("error");

        if (errorParam) {
          setError("Échec de l'authentification Google");
          setProcessing(false);
          setTimeout(() => {
            navigate("/login", {
              state: {
                message: "Échec de l'authentification Google",
                type: "error",
              },
            });
          }, 3000);
          return;
        }

        if (token) {
          // Store the JWT token
          localStorage.setItem("token", token);
          
          // If we have user email, we can store it temporarily
          if (email) {
            localStorage.setItem("tempEmail", email);
          }

          // Redirect to dashboard
          navigate("/dashboard");
        } else if (email) {
          // Server-side flow completed, redirect to dashboard
          navigate("/dashboard");
        } else {
          setError("Aucun token d'authentification reçu");
          setProcessing(false);
          setTimeout(() => {
            navigate("/login", {
              state: {
                message: "Aucun token d'authentification reçu",
                type: "error",
              },
            });
          }, 3000);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Une erreur est survenue lors de l'authentification");
        setProcessing(false);
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Une erreur est survenue lors de l'authentification",
              type: "error",
            },
          });
        }, 3000);
      }
    };

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
      return;
    }

    handleAuthCallback();
  }, [location, navigate, isAuthenticated]);

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-content">
          <div className="error-icon">⚠️</div>
          <h2>Erreur d'authentification</h2>
          <p>{error}</p>
          <p>Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-content">
        <Loading
          type="tunisair"
          size="large"
          message="Traitement de votre authentification..."
          color="primary"
        />
        <p>Veuillez patienter pendant que nous finalisons votre connexion...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
