import React, { useState, useEffect } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./BCPManagement.css";

const BCPManagement = () => {
  const [bcps, setBCPs] = useState([]);
  const [vols, setVols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBCP, setEditingBCP] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bcpToDelete, setBCPToDelete] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBCP, setSelectedBCP] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    fournisseur: "",
    dateDebut: "",
    dateFin: "",
  });

  // Status options
  const statusOptions = [
    { value: "Brouillon", label: "Brouillon" },
    { value: "Envoye", label: "Envoyé" },
    { value: "Confirme", label: "Confirmé" },
    { value: "Annule", label: "Annulé" },
  ];

  // BCP form fields configuration
  const bcpFormFields = [
    {
      name: "numero",
      label: "Numéro BCP",
      type: "text",
      required: true,
      placeholder: "Ex: BCP-TU123-20240115-001",
    },
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
      name: "dateCommande",
      label: "Date de Commande",
      type: "datetime-local",
      required: true,
    },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: statusOptions,
    },
    {
      name: "fournisseur",
      label: "Fournisseur",
      type: "select",
      required: true,
      options: [
        { value: "NewRest", label: "NewRest" },
        { value: "Servair", label: "Servair" },
        { value: "Gate Gourmet", label: "Gate Gourmet" },
        { value: "LSG Sky Chefs", label: "LSG Sky Chefs" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      rows: 3,
      placeholder: "Notes additionnelles...",
    },
  ];

  // Generate BCP form fields
  const generateBCPFields = [
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
      name: "fournisseur",
      label: "Fournisseur",
      type: "select",
      required: true,
      options: [
        { value: "NewRest", label: "NewRest" },
        { value: "Servair", label: "Servair" },
        { value: "Gate Gourmet", label: "Gate Gourmet" },
        { value: "LSG Sky Chefs", label: "LSG Sky Chefs" },
      ],
    },
  ];

  // Table columns configuration
  const columns = [
    {
      key: "numero",
      label: "Numéro BCP",
      sortable: true,
    },
    {
      key: "volInfo",
      label: "Vol",
      render: (bcp) => (
        <div>
          <strong>{bcp.vol?.flightNumber}</strong>
          <br />
          <small>{new Date(bcp.vol?.flightDate).toLocaleDateString()}</small>
        </div>
      ),
    },
    {
      key: "dateCommande",
      label: "Date Commande",
      render: (bcp) => new Date(bcp.dateCommande).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "fournisseur",
      label: "Fournisseur",
      sortable: true,
    },
    {
      key: "montantTotal",
      label: "Montant Total",
      render: (bcp) => `${bcp.montantTotal?.toFixed(2) || "0.00"} TND`,
      sortable: true,
    },
    {
      key: "status",
      label: "Statut",
      render: (bcp) => (
        <StatusBadge status={bcp.status?.toLowerCase()} text={bcp.status} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (bcp) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => handleViewDetails(bcp)}
            title="Voir Détails"
          >
            👁️
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleChangeStatus(bcp)}
            title="Changer Statut"
          >
            🔄
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleEdit(bcp)}
            title="Modifier"
          >
            ✏️
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(bcp)}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadBCPs();
    loadVols();
  }, [filters]);

  const loadBCPs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getBCP(filters);
      setBCPs(response.data || response);
    } catch (err) {
      setError("Erreur lors du chargement des BCP");
      console.error("Error loading BCPs:", err);
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
    setEditingBCP(null);
    setShowModal(true);
  };

  const handleEdit = (bcp) => {
    setEditingBCP(bcp);
    setShowModal(true);
  };

  const handleDelete = (bcp) => {
    setBCPToDelete(bcp);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (bcp) => {
    setSelectedBCP(bcp);
    setShowDetailsModal(true);
  };

  const handleChangeStatus = async (bcp) => {
    const newStatus = prompt("Nouveau statut:", bcp.status);
    if (newStatus && newStatus !== bcp.status) {
      try {
        await apiClient.updateBCPStatus(bcp.id, { status: newStatus });
        loadBCPs();
      } catch (err) {
        setError(err.message || "Erreur lors du changement de statut");
      }
    }
  };

  const handleGenerate = () => {
    setShowGenerateModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (editingBCP) {
        await apiClient.updateBCP(editingBCP.id, formData);
      } else {
        await apiClient.createBCP(formData);
      }
      setShowModal(false);
      loadBCPs();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleGenerateBCP = async (formData) => {
    try {
      setError(null);
      await apiClient.generateBCPFromVol(formData.volId, {
        fournisseur: formData.fournisseur,
      });
      setShowGenerateModal(false);
      loadBCPs();
    } catch (err) {
      setError(err.message || "Erreur lors de la génération");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await apiClient.deleteBCP(bcpToDelete.id);
      setShowDeleteModal(false);
      setBCPToDelete(null);
      loadBCPs();
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
      fournisseur: "",
      dateDebut: "",
      dateFin: "",
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "brouillon":
        return "draft";
      case "envoye":
        return "sent";
      case "confirme":
        return "confirmed";
      case "annule":
        return "cancelled";
      default:
        return "default";
    }
  };

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="bcp-management">
      <div className="page-header">
        <h1>📝 Gestion des BCP (Bons de Commande Prévisionnels)</h1>
        <div className="header-actions">
          <button className="btn btn-success" onClick={handleGenerate}>
            ⚡ Générer BCP
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Nouveau BCP
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Numéro BCP..."
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
            <label>Fournisseur</label>
            <select
              value={filters.fournisseur}
              onChange={(e) =>
                handleFilterChange("fournisseur", e.target.value)
              }
            >
              <option value="">Tous les fournisseurs</option>
              <option value="NewRest">NewRest</option>
              <option value="Servair">Servair</option>
              <option value="Gate Gourmet">Gate Gourmet</option>
              <option value="LSG Sky Chefs">LSG Sky Chefs</option>
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

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{bcps.length}</div>
            <div className="stat-label">Total BCP</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <div className="stat-value">
              {bcps.filter((bcp) => bcp.status === "Envoye").length}
            </div>
            <div className="stat-label">Envoyés</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">
              {bcps.filter((bcp) => bcp.status === "Confirme").length}
            </div>
            <div className="stat-label">Confirmés</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">
              {bcps
                .reduce((sum, bcp) => sum + (bcp.montantTotal || 0), 0)
                .toFixed(0)}{" "}
              TND
            </div>
            <div className="stat-label">Montant Total</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={bcps}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun BCP trouvé"
      />

      {/* BCP Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBCP ? "Modifier le BCP" : "Nouveau BCP"}
        size="lg"
      >
        <Form
          fields={bcpFormFields}
          initialValues={editingBCP || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Generate BCP Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Générer BCP Automatiquement"
      >
        <div className="generate-info">
          <p>
            <strong>ℹ️ Information:</strong> Cette fonction génère
            automatiquement un BCP basé sur le plan d'hébergement et les menus
            associés au vol sélectionné.
          </p>
        </div>
        <Form
          fields={generateBCPFields}
          initialValues={{}}
          onSubmit={handleGenerateBCP}
          onCancel={() => setShowGenerateModal(false)}
        />
      </Modal>

      {/* BCP Details Modal */}
      {selectedBCP && (
        <BCPDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          bcp={selectedBCP}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le BCP"
        message={`Êtes-vous sûr de vouloir supprimer le BCP "${bcpToDelete?.numero}" ?`}
        confirmText="Supprimer"
        confirmClass="btn-danger"
      />
    </div>
  );
};

// BCP Details Modal Component
const BCPDetailsModal = ({ isOpen, onClose, bcp }) => {
  const [bcpDetails, setBCPDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bcp) {
      loadBCPDetails();
    }
  }, [isOpen, bcp]);

  const loadBCPDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBCPById(bcp.id);
      setBCPDetails(response);
    } catch (err) {
      setError("Erreur lors du chargement des détails");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails BCP: ${bcp?.numero}`}
      size="xl"
    >
      <div className="bcp-details">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Chargement...</div>
        ) : bcpDetails ? (
          <div className="details-content">
            {/* BCP Header Info */}
            <div className="details-header">
              <div className="row">
                <div className="col-md-6">
                  <h5>Informations Générales</h5>
                  <table className="details-table">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Numéro:</strong>
                        </td>
                        <td>{bcpDetails.numero}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Vol:</strong>
                        </td>
                        <td>
                          {bcpDetails.vol?.flightNumber} -{" "}
                          {bcpDetails.vol?.flightDate}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Date Commande:</strong>
                        </td>
                        <td>
                          {new Date(bcpDetails.dateCommande).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Fournisseur:</strong>
                        </td>
                        <td>{bcpDetails.fournisseur}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Statut:</strong>
                        </td>
                        <td>
                          <StatusBadge
                            status={bcpDetails.status?.toLowerCase()}
                            text={bcpDetails.status}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h5>Montants</h5>
                  <table className="details-table">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Montant Total:</strong>
                        </td>
                        <td className="amount">
                          {bcpDetails.montantTotal?.toFixed(2)} TND
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Nombre d'articles:</strong>
                        </td>
                        <td>{bcpDetails.lignes?.length || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BCP Lines */}
            <div className="details-lines">
              <h5>Lignes de Commande</h5>
              {bcpDetails.lignes && bcpDetails.lignes.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Code</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bcpDetails.lignes.map((ligne, index) => (
                      <tr key={index}>
                        <td>{ligne.article?.name || "Article inconnu"}</td>
                        <td>{ligne.article?.code}</td>
                        <td>{ligne.quantiteCommandee}</td>
                        <td>{ligne.prixUnitaire?.toFixed(2)} TND</td>
                        <td className="amount">
                          {ligne.montantLigne?.toFixed(2)} TND
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="4">
                        <strong>Total:</strong>
                      </td>
                      <td className="amount">
                        <strong>
                          {bcpDetails.montantTotal?.toFixed(2)} TND
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p>Aucune ligne de commande trouvée.</p>
              )}
            </div>

            {/* Notes */}
            {bcpDetails.notes && (
              <div className="details-notes">
                <h5>Notes</h5>
                <p>{bcpDetails.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default BCPManagement;
