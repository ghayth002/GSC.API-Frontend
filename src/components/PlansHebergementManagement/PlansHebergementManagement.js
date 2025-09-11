import React, { useState, useEffect, useMemo } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./PlansHebergementManagement.css";

const PlansHebergementManagement = () => {
  const [plans, setPlans] = useState([]);
  const [vols, setVols] = useState([]);
  const [articles, setArticles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [showMenusModal, setShowMenusModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    season: "",
    aircraftType: "",
    zone: "",
    isActive: "",
  });

  // Create stable initial values for form to prevent infinite re-renders
  const formInitialValues = useMemo(() => editingPlan || {}, [editingPlan]);

  // Plan form fields configuration
  const planFormFields = [
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
      name: "name",
      label: "Nom du Plan",
      type: "text",
      required: true,
      placeholder: "Ex: Plan TU123 - 15/01/2024",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 3,
      placeholder: "Description détaillée du plan d'hébergement...",
    },
    {
      name: "season",
      label: "Saison",
      type: "select",
      required: true,
      options: [
        { value: "Hiver", label: "Hiver" },
        { value: "Été", label: "Été" },
        { value: "Printemps", label: "Printemps" },
        { value: "Automne", label: "Automne" },
      ],
    },
    {
      name: "aircraftType",
      label: "Type d'Avion",
      type: "select",
      required: true,
      options: [
        { value: "A320", label: "Airbus A320" },
        { value: "A330", label: "Airbus A330" },
        { value: "B737", label: "Boeing 737" },
        { value: "ATR72", label: "ATR 72" },
      ],
    },
    {
      name: "zone",
      label: "Zone Géographique",
      type: "select",
      required: true,
      options: [
        { value: "Europe", label: "Europe" },
        { value: "Afrique", label: "Afrique" },
        { value: "Moyen-Orient", label: "Moyen-Orient" },
        { value: "Maghreb", label: "Maghreb" },
        { value: "Domestique", label: "Domestique" },
      ],
    },
    {
      name: "flightDuration",
      label: "Durée de Vol",
      type: "time",
      required: true,
      placeholder: "HH:MM:SS",
    },
    {
      name: "isActive",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { value: true, label: "Actif" },
        { value: false, label: "Inactif" },
      ],
    },
  ];

  // Table columns configuration
  const columns = [
    {
      key: "name",
      label: "Nom du Plan",
      sortable: true,
    },
    {
      key: "volInfo",
      label: "Vol",
      render: (plan) => (
        <div>
          <strong>{plan.vol?.flightNumber}</strong>
          <br />
          <small>{plan.vol?.flightDate}</small>
        </div>
      ),
    },
    {
      key: "season",
      label: "Saison",
      sortable: true,
    },
    {
      key: "aircraftType",
      label: "Avion",
      sortable: true,
    },
    {
      key: "zone",
      label: "Zone",
      sortable: true,
    },
    {
      key: "flightDuration",
      label: "Durée",
      sortable: true,
    },
    {
      key: "isActive",
      label: "Statut",
      render: (plan) => (
        <StatusBadge
          status={plan.isActive ? "active" : "inactive"}
          text={plan.isActive ? "Actif" : "Inactif"}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (plan) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleViewArticles(plan)}
            title="Gérer les Articles"
          >
            📦
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => handleViewMenus(plan)}
            title="Gérer les Menus"
          >
            🍽️
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleEdit(plan)}
            title="Modifier"
          >
            ✏️
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(plan)}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadPlans();
    loadVols();
    loadArticles();
    loadMenus();
  }, [filters]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPlansHebergement(filters);
      setPlans(response.data || response);
    } catch (err) {
      setError("Erreur lors du chargement des plans d'hébergement");
      console.error("Error loading plans:", err);
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

  const loadArticles = async () => {
    try {
      const response = await apiClient.getArticles();
      setArticles(response.data || response);
    } catch (err) {
      console.error("Error loading articles:", err);
    }
  };

  const loadMenus = async () => {
    try {
      const response = await apiClient.getMenus();
      setMenus(response.data || response);
    } catch (err) {
      console.error("Error loading menus:", err);
    }
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleViewArticles = (plan) => {
    setSelectedPlan(plan);
    setShowArticlesModal(true);
  };

  const handleViewMenus = (plan) => {
    setSelectedPlan(plan);
    setShowMenusModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (editingPlan) {
        await apiClient.updatePlanHebergement(editingPlan.id, formData);
      } else {
        await apiClient.createPlanHebergement(formData);
      }
      setShowModal(false);
      loadPlans();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await apiClient.deletePlanHebergement(planToDelete.id);
      setShowDeleteModal(false);
      setPlanToDelete(null);
      loadPlans();
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
      season: "",
      aircraftType: "",
      zone: "",
      isActive: "",
    });
  };

  if (loading) {
    return <div className="loading-spinner">Chargement...</div>;
  }

  return (
    <div className="plans-hebergement-management">
      <div className="page-header">
        <h1>📋 Gestion des Plans d'Hébergement</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Nouveau Plan
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
              placeholder="Nom du plan..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Saison</label>
            <select
              value={filters.season}
              onChange={(e) => handleFilterChange("season", e.target.value)}
            >
              <option value="">Toutes les saisons</option>
              <option value="Hiver">Hiver</option>
              <option value="Été">Été</option>
              <option value="Printemps">Printemps</option>
              <option value="Automne">Automne</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type d'Avion</label>
            <select
              value={filters.aircraftType}
              onChange={(e) =>
                handleFilterChange("aircraftType", e.target.value)
              }
            >
              <option value="">Tous les avions</option>
              <option value="A320">Airbus A320</option>
              <option value="A330">Airbus A330</option>
              <option value="B737">Boeing 737</option>
              <option value="ATR72">ATR 72</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Zone</label>
            <select
              value={filters.zone}
              onChange={(e) => handleFilterChange("zone", e.target.value)}
            >
              <option value="">Toutes les zones</option>
              <option value="Europe">Europe</option>
              <option value="Afrique">Afrique</option>
              <option value="Moyen-Orient">Moyen-Orient</option>
              <option value="Maghreb">Maghreb</option>
              <option value="Domestique">Domestique</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Statut</label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
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
        data={plans}
        columns={columns}
        loading={loading}
        emptyMessage="Aucun plan d'hébergement trouvé"
      />

      {/* Plan Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPlan ? "Modifier le Plan" : "Nouveau Plan d'Hébergement"}
        size="lg"
      >
        <Form
          fields={planFormFields}
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le Plan"
        message={`Êtes-vous sûr de vouloir supprimer le plan "${planToDelete?.name}" ?`}
        confirmText="Supprimer"
        confirmClass="btn-danger"
      />

      {/* Articles Management Modal */}
      {selectedPlan && (
        <ArticlesManagementModal
          isOpen={showArticlesModal}
          onClose={() => setShowArticlesModal(false)}
          plan={selectedPlan}
          articles={articles}
          onUpdate={loadPlans}
        />
      )}

      {/* Menus Management Modal */}
      {selectedPlan && (
        <MenusManagementModal
          isOpen={showMenusModal}
          onClose={() => setShowMenusModal(false)}
          plan={selectedPlan}
          menus={menus}
          onUpdate={loadPlans}
        />
      )}
    </div>
  );
};

