import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../Loading";

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Loading
        type="pulse"
        size="large"
        message="Vérification de l'authentification..."
        fullScreen={true}
        color="primary"
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user?.roles?.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <div className="access-denied-container">
          <div className="access-denied-content">
            <h2>Accès refusé</h2>
            <p>
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
            <p>Rôles requis: {requiredRoles.join(", ")}</p>
            <p>Vos rôles: {user?.roles?.join(", ") || "Aucun"}</p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
