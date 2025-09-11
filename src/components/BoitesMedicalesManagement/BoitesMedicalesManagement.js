import React, { useState, useEffect, useMemo } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./BoitesMedicalesManagement.css";

// Helper function to get type label
const getTypeLabel = (type) => {
  const typeMap = {
    0: "Boîte Docteur",
    1: "Boîte Pharmacie",
    2: "Kit Premier Secours",
    3: "Boîte Urgence",
  };
  return typeMap[type] || "Type inconnu";
};

const BoitesMedicalesManagement = () => {
  const [boites, setBoites] = useState([]);
  const [vols, setVols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBoite, setEditingBoite] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boiteToDelete, setBoiteToDelete] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBoite, setSelectedBoite] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    expiring: false,
  });

  // Create stable initial values for form to prevent infinite re-renders
  const formInitialValues = useMemo(() => editingBoite || {}, [editingBoite]);
  const assignFormInitialValues = useMemo(() => ({}), []);

  // Boîte form fields configuration - Updated to match API DTO
  const boiteFormFields = [
    {
      name: "numero",
      label: "Numéro Boîte",
      type: "text",
      required: true,
      placeholder: "Ex: MED001",
      maxLength: 50,
    },
    {
      name: "name",
      label: "Nom de la Boîte",
      type: "text",
      required: true,
      placeholder: "Ex: Trousse de premiers secours",
      maxLength: 100,
    },
    {
      name: "type",
      label: "Type de Boîte",
      type: "select",
      required: true,
      options: [
        { value: 0, label: "Boîte Docteur" },
        { value: 1, label: "Boîte Pharmacie" },
        { value: 2, label: "Kit Premier Secours" },
        { value: 3, label: "Boîte Urgence" },
      ],
    },
    {
      name: "dateExpiration",
      label: "Date d'Expiration",
      type: "date",
      required: true,
    },
    {
      name: "derniereMaintenance",
      label: "Dernière Maintenance",
      type: "date",
      required: true,
    },
    {
      name: "prochaineMaintenance",
      label: "Prochaine Maintenance",
      type: "date",
      required: false,
    },
    {
      name: "responsableMaintenance",
      label: "Responsable Maintenance",
      type: "text",
      required: false,
      placeholder: "Ex: Nom du responsable",
      maxLength: 100,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 3,
      placeholder: "Description du contenu...",
      maxLength: 500,
    },
    {
      name: "isActive",
      label: "Statut",
      type: "select",
      required: false,
      options: [
        { value: true, label: "Actif" },
        { value: false, label: "Inactif" },
      ],
    },
  ];

  // Assign form fields - using useMemo to prevent recreation on every render
  const assignFormFields = useMemo(
    () => [
      {
        name: "boiteId",
        type: "hidden",
        value: selectedBoite?.id || "",
      },
      {
        name: "volId",
        label: "Vol",
        type: "select",
        required: true,
        options:
          vols.length > 0
            ? vols.map((vol) => ({
                value: vol.id,
                label: `${vol.flightNumber} - ${vol.flightDate} (${vol.origin} → ${vol.destination})`,
              }))
            : [{ value: "", label: "Aucun vol disponible" }],
      },
    ],
    [vols, selectedBoite]
  );

  // Table columns configuration
  const columns = [
    {
      key: "numero",
      label: "Numéro",
      sortable: true,
    },
    {
      key: "name",
      label: "Nom",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      render: (value, boite) => getTypeLabel(boite?.type),
      sortable: true,
    },
    {
      key: "dateExpiration",
      label: "Expiration",
      render: (value, boite) => {
        if (!boite?.dateExpiration) return "N/A";

        const expDate = new Date(boite.dateExpiration);
        const today = new Date();
        const daysUntilExpiry = Math.ceil(
          (expDate - today) / (1000 * 60 * 60 * 24)
        );
        const isExpiring = daysUntilExpiry <= 30;

        return (
          <div className={`expiration ${isExpiring ? "warning" : ""}`}>
            {expDate.toLocaleDateString()}
            {isExpiring && (
              <small className="expiring-text">({daysUntilExpiry} jours)</small>
            )}
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "isActive",
      label: "Statut",
      render: (value, boite) => (
        <StatusBadge
          status={boite?.isActive ? "active" : "inactive"}
          text={boite?.isActive ? "Actif" : "Inactif"}
        />
      ),
    },
    {
      key: "assignmentStatus",
      label: "État Assignment",
      render: (value, boite) => {
        // Check multiple possible assignment indicators
        const isAssigned =
          boite?.assignedVol?.flightNumber ||
          boite?.volId ||
          boite?.vol?.flightNumber ||
          boite?.status === 1; // Assuming status 1 means assigned

        console.log(`Assignment status for ${boite?.name}:`, {
          assignedVol: boite?.assignedVol,
          volId: boite?.volId,
          vol: boite?.vol,
          status: boite?.status,
          isAssigned,
        });

        return (
          <StatusBadge
            status={isAssigned ? "success" : "warning"}
            text={isAssigned ? "Assigné" : "Disponible"}
          />
        );
      },
    },
    {
      key: "assignedVol",
      label: "Vol Assigné",
      render: (value, boite) => {
        // Check multiple possible data structures for flight info
        let flightInfo = null;

        if (boite?.assignedVol?.flightNumber) {
          flightInfo = {
            number: boite.assignedVol.flightNumber,
            date: boite.assignedVol.flightDate,
          };
        } else if (boite?.vol?.flightNumber) {
          flightInfo = {
            number: boite.vol.flightNumber,
            date: boite.vol.flightDate,
          };
        } else if (boite?.volId) {
          // If we only have volId, we might need to find the vol in the vols array
          const vol = vols.find((v) => v.id === boite.volId);
          if (vol) {
            flightInfo = {
              number: vol.flightNumber,
              date: vol.flightDate,
            };
          }
        }

        if (flightInfo) {
          return (
            <div className="assignment-status assigned">
              <span className="flight-number">✈️ {flightInfo.number}</span>
              <small className="assignment-date">
                {flightInfo.date
                  ? new Date(flightInfo.date).toLocaleDateString()
                  : ""}
              </small>
            </div>
          );
        }

        return (
          <div className="assignment-status unassigned">
            <span className="no-assignment">❌ Non assigné</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, boite) => {
        console.log("Rendering actions for boite:", boite);
        // Use the same logic as the status column
        const isAssigned =
          boite?.assignedVol?.flightNumber ||
          boite?.volId ||
          boite?.vol?.flightNumber ||
          boite?.status === 1;

        return (
          <div className="action-buttons">
            {!isAssigned ? (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  console.log("Assign button clicked with boite:", boite);
                  handleAssign(boite);
                }}
                title="Assigner à un vol"
              >
                ✈️ Assigner
              </button>
            ) : (
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => handleUnassign(boite)}
                title="Désassigner du vol"
              >
                ❌ Désassigner
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleEdit(boite)}
              title="Modifier"
            >
              ✏️
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDelete(boite)}
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
    loadBoites();
    loadVols();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBoites = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading boites with filters:", filters);
      const response = filters.expiring
        ? await apiClient.getExpiringBoites()
        : await apiClient.getBoitesMedicales(filters);
      console.log("Boites response:", response);
      const boitesData = response.data || response;
      console.log("Boites data:", boitesData);
      console.log("First boite:", boitesData[0]);

      // Log assignment information for debugging
      boitesData.forEach((boite, index) => {
        if (boite.assignedVol) {
          console.log(
            `Boite ${index + 1} (${boite.name}) is assigned to:`,
            boite.assignedVol
          );
        } else {
          console.log(`Boite ${index + 1} (${boite.name}) is NOT assigned`);
        }
      });

      setBoites(Array.isArray(boitesData) ? boitesData : []);
    } catch (err) {
      setError("Erreur lors du chargement des boîtes médicales");
      console.error("Error loading boites:", err);
      setBoites([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadVols = async () => {
    try {
      const response = await apiClient.getVols();
      const volsData = response.data || response;
      console.log("Loaded vols for assignment:", volsData);
      setVols(volsData);
    } catch (err) {
      console.error("Error loading vols:", err);
    }
  };

  const handleAdd = () => {
    setEditingBoite(null);
    setShowModal(true);
  };

  const handleEdit = (boite) => {
    setEditingBoite(boite);
    setShowModal(true);
  };

  const handleDelete = (boite) => {
    setBoiteToDelete(boite);
    setShowDeleteModal(true);
  };

  const handleAssign = (boite) => {
    console.log("handleAssign called with:", boite);
    setSelectedBoite(boite);
    setShowAssignModal(true);
    console.log("selectedBoite state should be set to:", boite);
  };

  const handleUnassign = async (boite) => {
    try {
      console.log("Unassigning boite:", boite);
      // You'll need to implement the unassign API call
      // For now, let's use a placeholder
      if (
        window.confirm(
          `Désassigner la boîte "${boite.name}" du vol ${boite.assignedVol?.flightNumber}?`
        )
      ) {
        // TODO: Implement API call to unassign
        console.log("Unassignment confirmed for boite:", boite.id);
        // await apiClient.unassignBoiteFromVol(boite.id);
        loadBoites(); // Reload the list
      }
    } catch (err) {
      console.error("Error unassigning boite:", err);
      setError("Erreur lors de la désassignation");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);

      // Debug: Log the form data being sent
      console.log("Sending boite data:", formData);

      // Determine if this is a creation or update
      const isCreating = !editingBoite || !editingBoite.id;

      // Generate unique numero for new boites
      let numero = formData.numero;
      if (isCreating) {
        const existingNumbers = boites.map((b) => b.numero).filter(Boolean);

        // If numero is empty or already exists, generate a new unique one
        if (
          !numero ||
          numero.trim() === "" ||
          existingNumbers.includes(numero)
        ) {
          let counter = 1;
          do {
            numero = `MED${counter.toString().padStart(3, "0")}`;
            counter++;
          } while (existingNumbers.includes(numero));

          // Log the auto-generated numero for user feedback
          if (formData.numero && existingNumbers.includes(formData.numero)) {
            console.log(
              `Numéro '${formData.numero}' existe déjà. Nouveau numéro généré: ${numero}`
            );
          }
        }
      }

      // Process and validate the form data to match API DTO
      const processedData = {
        numero: numero,
        name: formData.name,
        type: parseInt(formData.type), // Convert to number for enum
        description: formData.description || null,
        dateExpiration: formData.dateExpiration
          ? formData.dateExpiration.includes("T")
            ? formData.dateExpiration
            : formData.dateExpiration + "T00:00:00.000Z"
          : null,
        derniereMaintenance: formData.derniereMaintenance
          ? formData.derniereMaintenance.includes("T")
            ? formData.derniereMaintenance
            : formData.derniereMaintenance + "T00:00:00.000Z"
          : null,
        prochaineMaintenance: formData.prochaineMaintenance
          ? formData.prochaineMaintenance.includes("T")
            ? formData.prochaineMaintenance
            : formData.prochaineMaintenance + "T00:00:00.000Z"
          : null,
        responsableMaintenance: formData.responsableMaintenance || null,
        isActive:
          formData.isActive === "true" ||
          formData.isActive === true ||
          formData.isActive === undefined
            ? true
            : false,
        items: [], // Initialize empty items array
      };

      // Remove any undefined or null values for optional fields
      Object.keys(processedData).forEach((key) => {
        if (processedData[key] === undefined || processedData[key] === null) {
          if (
            key === "description" ||
            key === "prochaineMaintenance" ||
            key === "responsableMaintenance"
          ) {
            // Keep these as null for optional fields
            return;
          }
          delete processedData[key];
        }
      });

      console.log("Processed boite data:", processedData);

      if (isCreating) {
        await apiClient.createBoiteMedicale(processedData);

        // Show success message with auto-generated numero if applicable
        if (formData.numero && formData.numero !== numero) {
          console.log(
            `✅ Boîte créée avec succès! Numéro auto-généré: ${numero} (au lieu de ${formData.numero})`
          );
        }
      } else {
        await apiClient.updateBoiteMedicale(editingBoite.id, processedData);
      }
      setShowModal(false);
      loadBoites();
    } catch (err) {
      console.error("Error creating/updating boite:", err);
      console.error("Detailed validation errors:", err.errors);

      // Show detailed error message
      let errorMessage = err.message || "Erreur lors de l'enregistrement";

      // Handle specific duplicate number error
      if (
        err.status === 400 &&
        typeof err.message === "string" &&
        err.message.includes("existe déjà")
      ) {
        errorMessage =
          "Ce numéro de boîte existe déjà. Veuillez choisir un autre numéro.";
      } else if (err.errors) {
        const validationErrors = Object.entries(err.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join("\n");
        errorMessage += "\n\nDétails:\n" + validationErrors;
      }

      setError(errorMessage);
    }
  };

  const handleAssignSubmit = async (formData) => {
    try {
      setError(null);

      // Debug logging - check current state
      console.log("handleAssignSubmit called - Current state:");
      console.log("selectedBoite:", selectedBoite);
      console.log("showAssignModal:", showAssignModal);
      console.log("formData:", formData);

      console.log("Assigning boite to vol:", {
        boiteId: formData.boiteId || selectedBoite?.id,
        volId: formData.volId,
        selectedBoite: selectedBoite,
        formData: formData,
      });

      const boiteId = formData.boiteId || selectedBoite?.id;

      if (!boiteId) {
        throw new Error("Aucune boîte sélectionnée");
      }

      if (!formData.volId) {
        throw new Error("Aucun vol sélectionné");
      }

      const result = await apiClient.assignBoiteToVol(boiteId, formData.volId);
      console.log("Assignment successful:", result);

      // Show success message
      alert(`✅ Boîte "${selectedBoite?.name}" assignée avec succès au vol!`);

      // Close modal and refresh data
      setShowAssignModal(false);
      setSelectedBoite(null);

      // Force reload to get updated assignment data
      await loadBoites();
      console.log("Data reloaded after assignment");
    } catch (err) {
      console.error("Assignment error:", err);
      setError(err.message || "Erreur lors de l'assignation");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await apiClient.deleteBoiteMedicale(boiteToDelete.id);
      setShowDeleteModal(false);
      setBoiteToDelete(null);
      loadBoites();
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
      type: "",
      status: "",
      expiring: false,
    });
  };

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="boites-medicales-management">
      <div className="page-header">
        <h1>🏥 Gestion des Boîtes Médicales</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Nouvelle Boîte
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-info">
            <div className="stat-value">{boites.length}</div>
            <div className="stat-label">Total Boîtes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">
              {boites.filter((b) => b?.isActive).length}
            </div>
            <div className="stat-label">Actives</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">
              {
                boites.filter((b) => {
                  if (!b?.dateExpiration) return false;
                  const expDate = new Date(b.dateExpiration);
                  const today = new Date();
                  const daysUntilExpiry = Math.ceil(
                    (expDate - today) / (1000 * 60 * 60 * 24)
                  );
                  return daysUntilExpiry <= 30;
                }).length
              }
            </div>
            <div className="stat-label">Expirent Bientôt</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✈️</div>
          <div className="stat-info">
            <div className="stat-value">
              {boites.filter((b) => b?.assignedVol).length}
            </div>
            <div className="stat-label">Assignées</div>
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
              placeholder="Numéro, nom..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="0">Boîte Docteur</option>
              <option value="1">Boîte Pharmacie</option>
              <option value="2">Kit Premier Secours</option>
              <option value="3">Boîte Urgence</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Statut</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.expiring}
                onChange={(e) =>
                  handleFilterChange("expiring", e.target.checked)
                }
              />
              Expirent bientôt (30 jours)
            </label>
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
        data={boites}
        columns={columns}
        loading={loading}
        emptyMessage="Aucune boîte médicale trouvée"
      />

      {/* Boîte Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBoite ? "Modifier la Boîte" : "Nouvelle Boîte Médicale"}
        size="lg"
      >
        <Form
          fields={boiteFormFields}
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedBoite(null);
        }}
        title={`Assigner: ${selectedBoite?.name}`}
      >
        {vols.length === 0 ? (
          <div className="alert alert-warning">
            <p>⚠️ Aucun vol disponible pour l'assignation.</p>
            <p>
              Veuillez d'abord créer des vols dans la section "Gestion des
              Vols".
            </p>
          </div>
        ) : (
          <div>
            <div className="alert alert-info mb-3">
              <p>
                📋 Sélectionnez le vol auquel vous souhaitez assigner cette
                boîte médicale.
              </p>
            </div>
            <Form
              fields={assignFormFields}
              initialValues={assignFormInitialValues}
              onSubmit={handleAssignSubmit}
              onCancel={() => {
                setShowAssignModal(false);
                setSelectedBoite(null);
              }}
            />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la Boîte"
        message={`Êtes-vous sûr de vouloir supprimer la boîte "${boiteToDelete?.name}" ?`}
        confirmText="Supprimer"
        confirmClass="btn-danger"
      />
    </div>
  );
};

export default BoitesMedicalesManagement;
