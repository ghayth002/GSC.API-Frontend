import React, { useState, useEffect } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./ArticleManagement.css";

const ArticleManagement = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    supplier: "",
    isActive: "",
  });

  // Article form fields configuration
  const articleFormFields = [
    {
      name: "code",
      label: "Code Article",
      type: "text",
      required: true,
      placeholder: "Ex: REP001",
    },
    {
      name: "name",
      label: "Nom de l'Article",
      type: "text",
      required: true,
      placeholder: "Ex: Plateau repas Economy",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 3,
      placeholder: "Description détaillée de l'article...",
    },
    {
      name: "type",
      label: "Type d'Article",
      type: "select",
      required: true,
      options: [
        { value: 0, label: "Repas" },
        { value: 1, label: "Boisson" },
        { value: 2, label: "Consommable" },
        { value: 3, label: "Semi-Consommable" },
        { value: 4, label: "Matériel Divers" },
      ],
    },
    {
      name: "unit",
      label: "Unité de Mesure",
      type: "select",
      required: true,
      options: [
        { value: "Unité", label: "Unité" },
        { value: "Kg", label: "Kilogramme" },
        { value: "Litre", label: "Litre" },
        { value: "Paquet", label: "Paquet" },
        { value: "Boîte", label: "Boîte" },
        { value: "Carton", label: "Carton" },
      ],
    },
    {
      name: "unitPrice",
      label: "Prix Unitaire (TND)",
      type: "number",
      required: true,
      min: 0,
      step: 0.001,
    },
    {
      name: "supplier",
      label: "Fournisseur",
      type: "select",
      required: true,
      options: [
        { value: "NewRest", label: "NewRest" },
        { value: "LSG Sky Chefs", label: "LSG Sky Chefs" },
        { value: "Gate Gourmet", label: "Gate Gourmet" },
        { value: "Tunisie Catering", label: "Tunisie Catering" },
        { value: "Autre", label: "Autre" },
      ],
    },
    {
      name: "isActive",
      label: "Article Actif",
      type: "checkbox",
    },
  ];

  // Form validation schema
  const validationSchema = {
    code: {
      required: true,
      pattern: "^[A-Z]{2,3}[0-9]{3,4}$",
      patternMessage: "Format invalide (ex: REP001)",
    },
    name: { required: true, minLength: 3 },
    type: { required: true },
    unit: { required: true },
    unitPrice: { required: true },
    supplier: { required: true },
  };

  // Table columns configuration
  const columns = [
    {
      key: "code",
      title: "Code",
      sortable: true,
      render: (value, row) => (
        <div className="article-code">
          <strong>{value}</strong>
          <StatusBadge
            status={row.isActive ? "Actif" : "Inactif"}
            type={row.isActive ? "success" : "secondary"}
            size="small"
          />
        </div>
      ),
    },
    {
      key: "name",
      title: "Nom de l'Article",
      sortable: true,
      render: (value, row) => (
        <div className="article-name">
          <strong>{value}</strong>
          {row.description && (
            <small className="article-description">{row.description}</small>
          )}
        </div>
      ),
    },
    {
      key: "type",
      title: "Type",
      sortable: true,
      render: (value) => {
        const typeColors = {
          0: "warning",
          1: "info",
          2: "success",
          3: "info",
          4: "primary",
        };

        // Display mapping for better UX
        const typeLabels = {
          0: "Repas",
          1: "Boisson",
          2: "Consommable",
          3: "Semi-Consommable",
          4: "Matériel Divers",
        };

        return (
          <StatusBadge
            status={typeLabels[value] || value}
            type={typeColors[value] || "default"}
            size="small"
          />
        );
      },
    },
    {
      key: "unit",
      title: "Unité",
      align: "center",
    },
    {
      key: "unitPrice",
      title: "Prix Unitaire",
      type: "currency",
      align: "right",
      sortable: true,
    },
    {
      key: "supplier",
      title: "Fournisseur",
      sortable: true,
      render: (value) => <span className="supplier-name">{value}</span>,
    },
  ];

  // Load articles
  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading articles with filters:", filters);
      const response = await apiClient.getArticles(filters);
      console.log("API response:", response);

      // Handle different response structures
      let articlesData = [];
      if (response && response.data) {
        articlesData = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
      } else if (Array.isArray(response)) {
        articlesData = response;
      }

      console.log("Setting articles data:", articlesData);
      setArticles(articlesData);
    } catch (err) {
      console.error("Error loading articles:", err);
      setError(err.message || "Erreur lors du chargement des articles");

      // Only use empty list if server is completely unreachable
      if (err.status === 0 || err.message?.includes("contacter le serveur")) {
        console.warn("Server unreachable, using empty article list");
        setArticles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load articles on component mount and filter changes
  useEffect(() => {
    loadArticles();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle create/edit article
  const handleSaveArticle = async (articleData) => {
    try {
      // Process article data to ensure proper formatting
      const processedData = { ...articleData };

      // Ensure all required fields are present
      if (
        !processedData.code ||
        !processedData.name ||
        !processedData.type ||
        !processedData.unit ||
        !processedData.unitPrice ||
        !processedData.supplier
      ) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      // Ensure numeric fields are properly converted
      if (processedData.unitPrice) {
        processedData.unitPrice = parseFloat(processedData.unitPrice);
      }

      // Ensure code is uppercase
      if (processedData.code) {
        processedData.code = processedData.code.toUpperCase();
      }

      // Convert type to integer for enum handling
      if (processedData.type !== undefined && processedData.type !== null) {
        processedData.type = parseInt(processedData.type, 10);
      }

      console.log("Processed article data:", processedData);

      console.log("Final data being sent to API:", processedData);

      let result;
      if (editingArticle) {
        result = await apiClient.updateArticle(
          editingArticle.id,
          processedData
        );
        console.log("Article updated successfully:", result);
      } else {
        // Send data directly to API (no DTO wrapper needed)
        result = await apiClient.createArticle(processedData);
        console.log("Article created successfully:", result);
      }

      setShowModal(false);
      setEditingArticle(null);

      // Force refresh the articles list
      console.log("Refreshing articles list...");
      await loadArticles();
    } catch (err) {
      console.error("Error saving article:", err);

      // Provide more detailed error message
      let errorMessage = "Erreur lors de l'enregistrement de l'article";

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

  // Handle delete article
  const handleDeleteArticle = async () => {
    try {
      await apiClient.deleteArticle(articleToDelete.id);
      setShowDeleteModal(false);
      setArticleToDelete(null);
      await loadArticles();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression de l'article");
    }
  };

  // Handle actions
  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowModal(true);
  };

  const handleDelete = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  const handleView = (article) => {
    // Navigate to article details or show details modal
    console.log("View article:", article);
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
      type: "",
      supplier: "",
      isActive: "",
    });
  };

  // Table actions
  const tableActions = [
    {
      label: "Nouvel Article",
      icon: "📦",
      onClick: () => {
        setEditingArticle(null);
        setShowModal(true);
      },
      className: "btn-primary",
    },
    {
      label: "Actualiser",
      icon: "🔄",
      onClick: loadArticles,
      className: "btn-secondary",
    },
  ];

  // Get unique suppliers for filter
  const uniqueSuppliers = [
    ...new Set(articles.map((article) => article.supplier)),
  ].filter(Boolean);

  if (error) {
    return (
      <div className="article-management error-state">
        <div className="error-message">
          <h3>❌ Erreur</h3>
          <p>{error}</p>
          <button onClick={loadArticles} className="btn btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="article-management">
      <div className="page-header">
        <div className="header-content">
          <h1>📦 Gestion des Articles</h1>
          <p>
            Gestion du catalogue des articles, produits et matériels de catering
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{articles.length}</div>
              <div className="stat-label">Total Articles</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">
                {articles.filter((a) => a.isActive).length}
              </div>
              <div className="stat-label">Articles Actifs</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-content">
              <div className="stat-number">
                {articles.filter((a) => a.type === "Repas").length}
              </div>
              <div className="stat-label">Repas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🥤</div>
            <div className="stat-content">
              <div className="stat-number">
                {articles.filter((a) => a.type === "Boisson").length}
              </div>
              <div className="stat-label">Boissons</div>
            </div>
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
              placeholder="Code, nom, description..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Type d'Article</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="form-control"
            >
              <option value="">Tous les types</option>
              <option value="0">Repas</option>
              <option value="1">Boisson</option>
              <option value="2">Consommable</option>
              <option value="3">Semi-Consommable</option>
              <option value="4">Matériel Divers</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Fournisseur</label>
            <select
              value={filters.supplier}
              onChange={(e) => handleFilterChange("supplier", e.target.value)}
              className="form-control"
            >
              <option value="">Tous les fournisseurs</option>
              {uniqueSuppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Statut</label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className="form-control"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
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
        data={articles}
        columns={columns}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actions={tableActions}
        emptyMessage="Aucun article trouvé"
        className="articles-table"
      />

      {/* Article Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingArticle(null);
        }}
        title={editingArticle ? "Modifier l'Article" : "Nouvel Article"}
        size="large"
      >
        <Form
          fields={articleFormFields}
          initialValues={editingArticle || { isActive: true }}
          validationSchema={validationSchema}
          onSubmit={handleSaveArticle}
          onCancel={() => {
            setShowModal(false);
            setEditingArticle(null);
          }}
          submitText={editingArticle ? "Mettre à jour" : "Créer"}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteArticle}
        title="Supprimer l'Article"
        message={
          articleToDelete
            ? `Êtes-vous sûr de vouloir supprimer l'article "${articleToDelete.name}" (${articleToDelete.code}) ?`
            : ""
        }
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

export default ArticleManagement;
