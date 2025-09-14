import React, { useState, useEffect, useMemo } from "react";
import { DataTable, Modal, Form, StatusBadge } from "../Shared";
import { apiClient } from "../../services/api";
import "./FournisseurDashboard.css";

const FournisseurDashboard = () => {
  const [demandes, setDemandes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [filters, setFilters] = useState({
    status: "EnCours",
  });

  // Create stable initial values for response form
  const responseFormInitialValues = useMemo(() => ({}), []);

  // Response form fields configuration
  const responseFormFields = useMemo(
    () => [
      {
        name: "menuProposedId",
        label: "Menu proposé",
        type: "select",
        required: true,
        options:
          menus.length > 0
            ? menus.map((menu) => ({
                value: menu.id,
                label: `${menu.name} - ${menu.price}€`,
              }))
            : [{ value: "", label: "Aucun menu disponible" }],
      },
      {
        name: "nomMenuPropose",
        label: "Nom du menu proposé",
        type: "text",
        required: true,
        placeholder: "Menu Délice Parisien",
      },
      {
        name: "descriptionMenuPropose",
        label: "Description du menu",
        type: "textarea",
        required: true,
        placeholder: "Sandwich gourmet + boisson + dessert...",
      },
      {
        name: "prixTotal",
        label: "Prix total (€)",
        type: "number",
        required: true,
        step: "0.01",
        placeholder: "12.50",
      },
      {
        name: "commentairesFournisseur",
        label: "Commentaires",
        type: "textarea",
        placeholder: "Menu fraîchement préparé, ingrédients locaux...",
      },
    ],
    [menus]
  );

  // Table columns configuration
  const columns = [
    {
      key: "numero",
      label: "Numéro",
      sortable: true,
    },
    {
      key: "titre",
      label: "Titre",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
    },
    {
      key: "status",
      label: "Statut",
      render: (value, demande) => {
        const statusMap = {
          EnAttente: { status: "warning", text: "En Attente" },
          EnCours: { status: "info", text: "En Cours" },
          Completee: { status: "success", text: "Complétée" },
          Annulee: { status: "danger", text: "Annulée" },
        };
        const statusInfo = statusMap[demande.status] || {
          status: "secondary",
          text: demande.status,
        };
        return (
          <StatusBadge status={statusInfo.status} text={statusInfo.text} />
        );
      },
    },
    {
      key: "dateLimite",
      label: "Date Limite",
      render: (value, demande) => {
        if (!demande.dateLimite) return "N/A";
        const date = new Date(demande.dateLimite);
        const isUrgent = date < new Date(Date.now() + 24 * 60 * 60 * 1000); // Less than 24h
        return (
          <div className={`date-limite ${isUrgent ? "urgent" : ""}`}>
            {date.toLocaleDateString()}
            <div className="time">{date.toLocaleTimeString()}</div>
            {isUrgent && <small className="urgent-text">Urgent!</small>}
          </div>
        );
      },
    },
    {
      key: "demandePlats",
      label: "Plats Demandés",
      render: (value, demande) => {
        if (!demande.demandePlats || demande.demandePlats.length === 0) {
          return <span className="text-muted">Aucun détail</span>;
        }
        return (
          <div className="plats-demandes">
            {demande.demandePlats.slice(0, 2).map((plat, index) => (
              <div key={index} className="plat-item">
                <strong>{plat.nomPlatSouhaite}</strong>
                <small>
                  Max: {plat.prixMaximal}€ • Qty: {plat.quantiteEstimee}
                </small>
              </div>
            ))}
            {demande.demandePlats.length > 2 && (
              <small className="more-plats">
                +{demande.demandePlats.length - 2} autres
              </small>
            )}
          </div>
        );
      },
    },
    {
      key: "myResponse",
      label: "Ma Réponse",
      render: (value, demande) => {
        const myResponse = demande.reponses?.find((r) => r.isMine);
        if (myResponse) {
          return (
            <div className="my-response">
              <div className="response-status">
                {myResponse.isAcceptedByAdmin ? (
                  <StatusBadge status="success" text="✅ Acceptée" />
                ) : (
                  <StatusBadge status="info" text="📋 Soumise" />
                )}
              </div>
              <div className="response-price">{myResponse.prixTotal}€</div>
            </div>
          );
        }
        return <span className="text-muted">Pas de réponse</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, demande) => {
        const hasResponse = demande.reponses?.some((r) => r.isMine);
        const canRespond = demande.status === "EnCours" && !hasResponse;

        return (
          <div className="action-buttons">
            {canRespond && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleRespond(demande)}
                title="Répondre à la demande"
              >
                💬 Répondre
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-info"
              onClick={() => handleViewDetails(demande)}
              title="Voir les détails"
            >
              👁️ Détails
            </button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    loadDemandes();
    loadMenus();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDemandes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMesDemandesAssignees(filters);
      setDemandes(Array.isArray(response.data) ? response.data : response);
    } catch (err) {
      setError("Erreur lors du chargement des demandes");
      console.error("Error loading demandes:", err);
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      const response = await apiClient.getMenus();
      setMenus(Array.isArray(response.data) ? response.data : response);
    } catch (err) {
      console.error("Error loading menus:", err);
    }
  };

  const handleRespond = (demande) => {
    setSelectedDemande(demande);
    setShowResponseModal(true);
  };

  const handleViewDetails = (demande) => {
    // Could open a details modal or navigate to details page
    console.log("View details for demande:", demande);
  };

  const handleResponseSubmit = async (formData) => {
    try {
      setError(null);

      const responseData = {
        menuProposedId: parseInt(formData.menuProposedId),
        nomMenuPropose: formData.nomMenuPropose,
        descriptionMenuPropose: formData.descriptionMenuPropose,
        prixTotal: parseFloat(formData.prixTotal),
        commentairesFournisseur: formData.commentairesFournisseur || "",
      };

      await apiClient.repondreADemande(selectedDemande.id, responseData);
      setShowResponseModal(false);
      loadDemandes();
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi de la réponse");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Calculate statistics
  const stats = {
    total: demandes.length,
    enCours: demandes.filter((d) => d.status === "EnCours").length,
    responded: demandes.filter((d) => d.reponses?.some((r) => r.isMine)).length,
    accepted: demandes.filter((d) =>
      d.reponses?.some((r) => r.isMine && r.isAcceptedByAdmin)
    ).length,
  };

  return (
    <div className="fournisseur-dashboard">
      <div className="page-header">
        <h1>🏪 Mes Demandes de Menus</h1>
        <div className="header-actions">
          <button className="btn btn-outline-primary" onClick={loadDemandes}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Statut</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="EnCours">En Cours</option>
              <option value="Completee">Complétées</option>
              <option value="Annulee">Annulées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">Demandes Assignées</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-label">En Cours</div>
            <div className="stat-value">{stats.enCours}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-label">Réponses Envoyées</div>
            <div className="stat-value">{stats.responded}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Acceptées</div>
            <div className="stat-value">{stats.accepted}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-card">
          <h3>🚀 Actions Rapides</h3>
          <div className="action-buttons">
            <button
              className="btn btn-outline-primary"
              onClick={() => handleFilterChange("status", "EnCours")}
            >
              📋 Demandes en cours
            </button>
            <button
              className="btn btn-outline-success"
              onClick={() => handleFilterChange("status", "Completee")}
            >
              ✅ Mes succès
            </button>
          </div>
        </div>

        <div className="action-card">
          <h3>📊 Mes Performances</h3>
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">Taux d'acceptation:</span>
              <span className="metric-value">
                {stats.responded > 0
                  ? Math.round((stats.accepted / stats.responded) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Taux de réponse:</span>
              <span className="metric-value">
                {stats.total > 0
                  ? Math.round((stats.responded / stats.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={demandes}
        columns={columns}
        loading={loading}
        emptyMessage="Aucune demande assignée"
      />

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title={`Répondre à: ${selectedDemande?.titre}`}
        size="lg"
      >
        <div className="response-modal-content">
          <div className="demande-details">
            <h4>📋 Détails de la demande</h4>
            <p>
              <strong>Description:</strong> {selectedDemande?.description}
            </p>
            <p>
              <strong>Type:</strong> {selectedDemande?.type}
            </p>
            <p>
              <strong>Date limite:</strong>{" "}
              {selectedDemande?.dateLimite
                ? new Date(selectedDemande.dateLimite).toLocaleString()
                : "N/A"}
            </p>

            {selectedDemande?.demandePlats &&
              selectedDemande.demandePlats.length > 0 && (
                <div className="plats-details">
                  <h5>🍽️ Plats demandés:</h5>
                  {selectedDemande.demandePlats.map((plat, index) => (
                    <div key={index} className="plat-detail-item">
                      <strong>{plat.nomPlatSouhaite}</strong> ({plat.typePlat})
                      <div className="plat-specs">
                        Prix max: {plat.prixMaximal}€ • Quantité:{" "}
                        {plat.quantiteEstimee}
                        {plat.isObligatoire && (
                          <span className="obligatoire">• Obligatoire</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {selectedDemande?.commentairesAdmin && (
              <div className="admin-comments">
                <h5>💬 Commentaires Admin:</h5>
                <p>{selectedDemande.commentairesAdmin}</p>
              </div>
            )}
          </div>

          <div className="response-form">
            <h4>💬 Votre Proposition</h4>
            <Form
              fields={responseFormFields}
              initialValues={responseFormInitialValues}
              onSubmit={handleResponseSubmit}
              onCancel={() => setShowResponseModal(false)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FournisseurDashboard;

