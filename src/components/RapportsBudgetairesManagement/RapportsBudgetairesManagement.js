import React, { useState, useEffect } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./RapportsBudgetairesManagement.css";

const RapportsBudgetairesManagement = () => {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRapport, setEditingRapport] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rapportToDelete, setRapportToDelete] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    typeRapport: "",
    dateDebut: "",
    dateFin: "",
  });

  // Type de rapport options
  const typeRapportOptions = [
    { value: "Quotidien", label: "Quotidien" },
    { value: "Hebdomadaire", label: "Hebdomadaire" },
    { value: "Mensuel", label: "Mensuel" },
    { value: "Trimestriel", label: "Trimestriel" },
    { value: "Annuel", label: "Annuel" },
    { value: "Personnalise", label: "Personnalisé" },
  ];

  // Rapport form fields configuration
  const rapportFormFields = [
    {
      name: "titre",
      label: "Titre du Rapport",
      type: "text",
      required: true,
      placeholder: "Ex: Rapport Mensuel Janvier 2024",
    },
    {
      name: "typeRapport",
      label: "Type de Rapport",
      type: "select",
      required: true,
      options: typeRapportOptions,
    },
    {
      name: "dateDebut",
      label: "Date Début",
      type: "date",
      required: true,
    },
    {
      name: "dateFin",
      label: "Date Fin",
      type: "date",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 3,
      placeholder: "Description du rapport...",
    },
  ];

  // Generate form fields
  const generateFormFields = [
    {
      name: "titre",
      label: "Titre du Rapport",
      type: "text",
      required: true,
      placeholder: "Ex: Rapport Mensuel Janvier 2024",
    },
    {
      name: "typeRapport",
      label: "Type de Rapport",
      type: "select",
      required: true,
      options: typeRapportOptions,
    },
    {
      name: "dateDebut",
      label: "Date Début",
      type: "date",
      required: true,
    },
    {
      name: "dateFin",
      label: "Date Fin",
      type: "date",
      required: true,
    },
  ];

  // Table columns configuration
  const columns = [
    {
      key: "titre",
      label: "Titre",
      sortable: true,
    },
    {
      key: "typeRapport",
      label: "Type",
      sortable: true,
    },
    {
      key: "periode",
      label: "Période",
      render: (rapport) => (
        <div>
          {new Date(rapport.dateDebut).toLocaleDateString()} -{" "}
          {new Date(rapport.dateFin).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "dateGeneration",
      label: "Date Génération",
      render: (rapport) =>
        new Date(rapport.dateGeneration).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "montantTotal",
      label: "Montant Total",
      render: (rapport) => `${rapport.montantTotal?.toFixed(2) || "0.00"} TND`,
      sortable: true,
    },
    {
      key: "status",
      label: "Statut",
      render: (rapport) => (
        <StatusBadge
          status={rapport.status?.toLowerCase()}
          text={rapport.status || "Généré"}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (rapport) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => handleViewDetails(rapport)}
            title="Voir Détails"
          >
            👁️
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => handleExport(rapport)}
            title="Exporter PDF"
          >
            📄
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleEdit(rapport)}
            title="Modifier"
          >
            ✏️
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(rapport)}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadRapports();
    loadPerformanceData();
    loadTrendsData();
  }, [filters]);

  const loadRapports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getRapportsBudgetaires(filters);
      setRapports(response.data || response);
    } catch (err) {
      setError("Erreur lors du chargement des rapports");
      console.error("Error loading rapports:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const response = await apiClient.getPerformanceByZone();
      setPerformanceData(response.data || response);
    } catch (err) {
      console.error("Error loading performance data:", err);
    }
  };

  const loadTrendsData = async () => {
    try {
      const response = await apiClient.getMonthlyTrends();
      setTrendsData(response.data || response);
    } catch (err) {
      console.error("Error loading trends data:", err);
    }
  };

  const handleAdd = () => {
    setEditingRapport(null);
    setShowModal(true);
  };

  const handleEdit = (rapport) => {
    setEditingRapport(rapport);
    setShowModal(true);
  };

  const handleDelete = (rapport) => {
    setRapportToDelete(rapport);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (rapport) => {
    // Implementation for viewing details
    alert(`Voir détails du rapport: ${rapport.titre}`);
  };

  const handleExport = (rapport) => {
    // Implementation for exporting
    alert(`Exporter le rapport: ${rapport.titre}`);
  };

  const handleGenerate = () => {
    setShowGenerateModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (editingRapport) {
        await apiClient.updateRapportBudgetaire(editingRapport.id, formData);
      } else {
        await apiClient.generateRapportBudgetaire(formData);
      }
      setShowModal(false);
      loadRapports();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleGenerateSubmit = async (formData) => {
    try {
      setError(null);
      await apiClient.generateRapportBudgetaire(formData);
      setShowGenerateModal(false);
      loadRapports();
    } catch (err) {
      setError(err.message || "Erreur lors de la génération");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await apiClient.deleteRapportBudgetaire(rapportToDelete.id);
      setShowDeleteModal(false);
      setRapportToDelete(null);
      loadRapports();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      typeRapport: "",
      dateDebut: "",
      dateFin: "",
    });
  };

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="rapports-budgetaires-management">
      <div className="page-header">
        <h1>📊 Rapports Budgétaires</h1>
        <div className="header-actions">
          <button className="btn btn-success" onClick={handleGenerate}>
            📈 Générer Rapport
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Nouveau Rapport
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Analytics Dashboard */}
      <div className="analytics-dashboard">
        {/* Statistics Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{rapports.length}</div>
              <div className="stat-label">Total Rapports</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-value">
                {rapports
                  .reduce((sum, r) => sum + (r.montantTotal || 0), 0)
                  .toFixed(0)}{" "}
                TND
              </div>
              <div className="stat-label">Montant Total</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <div className="stat-value">
                {rapports.filter((r) => r.typeRapport === "Mensuel").length}
              </div>
              <div className="stat-label">Rapports Mensuels</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <div className="stat-value">{performanceData.length}</div>
              <div className="stat-label">Zones Analysées</div>
            </div>
          </div>
        </div>

        {/* Performance by Zone */}
        <div className="performance-section">
          <h3>Performance par Zone</h3>
          <div className="performance-cards">
            {performanceData.map((zone, index) => (
              <div key={index} className="performance-card">
                <div className="zone-name">
                  {zone.zone || `Zone ${index + 1}`}
                </div>
                <div className="zone-metrics">
                  <div className="metric">
                    <span className="metric-label">Vols:</span>
                    <span className="metric-value">{zone.totalVols || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Montant:</span>
                    <span className="metric-value">
                      {zone.montantTotal?.toFixed(0) || 0} TND
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="trends-section">
          <h3>Tendances Mensuelles</h3>
          <div className="trends-chart">
            {trendsData.map((trend, index) => (
              <div key={index} className="trend-item">
                <div className="trend-month">
                  {trend.mois || `Mois ${index + 1}`}
                </div>
                <div className="trend-bar">
                  <div
                    className="trend-fill"
                    style={{
                      width: `${Math.min(100, (trend.montant || 0) / 1000)}%`,
                      backgroundColor: "#007bff",
                    }}
                  ></div>
                </div>
                <div className="trend-value">
                  {trend.montant?.toFixed(0) || 0} TND
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Titre du rapport..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Type de Rapport</label>
            <select
              value={filters.typeRapport}
              onChange={(e) =>
                handleFilterChange("typeRapport", e.target.value)
              }
            >
              <option value="">Tous les types</option>
              {typeRapportOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Date Début</label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => handleFilterChange("dateDebut", e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Date Fin</label>
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => handleFilterChange("dateFin", e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <button
              className="btn btn-outline-secondary"
              onClick={resetFilters}
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={rapports}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun rapport trouvé"
      />

      {/* Rapport Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingRapport ? "Modifier le Rapport" : "Nouveau Rapport Budgétaire"
        }
        size="lg"
      >
        <Form
          fields={rapportFormFields}
          initialValues={editingRapport || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Generate Rapport Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Générer Rapport Budgétaire"
      >
        <div className="generate-info">
          <p>
            <strong>ℹ️ Information:</strong> Cette fonction génère
            automatiquement un rapport budgétaire avec analyses et graphiques
            pour la période sélectionnée.
          </p>
        </div>
        <Form
          fields={generateFormFields}
          initialValues={{}}
          onSubmit={handleGenerateSubmit}
          onCancel={() => setShowGenerateModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le Rapport"
        message={`Êtes-vous sûr de vouloir supprimer le rapport "${rapportToDelete?.titre}" ?`}
        confirmText="Supprimer"
        confirmClass="btn-danger"
      />
    </div>
  );
};

export default RapportsBudgetairesManagement;
