import React, { useState, useEffect, useMemo } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import { apiClient } from "../../services/api";
import "./DemandesManagement.css";

const DemandesManagement = () => {
  const [demandes, setDemandes] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [editingDemande, setEditingDemande] = useState(null);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [demandeToDelete, setDemandeToDelete] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
  });

  // Create stable initial values for forms
  const formInitialValues = useMemo(
    () => editingDemande || {},
    [editingDemande]
  );
  const assignFormInitialValues = useMemo(() => ({}), []);

  // Demande form fields configuration
  const demandeFormFields = [
    {
      name: "titre",
      label: "Titre de la demande",
      type: "text",
      required: true,
      placeholder: "Ex: Menu Vol Paris-Londres",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      placeholder: "Décrivez les détails de votre demande...",
    },
    {
      name: "type",
      label: "Type de demande",
      type: "select",
      required: true,
      options: [
        { value: 0, label: "Menu" },
        { value: 1, label: "Plat" },
        { value: 2, label: "Menu Complet" },
      ],
    },
    {
      name: "dateLimite",
      label: "Date limite",
      type: "datetime-local",
      required: true,
    },
    {
      name: "commentairesAdmin",
      label: "Commentaires Admin",
      type: "textarea",
      placeholder: "Commentaires additionnels...",
    },
  ];

  // Dynamic fields for demande plats
  const [demandePlats, setDemandePlats] = useState([
    {
      nomPlatSouhaite: "",
      descriptionSouhaitee: "",
      typePlat: 0, // TypeArticle enum: 0=Repas
      uniteSouhaitee: "portion",
      prixMaximal: 0,
      quantiteEstimee: 0,
      specificationsSpeciales: "",
      isObligatoire: true,
    },
  ]);

  const addDemandePlat = () => {
    setDemandePlats([
      ...demandePlats,
      {
        nomPlatSouhaite: "",
        descriptionSouhaitee: "",
        typePlat: 0, // TypeArticle enum: 0=Repas
        uniteSouhaitee: "portion",
        prixMaximal: 0,
        quantiteEstimee: 0,
        specificationsSpeciales: "",
        isObligatoire: true,
      },
    ]);
  };

  const removeDemandePlat = (index) => {
    if (demandePlats.length > 1) {
      setDemandePlats(demandePlats.filter((_, i) => i !== index));
    }
  };

  const updateDemandePlat = (index, field, value) => {
    console.log(`🍽️ Updating plat ${index}, field ${field}, value:`, value);
    const updated = [...demandePlats];
    updated[index] = { ...updated[index], [field]: value };
    setDemandePlats(updated);
    console.log("Updated demandePlats:", updated);
  };

  // Assignment form fields
  const assignFormFields = useMemo(
    () => [
      {
        name: "fournisseurId",
        label: "Fournisseur",
        type: "select",
        required: true,
        options:
          fournisseurs.length > 0
            ? fournisseurs.map((fournisseur) => ({
                value: fournisseur.id,
                label: `${fournisseur.companyName} - ${fournisseur.user?.firstName} ${fournisseur.user?.lastName}`,
              }))
            : [{ value: "", label: "Aucun fournisseur disponible" }],
      },
      {
        name: "commentairesAdmin",
        label: "Commentaires pour le fournisseur",
        type: "textarea",
        placeholder: "Instructions spéciales pour le fournisseur...",
      },
      {
        name: "dateLimite",
        label: "Date limite de réponse",
        type: "datetime-local",
        required: true,
      },
    ],
    [fournisseurs]
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
      key: "assignedTo",
      label: "Assigné à",
      render: (value, demande) => {
        if (demande.assigneAFournisseur) {
          return (
            <div className="assigned-supplier">
              <strong>{demande.assigneAFournisseur.companyName}</strong>
              <small>
                {demande.assigneAFournisseur.user?.firstName}{" "}
                {demande.assigneAFournisseur.user?.lastName}
              </small>
            </div>
          );
        }
        return <span className="text-muted">Non assigné</span>;
      },
    },
    {
      key: "dateLimite",
      label: "Date Limite",
      render: (value, demande) => {
        if (!demande.dateLimite) return "N/A";
        const date = new Date(demande.dateLimite);
        const isOverdue = date < new Date() && demande.status !== "Completee";
        return (
          <div className={`date-limite ${isOverdue ? "overdue" : ""}`}>
            {date.toLocaleDateString()}
            {isOverdue && <small className="overdue-text">En retard</small>}
          </div>
        );
      },
    },
    {
      key: "responses",
      label: "Réponses",
      render: (value, demande) => {
        const responseCount = demande.reponses?.length || 0;
        return (
          <div className="responses-count">
            <span
              className={`badge ${
                responseCount > 0 ? "badge-success" : "badge-secondary"
              }`}
            >
              {responseCount} réponse{responseCount !== 1 ? "s" : ""}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, demande) => {
        const canAssign =
          demande.status === "EnAttente" && !demande.assigneAFournisseurId;
        const hasResponses = demande.reponses && demande.reponses.length > 0;

        return (
          <div className="action-buttons">
            {canAssign && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleAssign(demande)}
                title="Assigner à un fournisseur"
              >
                👥 Assigner
              </button>
            )}
            {hasResponses && (
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => handleViewResponses(demande)}
                title="Voir les réponses"
              >
                📋 Réponses
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleEdit(demande)}
              title="Modifier"
            >
              ✏️
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDelete(demande)}
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    loadDemandes();
    loadFournisseurs();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDemandes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getDemandes(filters);
      setDemandes(Array.isArray(response.data) ? response.data : response);
    } catch (err) {
      setError("Erreur lors du chargement des demandes");
      console.error("Error loading demandes:", err);
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFournisseurs = async () => {
    try {
      const response = await apiClient.getFournisseurs();
      setFournisseurs(Array.isArray(response.data) ? response.data : response);
    } catch (err) {
      console.error("Error loading fournisseurs:", err);
    }
  };

  const handleAdd = () => {
    console.log("🆕 Adding new demande");
    setEditingDemande(null);
    // Reset demandePlats for new demande
    const initialPlats = [
      {
        nomPlatSouhaite: "",
        descriptionSouhaitee: "",
        typePlat: 0, // TypeArticle enum: 0=Repas
        uniteSouhaitee: "portion",
        prixMaximal: 0,
        quantiteEstimee: 0,
        specificationsSpeciales: "",
        isObligatoire: true,
      },
    ];
    setDemandePlats(initialPlats);
    console.log("Initial demandePlats set to:", initialPlats);
    setShowModal(true);
  };

  const handleEdit = (demande) => {
    setEditingDemande(demande);
    // Populate demandePlats if they exist
    if (demande.demandePlats && demande.demandePlats.length > 0) {
      setDemandePlats(demande.demandePlats);
    } else {
      setDemandePlats([
        {
          nomPlatSouhaite: "",
          descriptionSouhaitee: "",
          typePlat: 0, // TypeArticle enum: 0=Repas
          uniteSouhaitee: "portion",
          prixMaximal: 0,
          quantiteEstimee: 0,
          specificationsSpeciales: "",
          isObligatoire: true,
        },
      ]);
    }
    setShowModal(true);
  };

  const handleDelete = (demande) => {
    setDemandeToDelete(demande);
    setShowDeleteModal(true);
  };

  const handleAssign = (demande) => {
    setSelectedDemande(demande);
    setShowAssignModal(true);
  };

  const handleViewResponses = (demande) => {
    setSelectedDemande(demande);
    setShowResponseModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);

      console.log("🔍 Form submission debug:");
      console.log("formData:", formData);
      console.log("demandePlats state:", demandePlats);

      // Validate demandePlats
      const validDemandePlats = demandePlats.filter(
        (plat) => plat.nomPlatSouhaite.trim() !== ""
      );

      console.log("validDemandePlats:", validDemandePlats);

      if (validDemandePlats.length === 0) {
        console.log("❌ No valid plats found, showing error");
        setError("Au moins un plat doit être spécifié");
        return;
      }

      const processedData = {
        titre: formData.titre?.trim(),
        description: formData.description?.trim(),
        type: parseInt(formData.type), // Ensure type is integer
        dateLimite: formData.dateLimite
          ? new Date(formData.dateLimite).toISOString()
          : null,
        commentairesAdmin: formData.commentairesAdmin?.trim() || "",
        demandePlats: validDemandePlats.map((plat) => ({
          nomPlatSouhaite: plat.nomPlatSouhaite.trim(),
          descriptionSouhaitee: plat.descriptionSouhaitee?.trim() || "",
          typePlat: parseInt(plat.typePlat) || 0, // TypeArticle enum: 0=Repas, 1=Boisson, etc.
          uniteSouhaitee: plat.uniteSouhaitee || "portion",
          prixMaximal: parseFloat(plat.prixMaximal) || 0.0,
          quantiteEstimee: parseInt(plat.quantiteEstimee) || 0,
          specificationsSpeciales: plat.specificationsSpeciales?.trim() || "",
          isObligatoire: Boolean(plat.isObligatoire),
        })),
      };

      console.log("📋 Submitting demande with processed data:", processedData);

      if (editingDemande) {
        await apiClient.updateDemande(editingDemande.id, processedData);
      } else {
        await apiClient.createDemande(processedData);
      }

      setShowModal(false);
      setDemandePlats([
        {
          nomPlatSouhaite: "",
          descriptionSouhaitee: "",
          typePlat: 0, // TypeArticle enum: 0=Repas
          uniteSouhaitee: "portion",
          prixMaximal: 0,
          quantiteEstimee: 0,
          specificationsSpeciales: "",
          isObligatoire: true,
        },
      ]);
      loadDemandes();
    } catch (err) {
      console.error("❌ Error in handleSubmit:", err);
      setError(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleAssignSubmit = async (formData) => {
    try {
      setError(null);

      const assignData = {
        fournisseurId: parseInt(formData.fournisseurId),
        commentairesAdmin: formData.commentairesAdmin || "",
        dateLimite: formData.dateLimite
          ? new Date(formData.dateLimite).toISOString()
          : null,
      };

      await apiClient.assignDemandeToFournisseur(
        selectedDemande.id,
        assignData
      );
      setShowAssignModal(false);
      loadDemandes();
    } catch (err) {
      setError(err.message || "Erreur lors de l'assignation");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await apiClient.deleteDemande(demandeToDelete.id);
      setShowDeleteModal(false);
      loadDemandes();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    }
  };

  const handleAcceptResponse = async (response) => {
    try {
      setError(null);
      const commentaire = window.prompt(
        "Commentaire d'acceptation (optionnel):",
        ""
      );
      if (commentaire !== null) {
        // User didn't cancel
        await apiClient.acceptDemandeReponse(response.id, commentaire);
        setShowResponseModal(false);
        loadDemandes();
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'acceptation");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="demandes-management">
      <div className="page-header">
        <h1>🍽️ Gestion des Demandes de Menus</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Nouvelle Demande
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
              placeholder="Titre, numéro..."
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
              <option value="EnAttente">En Attente</option>
              <option value="EnCours">En Cours</option>
              <option value="Completee">Complétée</option>
              <option value="Annulee">Annulée</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="Menu">Menu</option>
              <option value="Plat">Plat</option>
              <option value="MenuComplet">Menu Complet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">Total Demandes</div>
            <div className="stat-value">{demandes.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-label">En Attente</div>
            <div className="stat-value">
              {demandes.filter((d) => d.status === "EnAttente").length}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-label">En Cours</div>
            <div className="stat-value">
              {demandes.filter((d) => d.status === "EnCours").length}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Complétées</div>
            <div className="stat-value">
              {demandes.filter((d) => d.status === "Completee").length}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={demandes}
        columns={columns}
        loading={loading}
        emptyMessage="Aucune demande trouvée"
      />

      {/* Demande Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingDemande ? "Modifier la Demande" : "Nouvelle Demande de Menu"
        }
        size="xl"
      >
        <Form
          fields={demandeFormFields}
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        >
          {/* Custom section for demandePlats */}
          <div className="demande-plats-section">
            <div className="section-header">
              <h4>🍽️ Plats Demandés</h4>
              <button
                type="button"
                onClick={addDemandePlat}
                className="btn btn-sm btn-success"
              >
                + Ajouter un plat
              </button>
            </div>

            {demandePlats.map((plat, index) => {
              console.log(`🍽️ Rendering plat ${index}:`, plat);
              return (
                <div key={index} className="demande-plat-card">
                  <div className="card-header">
                    <h5>Plat {index + 1}</h5>
                    {demandePlats.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDemandePlat(index)}
                        className="btn btn-sm btn-danger"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="plat-form-grid">
                    <div className="form-group">
                      <label>Nom du plat souhaité *</label>
                      <input
                        type="text"
                        value={plat.nomPlatSouhaite}
                        onChange={(e) =>
                          updateDemandePlat(
                            index,
                            "nomPlatSouhaite",
                            e.target.value
                          )
                        }
                        placeholder="Ex: Plateau repas Business"
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Description souhaitée</label>
                      <textarea
                        value={plat.descriptionSouhaitee}
                        onChange={(e) =>
                          updateDemandePlat(
                            index,
                            "descriptionSouhaitee",
                            e.target.value
                          )
                        }
                        placeholder="Description détaillée du plat..."
                        rows="2"
                      />
                    </div>

                    <div className="form-group">
                      <label>Type de plat</label>
                      <select
                        value={plat.typePlat}
                        onChange={(e) =>
                          updateDemandePlat(
                            index,
                            "typePlat",
                            parseInt(e.target.value)
                          )
                        }
                      >
                        <option value={0}>Repas</option>
                        <option value={1}>Boisson</option>
                        <option value={2}>Consommable</option>
                        <option value={3}>Matériel Cuisine</option>
                        <option value={4}>Matériel Divers</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Unité souhaitée</label>
                      <input
                        type="text"
                        value={plat.uniteSouhaitee}
                        onChange={(e) =>
                          updateDemandePlat(
                            index,
                            "uniteSouhaitee",
                            e.target.value
                          )
                        }
                        placeholder="portion, kg, litre..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Prix maximal (€)</label>
                      <input
                        type="number"
                        value={plat.prixMaximal}
                        onChange={(e) =>
                          updateDemandePlat(
                            index,
                            "prixMaximal",
                            e.target.value
                          )
                        }
                        min="0"
                        step="0.01"
                        placeholder="25.00"
                      />
                    </div>

                    <div className="form-group">
                      <label>Quantité estimée</label>
                      <input
                        type="number"
                        value={plat.quantiteEstimee}
                        onChange={(e) =>
                          updateDemandePlat(
                            index,
                            "quantiteEstimee",
                            e.target.value
                          )
                        }
                        min="0"
                        placeholder="50"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Spécifications spéciales</label>
                      <textarea
                        value={plat.specificationsSpeciales}
                        onChange={(e) =>
                          updateDemandePlat(
                            index,
                            "specificationsSpeciales",
                            e.target.value
                          )
                        }
                        placeholder="Sans gluten, bio, halal..."
                        rows="2"
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={plat.isObligatoire}
                          onChange={(e) =>
                            updateDemandePlat(
                              index,
                              "isObligatoire",
                              e.target.checked
                            )
                          }
                        />
                        Plat obligatoire
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Form>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assigner: ${selectedDemande?.titre}`}
      >
        <Form
          fields={assignFormFields}
          initialValues={assignFormInitialValues}
          onSubmit={handleAssignSubmit}
          onCancel={() => setShowAssignModal(false)}
        />
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title={`Réponses pour: ${selectedDemande?.titre}`}
        size="xl"
      >
        <div className="responses-list">
          {selectedDemande?.reponses?.map((response) => (
            <div key={response.id} className="response-card">
              <div className="response-header">
                <h4>{response.nomMenuPropose}</h4>
                <div className="response-price">{response.prixTotal}€</div>
              </div>
              <p className="response-description">
                {response.descriptionMenuPropose}
              </p>
              {response.commentairesFournisseur && (
                <div className="response-comments">
                  <strong>Commentaires:</strong>{" "}
                  {response.commentairesFournisseur}
                </div>
              )}
              <div className="response-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleAcceptResponse(response)}
                  disabled={response.isAcceptedByAdmin}
                >
                  {response.isAcceptedByAdmin ? "✅ Acceptée" : "✅ Accepter"}
                </button>
              </div>
            </div>
          ))}
          {(!selectedDemande?.reponses ||
            selectedDemande.reponses.length === 0) && (
            <div className="no-responses">
              <p>Aucune réponse pour cette demande.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la Demande"
        message={`Êtes-vous sûr de vouloir supprimer la demande "${demandeToDelete?.titre}" ?`}
        confirmText="Supprimer"
        confirmClass="btn-danger"
      />
    </div>
  );
};

export default DemandesManagement;
