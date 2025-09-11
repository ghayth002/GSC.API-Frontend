import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Loading from "../Loading";
import "./EmailVerification.css";

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const performVerification = async () => {
      const email = searchParams.get("email");
      const token = searchParams.get("token");

      if (!email || !token) {
        setVerificationStatus("error");
        setMessage("Lien de vérification invalide. Paramètres manquants.");
        setIsLoading(false);
        return;
      }

      try {
        const result = await verifyEmail(email, token);

        if (result.success) {
          setVerificationStatus("success");
          setMessage(
            result.message || "Votre email a été vérifié avec succès !"
          );

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login", {
              state: {
                message:
                  "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
                type: "success",
              },
            });
          }, 3000);
        } else {
          setVerificationStatus("error");
          setMessage(result.message || "Échec de la vérification de l'email.");
        }
      } catch (error) {
        setVerificationStatus("error");
        setMessage("Une erreur est survenue lors de la vérification.");
      } finally {
        setIsLoading(false);
      }
    };

    performVerification();
  }, [searchParams, verifyEmail, navigate]);

  const renderContent = () => {
    if (isLoading || verificationStatus === "verifying") {
      return (
        <div className="verification-content">
          <Loading
            type="orbit"
            size="large"
            message="Vérification de votre email en cours..."
            color="primary"
          />
        </div>
      );
    }

    if (verificationStatus === "success") {
      return (
        <div className="verification-content">
          <div className="verification-icon success">✓</div>
          <h2>Email vérifié avec succès !</h2>
          <p>{message}</p>
          <p className="redirect-message">
            Redirection vers la page de connexion dans quelques secondes...
          </p>
          <div className="verification-actions">
            <Link to="/login" className="btn btn-primary">
              Aller à la connexion
            </Link>
          </div>
        </div>
      );
    }

    if (verificationStatus === "error") {
      return (
        <div className="verification-content">
          <div className="verification-icon error">✗</div>
          <h2>Échec de la vérification</h2>
          <p>{message}</p>
          <div className="verification-actions">
            <Link to="/login" className="btn btn-primary">
              Retour à la connexion
            </Link>
            <Link to="/register" className="btn btn-outline">
              Créer un nouveau compte
            </Link>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        <div className="logo-container">
          <img
            src="/tunisair-logo.svg"
            alt="Tunisair Logo"
            className="logo-image"
          />
        </div>

        {renderContent()}

        <div className="verification-footer">
          <p>© 2024 Tunisair - Aviation IT Services Africa</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
