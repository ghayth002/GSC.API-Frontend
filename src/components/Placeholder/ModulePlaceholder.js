import React from "react";
import "./ModulePlaceholder.css";

const ModulePlaceholder = ({ title, description, icon }) => {
  return (
    <div className="module-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-icon">
          {icon || "🚧"}
        </div>
        <h2 className="placeholder-title">
          {title || "Module en développement"}
        </h2>
        <p className="placeholder-description">
          {description || "Ce module est actuellement en cours de développement et sera bientôt disponible."}
        </p>
        <div className="placeholder-features">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Fonctionnalités avancées</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span>Sécurisé et fiable</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Rapports détaillés</span>
          </div>
        </div>
        <div className="placeholder-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>En développement</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
