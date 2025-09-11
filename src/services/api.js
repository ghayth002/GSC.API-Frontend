import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5114",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API Client class
class ApiClient {
  // Authentication endpoints
  async login(email, password, rememberMe = false) {
    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
        rememberMe,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    try {
      const response = await api.post("/api/auth/register", userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get("/api/auth/me");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.post(
        "/api/auth/change-password",
        passwordData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  async verifyEmail(email, token) {
    try {
      const response = await api.get(
        `/api/auth/verify-email?email=${encodeURIComponent(
          email
        )}&token=${encodeURIComponent(token)}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resendVerification(email) {
    try {
      const response = await api.post("/api/auth/resend-verification", {
        email,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestPasswordReset(email) {
    try {
      const response = await api.post("/api/auth/request-password-reset", {
        email,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPasswordDirect(email, code, newPassword, confirmPassword) {
    try {
      const response = await api.post("/api/auth/reset-password-direct", {
        email,
        verificationCode: code,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async googleLogin(idToken) {
    try {
      console.log(
        "Sending Google login request to:",
        `${api.defaults.baseURL}/api/auth/google-token`
      );
      console.log("Request payload:", {
        idToken: idToken.substring(0, 50) + "...",
      });

      const response = await api.post("/api/auth/google-token", {
        idToken,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Google login API error:",
        error.response?.status,
        error.response?.data
      );
      throw this.handleError(error);
    }
  }

  // User management endpoints
  async getUsers() {
    try {
      const response = await api.get("/api/users");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserById(id) {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post("/api/users", userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(id) {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignRole(userId, roleName) {
    try {
      const response = await api.post(`/api/users/${userId}/assign-role`, {
        roleName,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeRole(userId, roleName) {
    try {
      const response = await api.post(`/api/users/${userId}/remove-role`, {
        roleName,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserRoles(userId) {
    try {
      const response = await api.get(`/api/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkUserPermission(userId, permission) {
    try {
      const response = await api.get(
        `/api/users/${userId}/permissions/${permission}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Weather forecast (test endpoint)
  async getWeatherForecast() {
    try {
      const response = await api.get("/weatherforecast");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ========== GSC ENDPOINTS ==========

  // VOLS (Flights) Management
  async getVols(params = {}) {
    try {
      const response = await api.get("/api/vols", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getVolById(id) {
    try {
      const response = await api.get(`/api/vols/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createVol(volData) {
    try {
      const response = await api.post("/api/vols", volData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateVol(id, volData) {
    try {
      const response = await api.put(`/api/vols/${id}`, volData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteVol(id) {
    try {
      const response = await api.delete(`/api/vols/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchVols(params = {}) {
    try {
      const response = await api.get("/api/vols/search", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PLANS D'HÉBERGEMENT Management
  async getPlansHebergement(params = {}) {
    try {
      const response = await api.get("/api/planshebergement", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPlanHebergementById(id) {
    try {
      const response = await api.get(`/api/planshebergement/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPlanHebergement(planData) {
    try {
      const response = await api.post("/api/planshebergement", planData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePlanHebergement(id, planData) {
    try {
      const response = await api.put(`/api/planshebergement/${id}`, planData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePlanHebergement(id) {
    try {
      const response = await api.delete(`/api/planshebergement/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addArticleToPlan(planId, articleData) {
    try {
      const response = await api.post(
        `/api/planshebergement/${planId}/articles`,
        articleData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePlanArticle(articleId, articleData) {
    try {
      const response = await api.put(
        `/api/planshebergement/articles/${articleId}`,
        articleData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removePlanArticle(articleId) {
    try {
      const response = await api.delete(
        `/api/planshebergement/articles/${articleId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async associateMenuToPlan(planId, menuId) {
    try {
      const response = await api.post(
        `/api/planshebergement/${planId}/menus/${menuId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async dissociateMenuFromPlan(planId, menuId) {
    try {
      const response = await api.delete(
        `/api/planshebergement/${planId}/menus/${menuId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPlanByVol(volId) {
    try {
      const response = await api.get(`/api/planshebergement/by-vol/${volId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // MENUS Management
  async getMenus(params = {}) {
    try {
      const response = await api.get("/api/menus", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMenuById(id) {
    try {
      const response = await api.get(`/api/menus/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMenu(menuData) {
    try {
      const response = await api.post("/api/menus", menuData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMenu(id, menuData) {
    try {
      const response = await api.put(`/api/menus/${id}`, menuData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMenu(id) {
    try {
      const response = await api.delete(`/api/menus/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addMenuItems(menuId, itemData) {
    try {
      const response = await api.post(`/api/menus/${menuId}/items`, itemData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMenuItem(itemId, itemData) {
    try {
      const response = await api.put(`/api/menus/items/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeMenuItem(itemId) {
    try {
      const response = await api.delete(`/api/menus/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchMenus(params = {}) {
    try {
      const response = await api.get("/api/menus/search", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ARTICLES Management
  async getArticles(params = {}) {
    try {
      const response = await api.get("/api/articles", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getArticleById(id) {
    try {
      const response = await api.get(`/api/articles/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createArticle(articleData) {
    try {
      const response = await api.post("/api/articles", articleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateArticle(id, articleData) {
    try {
      const response = await api.put(`/api/articles/${id}`, articleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteArticle(id) {
    try {
      const response = await api.delete(`/api/articles/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchArticles(params = {}) {
    try {
      const response = await api.get("/api/articles/search", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getArticlesByType(type) {
    try {
      const response = await api.get(`/api/articles/by-type/${type}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // BCP (Bons de Commande Prévisionnels) Management
  async getBCP(params = {}) {
    try {
      const response = await api.get("/api/bonscommanderevisionnels", {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBCPById(id) {
    try {
      const response = await api.get(`/api/bonscommanderevisionnels/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBCP(bcpData) {
    try {
      const response = await api.post("/api/bonscommanderevisionnels", bcpData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBCP(id, bcpData) {
    try {
      const response = await api.put(
        `/api/bonscommanderevisionnels/${id}`,
        bcpData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBCP(id) {
    try {
      const response = await api.delete(`/api/bonscommanderevisionnels/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateBCPFromVol(volId, supplierData = {}) {
    try {
      const response = await api.post(
        `/api/bonscommanderevisionnels/generate-from-vol/${volId}`,
        supplierData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBCPStatus(id, statusData) {
    try {
      const response = await api.put(
        `/api/bonscommanderevisionnels/${id}/status`,
        statusData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchBCP(params = {}) {
    try {
      const response = await api.get("/api/bonscommanderevisionnels/search", {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // BL (Bons de Livraison) Management
  async getBL(params = {}) {
    try {
      const response = await api.get("/api/bonslivraison", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBLById(id) {
    try {
      const response = await api.get(`/api/bonslivraison/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBL(blData) {
    try {
      const response = await api.post("/api/bonslivraison", blData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBL(id, blData) {
    try {
      const response = await api.put(`/api/bonslivraison/${id}`, blData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBL(id) {
    try {
      const response = await api.delete(`/api/bonslivraison/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateBL(id) {
    try {
      const response = await api.post(`/api/bonslivraison/${id}/validate`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBLStatus(id, statusData) {
    try {
      const response = await api.put(
        `/api/bonslivraison/${id}/status`,
        statusData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchBL(params = {}) {
    try {
      const response = await api.get("/api/bonslivraison/search", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ÉCARTS Management
  async getEcarts(params = {}) {
    try {
      const response = await api.get("/api/ecarts", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEcartById(id) {
    try {
      const response = await api.get(`/api/ecarts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createEcart(ecartData) {
    try {
      const response = await api.post("/api/ecarts", ecartData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateEcart(id, ecartData) {
    try {
      const response = await api.put(`/api/ecarts/${id}`, ecartData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteEcart(id) {
    try {
      const response = await api.delete(`/api/ecarts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resolveEcart(id, resolutionData) {
    try {
      const response = await api.post(
        `/api/ecarts/${id}/resolve`,
        resolutionData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptEcart(id) {
    try {
      const response = await api.post(`/api/ecarts/${id}/accept`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectEcart(id, rejectionData) {
    try {
      const response = await api.post(
        `/api/ecarts/${id}/reject`,
        rejectionData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchEcarts(params = {}) {
    try {
      const response = await api.get("/api/ecarts/search", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEcartsStatistics(params = {}) {
    try {
      const response = await api.get("/api/ecarts/statistics", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // BOÎTES MÉDICALES Management
  async getBoitesMedicales(params = {}) {
    try {
      const response = await api.get("/api/boitesmedicales", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBoiteMedicaleById(id) {
    try {
      const response = await api.get(`/api/boitesmedicales/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBoiteMedicale(boiteData) {
    try {
      console.log("API: Creating boite medicale with data:", boiteData);
      const response = await api.post("/api/boitesmedicales", boiteData);
      console.log("API: Boite medicale created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("API: Error creating boite medicale:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      console.error("API: Full error response:", error.response?.data);
      throw this.handleError(error);
    }
  }

  async updateBoiteMedicale(id, boiteData) {
    try {
      const response = await api.put(`/api/boitesmedicales/${id}`, boiteData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBoiteMedicale(id) {
    try {
      const response = await api.delete(`/api/boitesmedicales/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignBoiteToVol(boiteId, volId) {
    try {
      console.log(
        `Assigning boite ${boiteId} to vol ${volId} using correct API endpoint`
      );

      // Use the correct endpoint as identified in the backend API
      const createVolBoiteDto = {
        volId: parseInt(volId),
        boiteMedicaleId: parseInt(boiteId),
      };

      console.log("Sending CreateVolBoiteMedicaleDto:", createVolBoiteDto);

      const response = await api.post(
        `/api/boitesmedicales/${boiteId}/assign-to-vol/${volId}`,
        createVolBoiteDto,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Assignment successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Assignment failed:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw this.handleError(error);
    }
  }

  async unassignBoiteFromVol(volBoiteId) {
    try {
      const response = await api.delete(
        `/api/boitesmedicales/vol-assignments/${volBoiteId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailableBoites(params = {}) {
    try {
      const response = await api.get("/api/boitesmedicales/available", {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBoitesByType(type) {
    try {
      const response = await api.get(`/api/boitesmedicales/by-type/${type}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getExpiringBoites(params = {}) {
    try {
      const response = await api.get("/api/boitesmedicales/expiring", {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchBoitesMedicales(params = {}) {
    try {
      const response = await api.get("/api/boitesmedicales/search", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DOSSIERS DE VOL Management
  async getDossiersVol(params = {}) {
    try {
      const response = await api.get("/api/dossiersvol", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDossierVolById(id) {
    try {
      const response = await api.get(`/api/dossiersvol/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createDossierVol(dossierData) {
    try {
      const response = await api.post("/api/dossiersvol", dossierData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateDossierVol(id, dossierData) {
    try {
      const response = await api.put(`/api/dossiersvol/${id}`, dossierData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDossierVol(id) {
    try {
      const response = await api.delete(`/api/dossiersvol/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateDossierFromVol(volId) {
    try {
      const response = await api.post(
        `/api/dossiersvol/generate-from-vol/${volId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateDossierVol(id) {
    try {
      const response = await api.post(`/api/dossiersvol/${id}/validate`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async archiveDossierVol(id) {
    try {
      const response = await api.post(`/api/dossiersvol/${id}/archive`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addDocumentToDossier(dossierId, documentData) {
    try {
      const response = await api.post(
        `/api/dossiersvol/${dossierId}/documents`,
        documentData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeDocumentFromDossier(documentId) {
    try {
      const response = await api.delete(
        `/api/dossiersvol/documents/${documentId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDossierByVol(volId) {
    try {
      const response = await api.get(`/api/dossiersvol/by-vol/${volId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchDossiersVol(params = {}) {
    try {
      const response = await api.get("/api/dossiersvol/search", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // RAPPORTS BUDGÉTAIRES Management
  async getRapportsBudgetaires(params = {}) {
    try {
      const response = await api.get("/api/rapportsbudgetaires", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRapportBudgetaireById(id) {
    try {
      const response = await api.get(`/api/rapportsbudgetaires/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateRapportBudgetaire(rapportData) {
    try {
      const response = await api.post(
        "/api/rapportsbudgetaires/generate",
        rapportData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRapportBudgetaire(id, rapportData) {
    try {
      const response = await api.put(
        `/api/rapportsbudgetaires/${id}`,
        rapportData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteRapportBudgetaire(id) {
    try {
      const response = await api.delete(`/api/rapportsbudgetaires/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateComparisonReport(comparisonData) {
    try {
      const response = await api.post(
        "/api/rapportsbudgetaires/generate-comparison",
        comparisonData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPerformanceByZone(params = {}) {
    try {
      const response = await api.get(
        "/api/rapportsbudgetaires/performance-by-zone",
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMonthlyTrends(params = {}) {
    try {
      const response = await api.get(
        "/api/rapportsbudgetaires/monthly-trends",
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchRapportsBudgetaires(params = {}) {
    try {
      const response = await api.get("/api/rapportsbudgetaires/search", {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data?.message || "Une erreur est survenue",
        errors: error.response.data?.errors,
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        message: "Impossible de contacter le serveur",
        errors: null,
        status: 0,
      };
    } else {
      return {
        message: error.message || "Une erreur inattendue est survenue",
        errors: null,
        status: 0,
      };
    }
  }
}

export default new ApiClient();
