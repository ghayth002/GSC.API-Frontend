import React from "react";
import "./StatusBadge.css";

const StatusBadge = ({
  status,
  type = "default", // default, primary, success, warning, danger, info
  size = "medium", // small, medium, large
  className = "",
}) => {
  // Status mappings for different contexts
  const statusMappings = {
    // Flight statuses
    Programmé: { type: "info", text: "Programmé" },
    "En Cours": { type: "warning", text: "En Cours" },
    Terminé: { type: "success", text: "Terminé" },
    Annulé: { type: "danger", text: "Annulé" },
    Retardé: { type: "warning", text: "Retardé" },

    // BCP/BL statuses
    Brouillon: { type: "secondary", text: "Brouillon" },
    "En Attente": { type: "warning", text: "En Attente" },
    Envoyé: { type: "info", text: "Envoyé" },
    Validé: { type: "success", text: "Validé" },
    Rejeté: { type: "danger", text: "Rejeté" },
    Livré: { type: "success", text: "Livré" },

    // Écart statuses
    Détecté: { type: "warning", text: "Détecté" },
    "En Traitement": { type: "info", text: "En Traitement" },
    Résolu: { type: "success", text: "Résolu" },
    Accepté: { type: "success", text: "Accepté" },
    Refusé: { type: "danger", text: "Refusé" },

    // Medical box statuses
    Disponible: { type: "success", text: "Disponible" },
    Assignée: { type: "info", text: "Assignée" },
    Expirée: { type: "danger", text: "Expirée" },
    "Bientôt Expirée": { type: "warning", text: "Bientôt Expirée" },
    "En Maintenance": { type: "warning", text: "En Maintenance" },

    // Dossier statuses
    Créé: { type: "secondary", text: "Créé" },
    Complété: { type: "success", text: "Complété" },
    Archivé: { type: "info", text: "Archivé" },
    Incomplet: { type: "warning", text: "Incomplet" },

    // General statuses
    Actif: { type: "success", text: "Actif" },
    Inactif: { type: "secondary", text: "Inactif" },
    Suspendu: { type: "warning", text: "Suspendu" },
    Supprimé: { type: "danger", text: "Supprimé" },

    // Priority levels
    Faible: { type: "info", text: "Faible" },
    Normale: { type: "secondary", text: "Normale" },
    Élevée: { type: "warning", text: "Élevée" },
    Critique: { type: "danger", text: "Critique" },
    Urgente: { type: "danger", text: "Urgente" },
  };

  // Get status configuration
  const statusConfig = statusMappings[status] || {
    type: type,
    text: status || "N/A",
  };

  // Build CSS classes
  const cssClasses = [
    "status-badge",
    `status-badge-${statusConfig.type}`,
    `status-badge-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cssClasses} title={statusConfig.text}>
      {statusConfig.text}
    </span>
  );
};

// Priority Badge Component
export const PriorityBadge = ({ priority, className = "" }) => {
  const priorityConfig = {
    1: { type: "info", text: "Faible", icon: "🔵" },
    2: { type: "secondary", text: "Normale", icon: "⚪" },
    3: { type: "warning", text: "Élevée", icon: "🟡" },
    4: { type: "danger", text: "Critique", icon: "🔴" },
    5: { type: "danger", text: "Urgente", icon: "🚨" },
  };

  const config = priorityConfig[priority] || priorityConfig[2];

  return (
    <StatusBadge
      status={config.text}
      type={config.type}
      className={`priority-badge ${className}`}
    />
  );
};

// Quantity Badge Component (for stock levels, etc.)
export const QuantityBadge = ({ quantity, threshold = 10, className = "" }) => {
  let type = "success";
  if (quantity === 0) {
    type = "danger";
  } else if (quantity <= threshold) {
    type = "warning";
  }

  return (
    <StatusBadge
      status={quantity?.toString() || "0"}
      type={type}
      className={`quantity-badge ${className}`}
    />
  );
};

// Progress Badge Component
export const ProgressBadge = ({
  current,
  total,
  showPercentage = true,
  className = "",
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  let type = "danger";
  if (percentage >= 90) {
    type = "success";
  } else if (percentage >= 70) {
    type = "info";
  } else if (percentage >= 50) {
    type = "warning";
  }

  const text = showPercentage ? `${percentage}%` : `${current}/${total}`;

  return (
    <StatusBadge
      status={text}
      type={type}
      className={`progress-badge ${className}`}
    />
  );
};

export default StatusBadge;
