import React, { useState, useEffect } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./BLManagement.css";

const BLManagement = () => {
  const [bls, setBLs] = useState([]);
  const [vols, setVols] = useState([]);
  const [bcps, setBCPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBL, setEditingBL] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blToDelete, setBLToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [selectedBL, setSelectedBL] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    fournisseur: "",
    dateDebut: "",
    dateFin: "",
  });

  // Status options
  const statusOptions = [
    { value: "EnAttente", label: "En Attente" },
    { value: "Recu", label: "Reçu" },
    { value: "Valide", label: "Validé" },
    { value: "Rejete", label: "Rejeté" },
  ];

  // BL form fields configuration
  const blFormFields = [
    {
      name: "numero",
      label: "Numéro BL",
      type: "text",
      required: true,
      placeholder: "Ex: BL-TU123-20240115-001",
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
      name: "bonCommandePrevisionnelId",
      label: "BCP Associé",
      type: "select",
      options: bcps.map((bcp) => ({
        value: bcp.id,
        label: `${bcp.numero} - ${bcp.fournisseur}`,
      })),
    },
    {
      name: "dateLivraison",
      label: "Date de Livraison",
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
      placeholder: "Notes de livraison...",
    },
  ];

  // Table columns configuration
  const columns = [
    {
      key: "numero",
      label: "Numéro BL",
      sortable: true,
    },
    {
      key: "volInfo",
      label: "Vol",
      render: (bl) => (
        <div>
          <strong>{bl.vol?.flightNumber}</strong>
          <br />
          <small>{new Date(bl.vol?.flightDate).toLocaleDateString()}</small>
        </div>
      ),
    },
    {
      key: "dateLivraison",
      label: "Date Livraison",
      render: (bl) => new Date(bl.dateLivraison).toLocaleDateString(),
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
      render: (bl) => `${bl.montantTotal?.toFixed(2) || "0.00"} TND`,
      sortable: true,
    },
    {
      key: "status",
      label: "Statut",
      render: (bl) => (
        <StatusBadge
          status={bl.status?.toLowerCase().replace(" ", "")}
          text={bl.status}
        />
      ),
    },
    {
      key: "bcpInfo",
      label: "BCP Associé",
      render: (bl) => bl.bonCommandePrevisionnel?.numero || "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      render: (bl) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => handleViewDetails(bl)}
            title="Voir Détails"
          >
            👁️
          </button>
          {bl.status === "Recu" && (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => handleValidate(bl)}
              title="Valider BL"
            >
              ✅
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleChangeStatus(bl)}
            title="Changer Statut"
          >
            🔄
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleEdit(bl)}
            title="Modifier"
          >
            ✏️
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(bl)}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadBLs();
    loadVols();
    loadBCPs();
  }, [filters]);

  const loadBLs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getBL(filters);
      setBLs(response.data || response);
    } catch (err) {
      setError("Erreur lors du chargement des BL");
      console.error("Error loading BLs:", err);
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

  const loadBCPs = async () => {
    try {
      const response = await apiClient.getBCP();
      setBCPs(response.data || response);
    } catch (err) {
      console.error("Error loading BCPs:", err);
    }
  };

  const handleAdd = () => {
    setEditingBL(null);
    setShowModal(true);
  };

  const handleEdit = (bl) => {
    setEditingBL(bl);
    setShowModal(true);
  };

  const handleDelete = (bl) => {
    setBLToDelete(bl);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (bl) => {
    setSelectedBL(bl);
    setShowDetailsModal(true);
  };

  const handleValidate = (bl) => {
    setSelectedBL(bl);
    setShowValidateModal(true);
  };

  const handleChangeStatus = async (bl) => {
    const newStatus = prompt("Nouveau statut:", bl.status);
    if (newStatus && newStatus !== bl.status) {
      try {
        await apiClient.updateBLStatus(bl.id, { status: newStatus });
        loadBLs();
      } catch (err) {
        setError(err.message || "Erreur lors du changement de statut");
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (editingBL) {
        await apiClient.updateBL(editingBL.id, formData);
      } else {
        await apiClient.createBL(formData);
      }
      setShowModal(false);
      loadBLs();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleValidateBL = async () => {
    try {
      setError(null);
      await apiClient.validateBL(selectedBL.id);
      setShowValidateModal(false);
      loadBLs();
    } catch (err) {
      setError(err.message || "Erreur lors de la validation");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await apiClient.deleteBL(blToDelete.id);
      setShowDeleteModal(false);
      setBLToDelete(null);
      loadBLs();
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

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="bl-management">
      <div className="page-header">
        <h1>📋 Gestion des BL (Bons de Livraison)</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Nouveau BL
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Numéro BL..."
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
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{bls.length}</div>
            <div className="stat-label">Total BL</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📥</div>
          <div className="stat-info">
            <div className="stat-value">
              {bls.filter((bl) => bl.status === "Recu").length}
            </div>
            <div className="stat-label">Reçus</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">
              {bls.filter((bl) => bl.status === "Valide").length}
            </div>
            <div className="stat-label">Validés</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">
              {bls
                .reduce((sum, bl) => sum + (bl.montantTotal || 0), 0)
                .toFixed(0)}{" "}
              TND
            </div>
            <div className="stat-label">Montant Total</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={bls}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun BL trouvé"
      />

      {/* BL Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBL ? "Modifier le BL" : "Nouveau BL"}
        size="lg"
      >
        <Form
          fields={blFormFields}
          initialValues={editingBL || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Validate BL Modal */}
      <ConfirmationModal
        isOpen={showValidateModal}
        onClose={() => setShowValidateModal(false)}
        onConfirm={handleValidateBL}
        title="Valider le BL"
        message={
          <div>
            <p>
              Êtes-vous sûr de vouloir valider le BL "{selectedBL?.numero}" ?
            </p>
            <div className="validation-warning">
              <strong>⚠️ Attention:</strong> Cette action va :
              <ul>
                <li>Comparer automatiquement avec le BCP associé</li>
                <li>Générer les écarts s'il y en a</li>
                <li>Changer le statut à "Validé"</li>
              </ul>
            </div>
          </div>
        }
        confirmText="Valider"
        confirmClass="btn-success"
      />

      {/* BL Details Modal */}
      {selectedBL && (
        <BLDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          bl={selectedBL}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le BL"
        message={`Êtes-vous sûr de vouloir supprimer le BL "${blToDelete?.numero}" ?`}
        confirmText="Supprimer"
        confirmClass="btn-danger"
      />
    </div>
  );
};

// BL Details Modal Component
const BLDetailsModal = ({ isOpen, onClose, bl }) => {
  const [blDetails, setBLDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bl) {
      loadBLDetails();
    }
  }, [isOpen, bl]);

  const loadBLDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBLById(bl.id);
      setBLDetails(response);
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
      title={`Détails BL: ${bl?.numero}`}
      size="xl"
    >
      <div className="bl-details">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Chargement...</div>
        ) : blDetails ? (
          <div className="details-content">
            {/* BL Header Info */}
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
                        <td>{blDetails.numero}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Vol:</strong>
                        </td>
                        <td>
                          {blDetails.vol?.flightNumber} -{" "}
                          {blDetails.vol?.flightDate}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Date Livraison:</strong>
                        </td>
                        <td>
                          {new Date(blDetails.dateLivraison).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Fournisseur:</strong>
                        </td>
                        <td>{blDetails.fournisseur}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Statut:</strong>
                        </td>
                        <td>
                          <StatusBadge
                            status={blDetails.status
                              ?.toLowerCase()
                              .replace(" ", "")}
                            text={blDetails.status}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>BCP Associé:</strong>
                        </td>
                        <td>
                          {blDetails.bonCommandePrevisionnel?.numero || "N/A"}
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
                          {blDetails.montantTotal?.toFixed(2)} TND
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Nombre d'articles:</strong>
                        </td>
                        <td>{blDetails.lignes?.length || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BL Lines */}
            <div className="details-lines">
              <h5>Lignes de Livraison</h5>
              {blDetails.lignes && blDetails.lignes.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Code</th>
                      <th>Quantité Livrée</th>
                      <th>Prix Unitaire</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blDetails.lignes.map((ligne, index) => (
                      <tr key={index}>
                        <td>{ligne.article?.name || "Article inconnu"}</td>
                        <td>{ligne.article?.code}</td>
                        <td>{ligne.quantiteLivree}</td>
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
                          {blDetails.montantTotal?.toFixed(2)} TND
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p>Aucune ligne de livraison trouvée.</p>
              )}
            </div>

            {/* BCP Comparison */}
            {blDetails.bonCommandePrevisionnel && (
              <div className="bcp-comparison">
                <h5>Comparaison avec BCP</h5>
                <div className="comparison-info">
                  <p>
                    <strong>BCP:</strong>{" "}
                    {blDetails.bonCommandePrevisionnel.numero}
                  </p>
                  <p>
                    <strong>Montant BCP:</strong>{" "}
                    {blDetails.bonCommandePrevisionnel.montantTotal?.toFixed(2)}{" "}
                    TND
                  </p>
                  <p>
                    <strong>Montant BL:</strong>{" "}
                    {blDetails.montantTotal?.toFixed(2)} TND
                  </p>
                  <p>
                    <strong>Écart:</strong>
                    <span
                      className={`ecart ${
                        blDetails.montantTotal -
                          blDetails.bonCommandePrevisionnel.montantTotal >=
                        0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {(
                        blDetails.montantTotal -
                        blDetails.bonCommandePrevisionnel.montantTotal
                      ).toFixed(2)}{" "}
                      TND
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {blDetails.notes && (
              <div className="details-notes">
                <h5>Notes</h5>
                <p>{blDetails.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default BLManagement;