// Articles Management Modal Component
const ArticlesManagementModal = ({
  isOpen,
  onClose,
  plan,
  articles,
  onUpdate,
}) => {
  const [planArticles, setPlanArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && plan) {
      loadPlanArticles();
    }
  }, [isOpen, plan]);

  const loadPlanArticles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPlanHebergementById(plan.id);
      setPlanArticles(response.articles || []);
    } catch (err) {
      setError("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = async (articleData) => {
    try {
      await apiClient.addArticleToPlan(plan.id, articleData);
      setShowAddModal(false);
      loadPlanArticles();
      onUpdate();
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout");
    }
  };

  const handleRemoveArticle = async (articleId) => {
    try {
      await apiClient.removePlanArticle(articleId);
      loadPlanArticles();
      onUpdate();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    }
  };

  const articleFormFields = [
    {
      name: "articleId",
      label: "Article",
      type: "select",
      required: true,
      options: articles.map((article) => ({
        value: article.id,
        label: `${article.code} - ${article.name}`,
      })),
    },
    {
      name: "quantiteStandard",
      label: "Quantité Standard",
      type: "number",
      required: true,
      min: 1,
    },
    {
      name: "typePassager",
      label: "Type de Passager",
      type: "select",
      required: true,
      options: [
        { value: "Economy", label: "Économique" },
        { value: "Business", label: "Affaires" },
        { value: "First", label: "Première" },
        { value: "All", label: "Tous" },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Articles du Plan: ${plan?.name}`}
      size="xl"
    >
      <div className="articles-management">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="modal-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Ajouter Article
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Chargement...</div>
        ) : (
          <div className="articles-list">
            {planArticles.length === 0 ? (
              <p>Aucun article associé à ce plan.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Article</th>
                    <th>Quantité</th>
                    <th>Type Passager</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {planArticles.map((planArticle) => (
                    <tr key={planArticle.id}>
                      <td>{planArticle.article?.code}</td>
                      <td>{planArticle.article?.name}</td>
                      <td>{planArticle.quantiteStandard}</td>
                      <td>{planArticle.typePassager}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveArticle(planArticle.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Ajouter Article au Plan"
        >
          <Form
            fields={articleFormFields}
            initialValues={{}}
            onSubmit={handleAddArticle}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>
      </div>
    </Modal>
  );
};

// Menus Management Modal Component
const MenusManagementModal = ({ isOpen, onClose, plan, menus, onUpdate }) => {
  const [planMenus, setPlanMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && plan) {
      loadPlanMenus();
    }
  }, [isOpen, plan]);

  const loadPlanMenus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPlanHebergementById(plan.id);
      setPlanMenus(response.menus || []);
    } catch (err) {
      setError("Erreur lors du chargement des menus");
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateMenu = async (menuId) => {
    try {
      await apiClient.associateMenuToPlan(plan.id, menuId);
      loadPlanMenus();
      onUpdate();
    } catch (err) {
      setError(err.message || "Erreur lors de l'association");
    }
  };

  const handleDissociateMenu = async (menuId) => {
    try {
      await apiClient.dissociateMenuFromPlan(plan.id, menuId);
      loadPlanMenus();
      onUpdate();
    } catch (err) {
      setError(err.message || "Erreur lors de la dissociation");
    }
  };

  const availableMenus = menus.filter(
    (menu) => !planMenus.some((planMenu) => planMenu.id === menu.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Menus du Plan: ${plan?.name}`}
      size="xl"
    >
      <div className="menus-management">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Chargement...</div>
        ) : (
          <div className="row">
            <div className="col-md-6">
              <h5>Menus Associés</h5>
              {planMenus.length === 0 ? (
                <p>Aucun menu associé à ce plan.</p>
              ) : (
                <div className="menus-list">
                  {planMenus.map((menu) => (
                    <div key={menu.id} className="menu-item">
                      <div className="menu-info">
                        <strong>{menu.name}</strong>
                        <br />
                        <small>
                          {menu.typePassager} - {menu.season}
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDissociateMenu(menu.id)}
                      >
                        ❌ Dissocier
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <h5>Menus Disponibles</h5>
              {availableMenus.length === 0 ? (
                <p>Tous les menus sont déjà associés.</p>
              ) : (
                <div className="menus-list">
                  {availableMenus.map((menu) => (
                    <div key={menu.id} className="menu-item">
                      <div className="menu-info">
                        <strong>{menu.name}</strong>
                        <br />
                        <small>
                          {menu.typePassager} - {menu.season}
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleAssociateMenu(menu.id)}
                      >
                        ➕ Associer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlansHebergementManagement;
