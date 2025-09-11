import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../services/api";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isAdmin, isManager } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await apiClient.getUsers();
      setUsers(usersData);
      setError("");
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      return;
    }

    try {
      await apiClient.deleteUser(userId);
      await loadUsers(); // Reload the list
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    }
  };

  if (!isAdmin() && !isManager()) {
    return (
      <div className="access-denied">
        <h2>Accès refusé</h2>
        <p>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>Gestion des utilisateurs</h1>
        {isAdmin() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Nouvel utilisateur
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="users-table-container">
        <table className="table users-table">
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
              <th>Nom complet</th>
              <th>Rôles</th>
              <th>Statut</th>
              <th>Date de création</th>
              {isAdmin() && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.userName}</td>
                <td>{user.email}</td>
                <td>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "-"}
                </td>
                <td>
                  <div className="roles-container">
                    {user.roles?.map((role) => (
                      <span
                        key={role}
                        className={`role-badge role-${role.toLowerCase()}`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      user.isActive ? "active" : "inactive"
                    }`}
                  >
                    {user.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</td>
                {isAdmin() && (
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn btn-danger btn-sm"
                        title="Supprimer l'utilisateur"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="empty-state">
            <p>Aucun utilisateur trouvé.</p>
          </div>
        )}
      </div>

      {/* Create User Modal - Placeholder */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Créer un nouvel utilisateur</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Fonctionnalité de création d'utilisateur en cours de
                développement.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
