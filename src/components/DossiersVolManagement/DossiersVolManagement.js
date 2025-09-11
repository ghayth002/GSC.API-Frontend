import React, { useState, useEffect } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./DossiersVolManagement.css";

const DossiersVolManagement = () => {
  const [dossiers, setDossiers] = useState([]);
  const [vols, setVols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDossier, setEditingDossier] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dossierToDelete, setDossierToDelete] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateDebut: "",
    dateFin: "",
  });

  // Status options
  const statusOptions = [
    { value: "Brouillon", label: "Brouillon" },
    { value: "EnCours", label: "En Cours" },
    { value: "Valide", label: "Validé" },
    { value: "Archive", label: "Archivé" },
  ];

  // Dossier form fields configuration
  const dossierFormFields = [
    {
      name: "volId",
      label: "Vol",
      type: "select",
      required: true,
      options: vols.map((vol) => ({
        value: vol.id,
        label: `${vol.flightNumber} - ${vol.flightDate} (${vol.origin} → ${vol.destination})`,
      })),
    },
    {
      name: "titre",
      label: "Titre du Dossier",
      type: "text",
      required: true,
      placeholder: "Ex: Dossier TU123 - 15/01/2024",
    },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: statusOptions,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 3,
      placeholder: "Description du dossier...",
    },
  ];

  // Generate form fields
  const generateFormFields = [
    {
      name: "volId",
      label: "Vol",
      type: "select",
      required: true,
      options: vols.map((vol) => ({
        value: vol.id,
        label: `${vol.flightNumber} - ${vol.flightDate} (${vol.origin} → ${vol.destination})`,
      })),
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
      key: "volInfo",
      label: "Vol",
      render: (dossier) => (
        <div>
          <strong>{dossier.vol?.flightNumber}</strong>
          <br />
          <small>
            {new Date(dossier.vol?.flightDate).toLocaleDateString()}
          </small>
        </div>
      ),
    },
    {
      key: "dateCreation",
      label: "Date Création",
      render: (dossier) => new Date(dossier.dateCreation).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "status",
      label: "Statut",
      render: (dossier) => (
        <StatusBadge
          status={dossier.status?.toLowerCase()}
          text={dossier.status}
        />
      ),
    },
    {
      key: "documentsCount",
      label: "Documents",
      render: (dossier) => dossier.documents?.length || 0,
    },
    {
      key: "actions",
      label: "Actions",
      render: (dossier) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => handleViewDetails(dossier)}
            title="Voir Détails"
          >
            👁️
          </button>
          {dossier.status === "EnCours" && (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => handleValidate(dossier)}
              title="Valider"
            >
              ✅
            </button>
          )}
          {dossier.status === "Valide" && (
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={() => handleArchive(dossier)}
              title="Archiver"
            >
              📦
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleEdit(dossier)}
            title="Modifier"
          >
            ✏️
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(dossier)}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadDossiers();
    loadVols();
  }, [filters]);

  const loadDossiers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getDossiersVol(filters);
      setDossiers(response.data || response);
    } catch (err) {
      setError("Erreur lors du chargement des dossiers");
      console.error("Error loading dossiers:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadVols = async () => {
    try {
      const response = await apiClient.getVols();
      setVols(response.data || response);
    } catch (err) {
      console.error("Error loading vols:", err);
    }
  };

  const handleAdd = () => {
    setEditingDossier(null);
    setShowModal(true);
  };

  const handleEdit = (dossier) => {
    setEditingDossier(dossier);
    setShowModal(true);
  };

  const handleDelete = (dossier) => {
    setDossierToDelete(dossier);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (dossier) => {
    // Implementation for viewing details
    alert(`Voir détails du dossier: ${dossier.titre}`);
  };

  const handleValidate = async (dossier) => {
    if (window.confirm(`Valider le dossier "${dossier.titre}" ?`)) {
      try {
        await apiClient.validateDossierVol(dossier.id);
        loadDossiers();
      } catch (err) {
        setError(err.message || "Erreur lors de la validation");
      }
    }
  };

  const handleArchive = async (dossier) => {
    if (window.confirm(`Archiver le dossier "${dossier.titre}" ?`)) {
      try {
        await apiClient.archiveDossierVol(dossier.id);
        loadDossiers();
      } catch (err) {
        setError(err.message || "Erreur lors de l'archivage");
      }
    }
  };

  const handleGenerate = () => {
    setShowGenerateModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (editingDossier) {
        await apiClient.updateDossierVol(editingDossier.id, formData);
      } else {
        await apiClient.createDossierVol(formData);
      }
      setShowModal(false);
      loadDossiers();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleGenerateSubmit = async (formData) => {
    try {
      setError(null);
      await apiClient.generateDossierFromVol(formData.volId);
      setShowGenerateModal(false);
      loadDossiers();
    } catch (err) {
      setError(err.message || "Erreur lors de la génération");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await apiClient.deleteDossierVol(dossierToDelete.id);
      setShowDeleteModal(false);
      setDossierToDelete(null);
      loadDossiers();
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
      status: "",
      dateDebut: "",
      dateFin: "",
    });
  };

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="dossiers-vol-management">
      <div className="page-header">
        <h1>📁 Gestion des Dossiers de Vol</h1>
        <div className="header-actions">
          <button className="btn btn-success" onClick={handleGenerate}>
            ⚡ Générer Dossier
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Nouveau Dossier
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <div className="stat-value">{dossiers.length}</div>
            <div className="stat-label">Total Dossiers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">
              {dossiers.filter((d) => d.status === "EnCours").length}
            </div>
            <div className="stat-label">En Cours</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">
              {dossiers.filter((d) => d.status === "Valide").length}
            </div>
            <div className="stat-label">Validés</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">
              {dossiers.filter((d) => d.status === "Archive").length}
            </div>
            <div className="stat-label">Archivés</div>
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
              placeholder="Titre du dossier..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Statut</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {statusOptions.map((option) => (
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
        data={dossiers}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun dossier trouvé"
      />

      {/* Dossier Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingDossier ? "Modifier le Dossier" : "Nouveau Dossier de Vol"
        }
        size="lg"
      >
        <Form
          fields={dossierFormFields}
          initialValues={editingDossier || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Generate Dossier Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Générer Dossier Automatiquement"
      >
        <div className="generate-info">
          <p>
            <strong>ℹ️ Information:</strong> Cette fonction génère
            automatiquement un dossier complet avec tous les documents associés
            au vol (BCP, BL, écarts, etc.).
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
        title="Supprimer le Dossier"
        message={`Êtes-vous sûr de vouloir supprimer le dossier "${dossierToDelete?.titre}" ?`}
        confirmText="Supprimer"
        confirmClass="btn-danger"
      />
    </div>
  );
};

export default DossiersVolManagement;
