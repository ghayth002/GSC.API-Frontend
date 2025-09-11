import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import EmailVerification from "./components/EmailVerification/EmailVerification";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import AuthCallback from "./components/AuthCallback/AuthCallback";

import Dashboard from "./components/Dashboard/Dashboard";
import UserManagement from "./components/UserManagement/UserManagement";
import FlightManagement from "./components/FlightManagement";
import MenuManagement from "./components/MenuManagement";
import ArticleManagement from "./components/ArticleManagement";
import ModulePlaceholder from "./components/Placeholder/ModulePlaceholder";
import LoadingDemo from "./components/LoadingDemo/LoadingDemo";
import "./styles/global.css";

// Module placeholder configurations
const moduleConfigs = {
  menus: {
    title: "Menus & Plan d'hébergement",
    description:
      "Gestion des menus de restauration et des plans d'hébergement pour les vols.",
    icon: "🍽️",
    features: [
      "Création et modification des menus par classe de service",
      "Gestion des rotations de menus",
      "Association des menus aux routes et saisons",
      "Calcul automatique des quantités par vol",
      "Interface graphique pour la conception des menus",
      "Export des fiches techniques pour la cuisine",
    ],
  },
  budget: {
    title: "Génération de l'état budgétaire & des prévisions",
    description:
      "Outils de génération d'états budgétaires et de prévisions financières.",
    icon: "📊",
    features: [
      "Génération automatique des états budgétaires",
      "Prévisions basées sur l'historique",
      "Analyse des coûts par route et période",
      "Tableaux de bord avec indicateurs clés",
      "Export vers Excel et PDF",
      "Comparaison budget vs réalisé",
    ],
  },
  "flight-file": {
    title: "Dossier de vol",
    description:
      "Gestion complète des dossiers de vol avec toutes les informations de catering.",
    icon: "✈️",
    features: [
      "Création automatique des dossiers de vol",
      "Consolidation des bons de commande",
      "Checklists de contrôle qualité",
      "Gestion des repas équipage",
      "Documents LDM (Load and Dispatch Message)",
      "Suivi en temps réel du statut des vols",
    ],
  },
  orders: {
    title: "Gestion des commandes de prestation",
    description:
      "Système complet de gestion des commandes de prestation catering.",
    icon: "📋",
    features: [
      "Création des bons de commande (BC)",
      "Gestion des types: Prévisionnel, Ajustement, PN",
      "Workflow d'approbation",
      "Suivi des statuts de commande",
      "Interface fournisseurs",
      "Historique complet des modifications",
    ],
  },
  supplies: {
    title: "Approvisionnement et suivi des consommables",
    description:
      "Gestion de l'approvisionnement et suivi des consommables, semi-consommables et matériel.",
    icon: "📦",
    features: [
      "Gestion des stocks en temps réel",
      "Calcul automatique des dotations",
      "Suivi des dates d'expiration",
      "Alertes de réapprovisionnement",
      "Gestion des fournisseurs et articles",
      "Traçabilité complète des mouvements",
    ],
  },
  delivery: {
    title: "Contrôle des BLs fournisseur",
    description:
      "Système de contrôle et réconciliation des bons de livraison fournisseurs.",
    icon: "📄",
    features: [
      "Import automatique des BL depuis Winflight",
      "Réconciliation BC vs BL",
      "Contrôle qualité des livraisons",
      "Gestion des écarts et réclamations",
      "Validation par les équipes terrain",
      "Reporting des performances fournisseurs",
    ],
  },
  medical: {
    title: "Gestion des boîtes docteur et pharmacie",
    description: "Gestion complète des boîtes médicales embarquées.",
    icon: "⚕️",
    features: [
      "Inventaire des boîtes docteur et pharmacie",
      "Suivi des dates d'expiration des médicaments",
      "Affectation par aéronef",
      "Contrôles réglementaires",
      "Planning de renouvellement",
      "Traçabilité des interventions médicales",
    ],
  },
  reports: {
    title: "Statistiques et reporting",
    description:
      "Outils avancés de statistiques et de reporting pour le pilotage de l'activité.",
    icon: "📈",
    features: [
      "Tableaux de bord interactifs",
      "KPIs de performance en temps réel",
      "Analyses de tendances",
      "Rapports personnalisables",
      "Export multi-formats",
      "Alertes automatiques",
    ],
  },
};

const App = () => {
  return (
    <div className="App">
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* User Management - Admin/Manager only */}
              <Route
                path="/dashboard/users"
                element={
                  <ProtectedRoute requiredRoles={["Administrator", "Manager"]}>
                    <Dashboard>
                      <UserManagement />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              {/* Module Routes - All with placeholders */}
              <Route
                path="/dashboard/menus"
                element={
                  <ProtectedRoute>
                    <Dashboard>
                      <MenuManagement />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              {/* Articles Management */}
              <Route
                path="/dashboard/articles"
                element={
                  <ProtectedRoute>
                    <Dashboard>
                      <ArticleManagement />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/budget"
                element={
                  <ProtectedRoute requiredRoles={["Administrator", "Manager"]}>
                    <Dashboard>
                      <ModulePlaceholder {...moduleConfigs.budget} />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              {/* Flight Management */}
              <Route
                path="/dashboard/flights"
                element={
                  <ProtectedRoute>
                    <Dashboard>
                      <FlightManagement />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/flight-file"
                element={
                  <ProtectedRoute>
                    <Dashboard>
                      <ModulePlaceholder {...moduleConfigs["flight-file"]} />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/orders"
                element={
                  <ProtectedRoute>
                    <Dashboard>
                      <ModulePlaceholder {...moduleConfigs.orders} />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/supplies"
                element={
                  <ProtectedRoute>
                    <Dashboard>
                      <ModulePlaceholder {...moduleConfigs.supplies} />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/delivery"
                element={
                  <ProtectedRoute>
                    <Dashboard>
                      <ModulePlaceholder {...moduleConfigs.delivery} />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/medical"
                element={
                  <ProtectedRoute>
                    <Dashboard>
                      <ModulePlaceholder {...moduleConfigs.medical} />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/reports"
                element={
                  <ProtectedRoute requiredRoles={["Administrator", "Manager"]}>
                    <Dashboard>
                      <ModulePlaceholder {...moduleConfigs.reports} />
                    </Dashboard>
                  </ProtectedRoute>
                }
              />

              {/* Loading Demo - for development/showcase */}
              <Route path="/loading-demo" element={<LoadingDemo />} />

              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </div>
  );
};

export default App;
