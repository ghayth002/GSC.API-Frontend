import React, { useState, useEffect } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./MenuManagement.css";

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    typePassager: "",
    season: "",
    zone: "",
  });

  // Menu form fields configuration
  const menuFormFields = [
    {
      name: "name",
      label: "Nom du Menu",
      type: "text",
      required: true,
      placeholder: "Ex: Menu Europe Hiver",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 3,
      placeholder: "Description détaillée du menu...",
    },
    {
      name: "typePassager",
      label: "Type de Passager",
      type: "select",
      required: true,
      options: [
        { value: "Economy", label: "Classe Économique" },
        { value: "Business", label: "Classe Affaires" },
        { value: "First", label: "Première Classe" },
        { value: "Crew", label: "Équipage" },
      ],
    },
    {
      name: "season",
      label: "Saison",
      type: "select",
      required: true,
      options: [
        { value: "Hiver", label: "Hiver" },
        { value: "Été", label: "Été" },
        { value: "Toute l'année", label: "Toute l'année" },
      ],
    },
    {
      name: "zone",
      label: "Zone",
      type: "select",
      required: true,
      options: [
        { value: "Domestique", label: "Domestique" },
        { value: "Maghreb", label: "Maghreb" },
        { value: "Europe", label: "Europe" },
        { value: "Afrique", label: "Afrique" },
        { value: "Moyen-Orient", label: "Moyen-Orient" },
      ],
    },
    {
      name: "isActive",
      label: "Menu Actif",
      type: "checkbox",
    },
  ];

  // Menu item form fields
  const menuItemFormFields = [
    {
      name: "articleId",
      label: "Article",
      type: "select",
      required: true,
      options: articles.map((article) => ({
        value: article.id,
        label: `${article.name} (${article.code})`,
      })),
    },
    {
      name: "quantity",
      label: "Quantité",
      type: "number",
      required: true,
      min: 1,
      step: 1,
    },
  ];

  // Form validation schema
  const validationSchema = {
    name: { required: true, minLength: 3 },
    typePassager: { required: true },
    season: { required: true },
    zone: { required: true },
  };

  const menuItemValidationSchema = {
    articleId: { required: true },
    quantity: { required: true },
  };

  // Table columns configuration
  const columns = [
    {
      key: "name",
      title: "Nom du Menu",
      sortable: true,
      render: (value, row) => (
        <div className="menu-name">
          <strong>{value}</strong>
          {row.description && (
            <small className="menu-description">{row.description}</small>
          )}
        </div>
      ),
    },
    {
      key: "typePassager",
      title: "Type",
      sortable: true,
      render: (value) => {
        const typeMap = {
          Economy: { label: "Économique", type: "info" },
          Business: { label: "Affaires", type: "warning" },
          First: { label: "Première", type: "success" },
          Crew: { label: "Équipage", type: "secondary" },
        };
        const config = typeMap[value] || { label: value, type: "default" };
        return (
          <StatusBadge status={config.label} type={config.type} size="small" />
        );
      },
    },
    {
      key: "season",
      title: "Saison",
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value}
          type={
            value === "Été"
              ? "warning"
              : value === "Hiver"
              ? "info"
              : "secondary"
          }
          size="small"
        />
      ),
    },
    {
      key: "zone",
      title: "Zone",
      sortable: true,
    },
    {
      key: "menuItems",
      title: "Articles",
      align: "center",
      render: (value) => (
        <div className="menu-items-count">
          <span className="items-count">{value?.length || 0}</span>
          <small>articles</small>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Statut",
      render: (value) => (
        <StatusBadge
          status={value ? "Actif" : "Inactif"}
          type={value ? "success" : "secondary"}
          size="small"
        />
      ),
    },
  ];

  // Menu items table columns
  const itemColumns = [
    {
      key: "article",
      title: "Article",
      render: (value) => (
        <div className="article-info">
          <strong>{value?.name}</strong>
          <small className="article-code">Code: {value?.code}</small>
        </div>
      ),
    },
    {
      key: "quantity",
      title: "Quantité",
      align: "center",
    },
    {
      key: "article.unitPrice",
      title: "Prix Unitaire",
      type: "currency",
      align: "right",
    },
    {
      key: "totalPrice",
      title: "Prix Total",
      align: "right",
      render: (value, row) => {
        const total = (row.article?.unitPrice || 0) * (row.quantity || 0);
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "TND",
        }).format(total);
      },
    },
  ];

  // Load data
  const loadMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading menus with filters:", filters);
      const response = await apiClient.getMenus(filters);
      console.log("API response:", response);

      // Handle different response structures
      let menusData = [];
      if (response && response.data) {
        menusData = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
      } else if (Array.isArray(response)) {
        menusData = response;
      }

      console.log("Setting menus data:", menusData);
      setMenus(menusData);
    } catch (err) {
      console.error("Error loading menus:", err);
      setError(err.message || "Erreur lors du chargement des menus");

      // Only use empty list if server is completely unreachable
      if (err.status === 0 || err.message?.includes("contacter le serveur")) {
        console.warn("Server unreachable, using empty menu list");
        setMenus([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      console.log("Loading articles for menu management...");
      const response = await apiClient.getArticles({ pageSize: 1000 });

      // Handle different response structures
      let articlesData = [];
      if (response && response.data) {
        articlesData = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
      } else if (Array.isArray(response)) {
        articlesData = response;
      }

      console.log("Loaded articles:", articlesData.length);
      setArticles(articlesData);
    } catch (err) {
      console.error("Error loading articles:", err);
      setArticles([]);
    }
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    loadMenus();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadArticles();
  }, []);

  // Handle create/edit menu
  const handleSaveMenu = async (menuData) => {
    try {
      // Process menu data to ensure proper formatting
      const processedData = { ...menuData };

      // Ensure all required fields are present
      if (
        !processedData.name ||
        !processedData.typePassager ||
        !processedData.season ||
        !processedData.zone
      ) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      console.log("Processed menu data:", processedData);

      let result;
      if (editingMenu) {
        result = await apiClient.updateMenu(editingMenu.id, processedData);
        console.log("Menu updated successfully:", result);
      } else {
        result = await apiClient.createMenu(processedData);
        console.log("Menu created successfully:", result);
      }

      setShowModal(false);
      setEditingMenu(null);

      // Force refresh the menus list
      console.log("Refreshing menus list...");
      await loadMenus();
    } catch (err) {
      console.error("Error saving menu:", err);

      // Provide more detailed error message
      let errorMessage = "Erreur lors de l'enregistrement du menu";

      if (err.errors) {
        const errorDetails = [];
        Object.keys(err.errors).forEach((field) => {
          if (Array.isArray(err.errors[field])) {
            errorDetails.push(`${field}: ${err.errors[field].join(", ")}`);
          } else {
            errorDetails.push(`${field}: ${err.errors[field]}`);
          }
        });
        errorMessage += ": " + errorDetails.join("; ");
      } else if (err.message) {
        errorMessage = err.message;
      }

      throw new Error(errorMessage);
    }
  };

  // Handle delete menu
  const handleDeleteMenu = async () => {
    try {
      await apiClient.deleteMenu(menuToDelete.id);
      setShowDeleteModal(false);
      setMenuToDelete(null);
      await loadMenus();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression du menu");
    }
  };

  // Handle menu item operations
  const handleAddMenuItem = async (itemData) => {
    try {
      console.log("Adding menu item:", itemData);
      const result = await apiClient.addMenuItems(selectedMenu.id, itemData);
      console.log("Menu item added successfully:", result);

      // Refresh both the menus list and selected menu data
      await loadMenus();
      const updatedMenu = await apiClient.getMenuById(selectedMenu.id);
      console.log("Updated menu with new item:", updatedMenu);
      setSelectedMenu(updatedMenu);
    } catch (err) {
      console.error("Error adding menu item:", err);
      throw new Error(err.message || "Erreur lors de l'ajout de l'article");
    }
  };

  const handleRemoveMenuItem = async (itemId) => {
    try {
      console.log("Removing menu item:", itemId);
      await apiClient.removeMenuItem(itemId);
      console.log("Menu item removed successfully");

      // Refresh both the menus list and selected menu data
      await loadMenus();
      const updatedMenu = await apiClient.getMenuById(selectedMenu.id);
      console.log("Updated menu after item removal:", updatedMenu);
      setSelectedMenu(updatedMenu);
    } catch (err) {
      console.error("Error removing menu item:", err);
      setError(err.message || "Erreur lors de la suppression de l'article");
    }
  };

  // Handle actions
  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setShowModal(true);
  };

  const handleDelete = (menu) => {
    setMenuToDelete(menu);
    setShowDeleteModal(true);
  };

  const handleViewItems = async (menu) => {
    try {
      const fullMenu = await apiClient.getMenuById(menu.id);
      setSelectedMenu(fullMenu);
      setShowItemsModal(true);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des détails du menu");
    }
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      typePassager: "",
      season: "",
      zone: "",
    });
  };

  // Table actions
  const tableActions = [
    {
      label: "Nouveau Menu",
      icon: "🍽️",
      onClick: () => {
        setEditingMenu(null);
        setShowModal(true);
      },
      className: "btn-primary",
    },
    {
      label: "Actualiser",
      icon: "🔄",
      onClick: loadMenus,
      className: "btn-secondary",
    },
  ];

  if (error) {
    return (
      <div className="menu-management error-state">
        <div className="error-message">
          <h3>❌ Erreur</h3>
          <p>{error}</p>
          <button onClick={loadMenus} className="btn btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-management">
      <div className="page-header">
        <div className="header-content">
          <h1>🍽️ Gestion des Menus</h1>
          <p>
            Création et gestion des menus de restauration par classe et
            destination
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Nom du menu, description..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Type de Passager</label>
            <select
              value={filters.typePassager}
              onChange={(e) =>
                handleFilterChange("typePassager", e.target.value)
              }
              className="form-control"
            >
              <option value="">Tous les types</option>
              <option value="Economy">Classe Économique</option>
              <option value="Business">Classe Affaires</option>
              <option value="First">Première Classe</option>
              <option value="Crew">Équipage</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Saison</label>
            <select
              value={filters.season}
              onChange={(e) => handleFilterChange("season", e.target.value)}
              className="form-control"
            >
              <option value="">Toutes les saisons</option>
              <option value="Hiver">Hiver</option>
              <option value="Été">Été</option>
              <option value="Toute l'année">Toute l'année</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Zone</label>
            <select
              value={filters.zone}
              onChange={(e) => handleFilterChange("zone", e.target.value)}
              className="form-control"
            >
              <option value="">Toutes les zones</option>
              <option value="Domestique">Domestique</option>
              <option value="Maghreb">Maghreb</option>
              <option value="Europe">Europe</option>
              <option value="Afrique">Afrique</option>
              <option value="Moyen-Orient">Moyen-Orient</option>
            </select>
          </div>
          <div className="filter-actions">
            <button onClick={resetFilters} className="btn btn-secondary btn-sm">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={menus}
        columns={columns}
        loading={loading}
        onView={handleViewItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actions={tableActions}
        emptyMessage="Aucun menu trouvé"
        className="menus-table"
      />

      {/* Menu Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingMenu(null);
        }}
        title={editingMenu ? "Modifier le Menu" : "Nouveau Menu"}
        size="large"
      >
        <Form
          fields={menuFormFields}
          initialValues={editingMenu || { isActive: true }}
          validationSchema={validationSchema}
          onSubmit={handleSaveMenu}
          onCancel={() => {
            setShowModal(false);
            setEditingMenu(null);
          }}
          submitText={editingMenu ? "Mettre à jour" : "Créer"}
        />
      </Modal>

      {/* Menu Items Modal */}
      <Modal
        isOpen={showItemsModal}
        onClose={() => {
          setShowItemsModal(false);
          setSelectedMenu(null);
        }}
        title={`Articles du Menu: ${selectedMenu?.name}`}
        size="xl"
      >
        {selectedMenu && (
          <MenuItemsManager
            menu={selectedMenu}
            articles={articles}
            onAddItem={handleAddMenuItem}
            onRemoveItem={handleRemoveMenuItem}
            itemColumns={itemColumns}
            itemFormFields={menuItemFormFields}
            itemValidationSchema={menuItemValidationSchema}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMenu}
        title="Supprimer le Menu"
        message={
          menuToDelete
            ? `Êtes-vous sûr de vouloir supprimer le menu "${menuToDelete.name}" ?`
            : ""
        }
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

// Menu Items Manager Component
const MenuItemsManager = ({
  menu,
  articles,
  onAddItem,
  onRemoveItem,
  itemColumns,
  itemFormFields,
  itemValidationSchema,
}) => {
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const handleAddItem = async (itemData) => {
    await onAddItem(itemData);
    setShowAddItemForm(false);
  };

  const totalMenuPrice =
    menu.menuItems?.reduce((total, item) => {
      return total + (item.article?.unitPrice || 0) * (item.quantity || 0);
    }, 0) || 0;

  return (
    <div className="menu-items-manager">
      <div className="menu-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <label>Type de Passager</label>
            <StatusBadge status={menu.typePassager} type="info" />
          </div>
          <div className="summary-item">
            <label>Saison</label>
            <StatusBadge status={menu.season} type="secondary" />
          </div>
          <div className="summary-item">
            <label>Zone</label>
            <span>{menu.zone}</span>
          </div>
          <div className="summary-item">
            <label>Prix Total du Menu</label>
            <strong className="total-price">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "TND",
              }).format(totalMenuPrice)}
            </strong>
          </div>
        </div>
      </div>

      <div className="items-section">
        <div className="section-header">
          <h3>Articles du Menu ({menu.menuItems?.length || 0})</h3>
          <button
            onClick={() => setShowAddItemForm(true)}
            className="btn btn-primary btn-sm"
          >
            ➕ Ajouter Article
          </button>
        </div>

        {showAddItemForm && (
          <div className="add-item-form">
            <h4>Ajouter un Article</h4>
            <Form
              fields={itemFormFields}
              initialValues={{}}
              validationSchema={itemValidationSchema}
              onSubmit={handleAddItem}
              onCancel={() => setShowAddItemForm(false)}
              submitText="Ajouter"
              showCancel={true}
            />
          </div>
        )}

        <DataTable
          data={menu.menuItems || []}
          columns={itemColumns}
          onDelete={onRemoveItem}
          emptyMessage="Aucun article dans ce menu"
          pagination={false}
          searchable={false}
          className="menu-items-table"
        />
      </div>
    </div>
  );
};

export default MenuManagement;
