import React, { useState, useEffect } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./EcartsManagement.css";

const EcartsManagement = () => {
  const [ecarts, setEcarts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEcart, setEditingEcart] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ecartToDelete, setEcartToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedEcart, setSelectedEcart] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    typeEcart: "",
    dateDebut: "",
    dateFin: "",
  });

  // Type d'écart options
  const typeEcartOptions = [
    { value: "QuantiteSuperieure", label: "Quantité Supérieure" },
    { value: "QuantiteInferieure", label: "Quantité Inférieure" },
    { value: "ArticleManquant", label: "Article Manquant" },
    { value: "ArticleSupplementaire", label: "Article Supplémentaire" },
    { value: "PrixDifferent", label: "Prix Différent" },
    { value: "QualiteNonConforme", label: "Qualité Non Conforme" },
  ];

  // Status options
  const statusOptions = [
    { value: "EnAttente", label: "En Attente" },
    { value: "EnCours", label: "En Cours" },
    { value: "Resolu", label: "Résolu" },
    { value: "Accepte", label: "Accepté" },
    { value: "Rejete", label: "Rejeté" },
  ];

  // Écart form fields configuration
  const ecartFormFields = [
    {
      name: "typeEcart",
      label: "Type d'Écart",
      type: "select",
      required: true,
      options: typeEcartOptions,
    },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: statusOptions,
    },
    {
      name: "quantiteCommandee",
      label: "Quantité Commandée",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "quantiteLivree",
      label: "Quantité Livrée",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 3,
      placeholder: "Description détaillée de l'écart...",
    },
    {
      name: "actionCorrective",
      label: "Action Corrective",
      type: "textarea",
      rows: 3,
      placeholder: "Action corrective proposée...",
    },
  ];

  // Resolve form fields
  const resolveFormFields = [
    {
      name: "actionCorrective",
      label: "Action Corrective",
      type: "textarea",
      rows: 4,
      required: true,
      placeholder: "Décrivez l'action corrective mise en place...",
    },
    {
      name: "notes",
      label: "Notes Additionnelles",
      type: "textarea",
      rows: 3,
      placeholder: "Notes supplémentaires...",
    },
  ];

  // Table columns configuration
  const columns = [
    {
      key: "typeEcart",
      label: "Type d'Écart",
      render: (ecart) => (
        <div className="type-ecart">
          <span className={`type-badge ${ecart.typeEcart?.toLowerCase()}`}>
            {typeEcartOptions.find((opt) => opt.value === ecart.typeEcart)
              ?.label || ecart.typeEcart}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "volInfo",
      label: "Vol",
      render: (ecart) => (
        <div>
          <strong>{ecart.vol?.flightNumber}</strong>
          <br />
          <small>{new Date(ecart.vol?.flightDate).toLocaleDateString()}</small>
        </div>
      ),
    },
    {
      key: "articleInfo",
      label: "Article",
      render: (ecart) => (
        <div>
          <strong>{ecart.article?.code}</strong>
          <br />
          <small>{ecart.article?.name}</small>
        </div>
      ),
    },
    {
      key: "quantites",
      label: "Quantités",
      render: (ecart) => (
        <div className="quantities">
          <div>
            Cmd: <strong>{ecart.quantiteCommandee}</strong>
          </div>
          <div>
            Liv: <strong>{ecart.quantiteLivree}</strong>
          </div>
          <div
            className={`ecart-qty ${
              ecart.ecartQuantite >= 0 ? "positive" : "negative"
            }`}
          >
            Écart:{" "}
            <strong>
              {ecart.ecartQuantite > 0 ? "+" : ""}
              {ecart.ecartQuantite}
            </strong>
          </div>
        </div>
      ),
    },
    {
      key: "ecartMontant",
      label: "Écart Montant",
      render: (ecart) => (
        <span
          className={`amount ${
            ecart.ecartMontant >= 0 ? "positive" : "negative"
          }`}
        >
          {ecart.ecartMontant > 0 ? "+" : ""}
          {ecart.ecartMontant?.toFixed(2)} TND
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      label: "Statut",
      render: (ecart) => (
        <StatusBadge
          status={ecart.status?.toLowerCase().replace(" ", "")}
          text={ecart.status}
        />
      ),
    },
    {
      key: "dateCreation",
      label: "Date Création",
      render: (ecart) => new Date(ecart.dateCreation).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (ecart) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => handleViewDetails(ecart)}
            title="Voir Détails"
          >
            👁️
          </button>
          {(ecart.status === "EnAttente" || ecart.status === "EnCours") && (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => handleResolve(ecart)}
              title="Résoudre"
            >
              ✅
            </button>
          )}
          {(ecart.status === "EnAttente" || ecart.status === "EnCours") && (
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={() => handleAccept(ecart)}
              title="Accepter"
            >
              👍
            </button>
          )}
          {(ecart.status === "EnAttente" || ecart.status === "EnCours") && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleReject(ecart)}
              title="Rejeter"
            >
              👎
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleEdit(ecart)}
            title="Modifier"
          >
            ✏️
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(ecart)}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadEcarts();
    loadStatistics();
  }, [filters]);

  const loadEcarts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getEcarts(filters);
      setEcarts(response.data || response);
    } catch (err) {
      setError("Erreur lors du chargement des écarts");
      console.error("Error loading écarts:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await apiClient.getEcartsStatistics();
      setStatistics(response);
    } catch (err) {
      console.error("Error loading statistics:", err);
    }
  };

  const handleAdd = () => {
    setEditingEcart(null);
    setShowModal(true);
  };

  const handleEdit = (ecart) => {
    setEditingEcart(ecart);
    setShowModal(true);
  };

  const handleDelete = (ecart) => {
    setEcartToDelete(ecart);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (ecart) => {
    setSelectedEcart(ecart);
    setShowDetailsModal(true);
  };

  const handleResolve = (ecart) => {
    setSelectedEcart(ecart);
    setShowResolveModal(true);
  };

  const handleAccept = async (ecart) => {
    if (window.confirm(`Êtes-vous sûr de vouloir accepter cet écart ?`)) {
      try {
        await apiClient.acceptEcart(ecart.id);
        loadEcarts();
        loadStatistics();
      } catch (err) {
        setError(err.message || "Erreur lors de l'acceptation");
      }
    }
  };

  const handleReject = async (ecart) => {
    const reason = prompt("Raison du rejet:");
    if (reason) {
      try {
        await apiClient.rejectEcart(ecart.id, { reason });
        loadEcarts();
        loadStatistics();
      } catch (err) {
        setError(err.message || "Erreur lors du rejet");
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (editingEcart) {
        await apiClient.updateEcart(editingEcart.id, formData);
      } else {
        await apiClient.createEcart(formData);
      }
      setShowModal(false);
      loadEcarts();
      loadStatistics();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleResolveSubmit = async (formData) => {
    try {
      setError(null);
      await apiClient.resolveEcart(selectedEcart.id, formData);
      setShowResolveModal(false);
      loadEcarts();
      loadStatistics();
    } catch (err) {
      setError(err.message || "Erreur lors de la résolution");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await apiClient.deleteEcart(ecartToDelete.id);
      setShowDeleteModal(false);
      setEcartToDelete(null);
      loadEcarts();
      loadStatistics();
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
      typeEcart: "",
      dateDebut: "",
      dateFin: "",
    });
  };

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="ecarts-management">
      <div className="page-header">
        <h1>⚠️ Gestion des Écarts</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Nouvel Écart
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">
              {statistics.totalEcarts || ecarts.length}
            </div>
            <div className="stat-label">Total Écarts</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">
              {statistics.ecartsEnAttente ||
                ecarts.filter((e) => e.status === "EnAttente").length}
            </div>
            <div className="stat-label">En Attente</div>
          </div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">
              {statistics.ecartsResolus ||
                ecarts.filter((e) => e.status === "Resolu").length}
            </div>
            <div className="stat-label">Résolus</div>
          </div>
        </div>
        <div className="stat-card impact">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">
              {statistics.impactFinancier?.toFixed(0) ||
                ecarts
                  .reduce((sum, e) => sum + Math.abs(e.ecartMontant || 0), 0)
                  .toFixed(0)}{" "}
              TND
            </div>
            <div className="stat-label">Impact Financier</div>
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
              placeholder="Vol, article..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Type d'Écart</label>
            <select
              value={filters.typeEcart}
              onChange={(e) => handleFilterChange("typeEcart", e.target.value)}
            >
              <option value="">Tous les types</option>
              {typeEcartOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
        data={ecarts}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun écart trouvé"
      />

      {/* Écart Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEcart ? "Modifier l'Écart" : "Nouvel Écart"}
        size="lg"
      >
        <Form
          fields={ecartFormFields}
          initialValues={editingEcart || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Resolve Écart Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Résoudre l'Écart"
      >
        <div className="resolve-info">
          <p>
            <strong>Écart:</strong> {selectedEcart?.typeEcart}
          </p>
          <p>
            <strong>Vol:</strong> {selectedEcart?.vol?.flightNumber}
          </p>
          <p>
            <strong>Article:</strong> {selectedEcart?.article?.name}
          </p>
        </div>
        <Form
          fields={resolveFormFields}
          initialValues={{}}
          onSubmit={handleResolveSubmit}
          onCancel={() => setShowResolveModal(false)}
        />
      </Modal>

      {/* Écart Details Modal */}
      {selectedEcart && (
        <EcartDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          ecart={selectedEcart}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'Écart"
        message={`Êtes-vous sûr de vouloir supprimer cet écart ?`}
        confirmText="Supprimer"
        confirmClass="btn-danger"
      />
    </div>
  );
};

// Écart Details Modal Component
const EcartDetailsModal = ({ isOpen, onClose, ecart }) => {
  const [ecartDetails, setEcartDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && ecart) {
      loadEcartDetails();
    }
  }, [isOpen, ecart]);

  const loadEcartDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEcartById(ecart.id);
      setEcartDetails(response);
    } catch (err) {
      setError("Erreur lors du chargement des détails");
    } finally {
      setLoading(false);
    }
  };

  const typeEcartOptions = [
    { value: "QuantiteSuperieure", label: "Quantité Supérieure" },
    { value: "QuantiteInferieure", label: "Quantité Inférieure" },
    { value: "ArticleManquant", label: "Article Manquant" },
    { value: "ArticleSupplementaire", label: "Article Supplémentaire" },
    { value: "PrixDifferent", label: "Prix Différent" },
    { value: "QualiteNonConforme", label: "Qualité Non Conforme" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de l'Écart"
      size="xl"
    >
      <div className="ecart-details">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Chargement...</div>
        ) : ecartDetails ? (
          <div className="details-content">
            {/* Écart Header Info */}
            <div className="details-header">
              <div className="row">
                <div className="col-md-6">
                  <h5>Informations Générales</h5>
                  <table className="details-table">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Type d'Écart:</strong>
                        </td>
                        <td>
                          <span
                            className={`type-badge ${ecartDetails.typeEcart?.toLowerCase()}`}
                          >
                            {
                              typeEcartOptions.find(
                                (opt) => opt.value === ecartDetails.typeEcart
                              )?.label
                            }
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Vol:</strong>
                        </td>
                        <td>
                          {ecartDetails.vol?.flightNumber} -{" "}
                          {ecartDetails.vol?.flightDate}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Article:</strong>
                        </td>
                        <td>
                          {ecartDetails.article?.code} -{" "}
                          {ecartDetails.article?.name}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Statut:</strong>
                        </td>
                        <td>
                          <StatusBadge
                            status={ecartDetails.status
                              ?.toLowerCase()
                              .replace(" ", "")}
                            text={ecartDetails.status}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Date Création:</strong>
                        </td>
                        <td>
                          {new Date(ecartDetails.dateCreation).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h5>Quantités et Montants</h5>
                  <table className="details-table">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Quantité Commandée:</strong>
                        </td>
                        <td>{ecartDetails.quantiteCommandee}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Quantité Livrée:</strong>
                        </td>
                        <td>{ecartDetails.quantiteLivree}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Écart Quantité:</strong>
                        </td>
                        <td
                          className={`ecart-value ${
                            ecartDetails.ecartQuantite >= 0
                              ? "positive"
                              : "negative"
                          }`}
                        >
                          {ecartDetails.ecartQuantite > 0 ? "+" : ""}
                          {ecartDetails.ecartQuantite}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Écart Montant:</strong>
                        </td>
                        <td
                          className={`ecart-value ${
                            ecartDetails.ecartMontant >= 0
                              ? "positive"
                              : "negative"
                          }`}
                        >
                          {ecartDetails.ecartMontant > 0 ? "+" : ""}
                          {ecartDetails.ecartMontant?.toFixed(2)} TND
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Description */}
            {ecartDetails.description && (
              <div className="details-section">
                <h5>Description</h5>
                <p>{ecartDetails.description}</p>
              </div>
            )}

            {/* Action Corrective */}
            {ecartDetails.actionCorrective && (
              <div className="details-section">
                <h5>Action Corrective</h5>
                <p>{ecartDetails.actionCorrective}</p>
              </div>
            )}

            {/* BCP/BL Info */}
            <div className="details-section">
              <h5>Documents Associés</h5>
              <div className="row">
                <div className="col-md-6">
                  {ecartDetails.bonCommandePrevisionnel && (
                    <div className="document-info">
                      <strong>BCP:</strong>{" "}
                      {ecartDetails.bonCommandePrevisionnel.numero}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  {ecartDetails.bonLivraison && (
                    <div className="document-info">
                      <strong>BL:</strong> {ecartDetails.bonLivraison.numero}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default EcartsManagement;
