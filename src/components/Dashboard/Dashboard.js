import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = ({ children }) => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      await logout();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    return user?.userName?.charAt(0).toUpperCase() || "U";
  };

  const menuItems = [
    {
      id: "flights",
      label: "Gestion des vols",
      path: "/dashboard/flights",
      icon: "🛫",
      roles: ["Administrator", "Manager", "User"],
    },
    {
      id: "menus",
      label: "Menus & plan d'hébergement",
      path: "/dashboard/menus",
      icon: "🍽️",
      roles: ["Administrator", "Manager", "User"],
    },
    {
      id: "articles",
      label: "Gestion des articles",
      path: "/dashboard/articles",
      icon: "📦",
      roles: ["Administrator", "Manager", "User"],
    },
    {
      id: "budget",
      label: "Génération de l'état budgétaire & des prévisions",
      path: "/dashboard/budget",
      icon: "📊",
      roles: ["Administrator", "Manager"],
    },
    {
      id: "flight-file",
      label: "Dossier de vol",
      path: "/dashboard/flight-file",
      icon: "✈️",
      roles: ["Administrator", "Manager", "User"],
    },
    {
      id: "orders",
      label: "Gestion des commandes de prestation",
      path: "/dashboard/orders",
      icon: "📋",
      roles: ["Administrator", "Manager", "User"],
    },
    {
      id: "supplies",
      label:
        "Approvisionnement et suivi des consommable, semi-consommable et matériel",
      path: "/dashboard/supplies",
      icon: "📦",
      roles: ["Administrator", "Manager", "User"],
    },
    {
      id: "delivery",
      label: "Contrôle des BLs fournisseur",
      path: "/dashboard/delivery",
      icon: "📄",
      roles: ["Administrator", "Manager", "User"],
    },
    {
      id: "medical",
      label: "Gestion des boites docteur et des boites pharmacie",
      path: "/dashboard/medical",
      icon: "⚕️",
      roles: ["Administrator", "Manager", "User"],
    },
    {
      id: "reports",
      label: "Statistiques et reporting",
      path: "/dashboard/reports",
      icon: "📈",
      roles: ["Administrator", "Manager"],
    },
  ];

  // Filter menu items based on user roles
  const visibleMenuItems = menuItems.filter((item) => {
    if (!user?.roles) return false;
    return item.roles.some((role) => user.roles.includes(role));
  });

  const isActiveRoute = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="tunisair-logo-sidebar">
              {isSidebarCollapsed ? (
                <div className="logo-compact">
                  <img
                    src="/tunisair-logo.svg"
                    alt="Tunisair Logo"
                    className="logo-image-sidebar-compact"
                  />
                </div>
              ) : (
                <>
                  <div className="logo-image-container">
                    <img
                      src="/tunisair-logo.svg"
                      alt="Tunisair Logo"
                      className="logo-image-sidebar"
                    />
                  </div>
                  <div className="logo-text-sidebar">
                    <div className="logo-text-ar-sidebar">الخطوط التونسية</div>
                    <div className="logo-text-fr-sidebar">TUNISAIR</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isSidebarCollapsed && (
            <div className="app-title">
              <h2>GESTION DE LA SOUS-TRAITANCE CATERING</h2>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {visibleMenuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${
                    isActiveRoute(item.path) ? "active" : ""
                  }`}
                  title={isSidebarCollapsed ? item.label : ""}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="nav-text">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Management Section for Admins */}
        {(isAdmin() || isManager()) && (
          <div className="sidebar-section">
            {!isSidebarCollapsed && (
              <div className="section-title">Administration</div>
            )}
            <ul className="nav-menu">
              <li className="nav-item">
                <Link
                  to="/dashboard/users"
                  className={`nav-link ${
                    isActiveRoute("/dashboard/users") ? "active" : ""
                  }`}
                  title={isSidebarCollapsed ? "Gestion des utilisateurs" : ""}
                >
                  <span className="nav-icon">👥</span>
                  {!isSidebarCollapsed && (
                    <span className="nav-text">Gestion des utilisateurs</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        )}

        <div className="sidebar-footer">
          <button
            onClick={toggleSidebar}
            className="sidebar-toggle"
            title={
              isSidebarCollapsed ? "Développer le menu" : "Réduire le menu"
            }
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">
              {location.pathname === "/dashboard"
                ? "Tableau de bord"
                : "GsC Dashboard"}
            </h1>
          </div>

          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">{getUserInitials()}</div>
              <div className="user-details">
                <span className="user-name">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.userName || "Utilisateur"}
                </span>
                <span className="user-role">
                  {user?.roles?.join(", ") || "Utilisateur"}
                </span>
              </div>
              <div className="user-actions">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Se déconnecter"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">{children || <DashboardHome />}</div>
      </div>
    </div>
  );
};

// Default dashboard home content
const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h2>
          Bienvenue, {user?.firstName || user?.userName || "Utilisateur"} !
        </h2>
        <p>
          Système de gestion de la sous-traitance du catering pour Tunisair.
          Utilisez le menu de navigation pour accéder aux différents modules du
          système.
        </p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">🍽️</div>
          <div className="card-content">
            <h3>Menus</h3>
            <p>Gérer les menus et plans d'hébergement</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>Commandes</h3>
            <p>Suivi des commandes de prestation</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">✈️</div>
          <div className="card-content">
            <h3>Vols</h3>
            <p>Gestion des dossiers de vol</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Rapports</h3>
            <p>Statistiques et reporting</p>
          </div>
        </div>
      </div>

      <div className="system-info">
        <div className="info-card">
          <h4>Informations système</h4>
          <ul>
            <li>
              <strong>Version:</strong> 1.0.0
            </li>
            <li>
              <strong>Statut:</strong> Actif
            </li>
            <li>
              <strong>Dernier mise à jour:</strong>{" "}
              {new Date().toLocaleDateString("fr-FR")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
