# 🍽️ Système de Demandes de Menus - Guide d'Implémentation Frontend

## 📋 Vue d'Ensemble

Le nouveau système de demandes de menus transforme la gestion traditionnelle des articles en un workflow collaboratif entre **Administrateurs/Managers** et **Fournisseurs**. Ce système permet une gestion plus efficace et transparente des demandes de menus pour les vols.

## 🎭 Rôles et Interfaces

### 👨‍💼 **Administrateur/Manager**

**Interface principale :** Dashboard avec 3 nouveaux modules

1. **📋 Demandes de Menus** (`/dashboard/demandes`)

   - Création de nouvelles demandes
   - Assignation aux fournisseurs
   - Suivi des réponses
   - Acceptation/rejet des propositions

2. **🏪 Gestion Fournisseurs** (`/dashboard/fournisseurs`)

   - Création de comptes fournisseurs
   - Vérification des fournisseurs
   - Gestion des informations

3. **✈️ Affectation Menus Vols** (`/dashboard/vol-menus`)
   - Assignation de menus acceptés aux vols
   - Génération automatique des BCP
   - Statistiques par vol

### 🏪 **Fournisseur**

**Interface dédiée :** Dashboard fournisseur (`/dashboard/fournisseur`)

- Vue des demandes assignées
- Réponse avec propositions de menus
- Suivi du statut des propositions
- Métriques de performance

## 🚀 Composants Créés

### 1. **DemandesManagement**

```javascript
// Localisation: src/components/DemandesManagement/
// Fonctionnalités:
- ✅ Création/édition de demandes
- ✅ Filtres par statut, type
- ✅ Assignation aux fournisseurs
- ✅ Visualisation des réponses
- ✅ Acceptation des propositions
- ✅ Statistiques en temps réel
```

### 2. **FournisseursManagement**

```javascript
// Localisation: src/components/FournisseursManagement/
// Fonctionnalités:
- ✅ Création automatique de comptes utilisateur
- ✅ Gestion des informations entreprise
- ✅ Vérification des fournisseurs
- ✅ Visualisation des spécialités
- ✅ Statistiques des fournisseurs
```

### 3. **FournisseurDashboard**

```javascript
// Localisation: src/components/FournisseurDashboard/
// Fonctionnalités:
- ✅ Vue des demandes assignées
- ✅ Formulaire de réponse détaillé
- ✅ Suivi des acceptations
- ✅ Métriques de performance
- ✅ Actions rapides
```

### 4. **VolMenusManagement**

```javascript
// Localisation: src/components/VolMenusManagement/
// Fonctionnalités:
- ✅ Sélection de vol
- ✅ Assignation de menus par type de passager
- ✅ Génération automatique de BCP
- ✅ Statistiques des coûts
- ✅ Gestion des désassignations
```

## 🔄 Workflow Complet Implémenté

### 1️⃣ **Création d'une Demande**

```javascript
// Interface: DemandesManagement
// Champs disponibles:
- titre: "Menu Vol Paris-Londres"
- description: "Menu pour vol court courrier"
- type: "MenuComplet" | "Menu" | "Plat"
- dateLimite: Date/heure limite
- demandePlats: Array de plats souhaités
- commentairesAdmin: Instructions spéciales
```

### 2️⃣ **Assignation à un Fournisseur**

```javascript
// Processus automatisé:
1. Admin sélectionne une demande "En Attente"
2. Choisit un fournisseur vérifié
3. Ajoute commentaires et date limite
4. Statut passe à "En Cours"
5. Notification au fournisseur (à implémenter côté backend)
```

### 3️⃣ **Réponse du Fournisseur**

```javascript
// Interface: FournisseurDashboard
// Formulaire de réponse:
- menuProposedId: Menu existant du fournisseur
- nomMenuPropose: Nom personnalisé
- descriptionMenuPropose: Description détaillée
- prixTotal: Prix proposé
- commentairesFournisseur: Notes additionnelles
```

### 4️⃣ **Acceptation de la Proposition**

```javascript
// Interface: DemandesManagement > Modal Réponses
// Actions disponibles:
- Visualisation détaillée des propositions
- Acceptation avec commentaire optionnel
- Statut passe à "Complétée"
- Menu devient disponible pour assignation aux vols
```

### 5️⃣ **Affectation de Menu au Vol**

```javascript
// Interface: VolMenusManagement
// Processus:
1. Sélection du vol
2. Choix du menu accepté
3. Sélection du type de passager (Economy/Business/First)
4. Ajout de commentaires
5. Menu assigné au vol
```

### 6️⃣ **Génération Automatique du BCP**

```javascript
// Interface: VolMenusManagement
// Fonctionnalités:
- Calcul automatique des quantités
- Répartition par type de passager
- Génération du BCP complet
- Numérotation automatique
```

## 📊 Fonctionnalités Avancées

### **Statistiques en Temps Réel**

```javascript
// DemandesManagement:
- Total demandes, En attente, En cours, Complétées

// FournisseursManagement:
- Total fournisseurs, Vérifiés, En attente, Nouveaux ce mois

// FournisseurDashboard:
- Demandes assignées, En cours, Réponses envoyées, Acceptées
- Taux d'acceptation et de réponse

// VolMenusManagement:
- Menus assignés, Articles total, Coût estimé par vol
```

### **Filtres et Recherche**

```javascript
// Tous les composants incluent:
- Recherche textuelle
- Filtres par statut
- Filtres par type/catégorie
- Tri par colonnes
```

### **Interface Responsive**

```javascript
// Design adaptatif pour:
- Desktop: Grilles multi-colonnes
- Tablette: Colonnes adaptées
- Mobile: Vue empilée, boutons optimisés
```

## 🔐 Sécurité et Autorisations

### **Contrôle d'Accès par Rôle**

```javascript
// Administrator/Manager uniquement:
- /dashboard/demandes
- /dashboard/fournisseurs
- /dashboard/vol-menus

// Fournisseur uniquement:
- /dashboard/fournisseur

// Vérifications côté frontend:
- ProtectedRoute avec requiredRoles
- Masquage conditionnel des éléments UI
```

## 🎨 Design System

### **Composants Réutilisés**

```javascript
// Shared Components utilisés:
- DataTable: Affichage des données tabulaires
- Modal: Fenêtres modales pour les formulaires
- Form: Formulaires dynamiques
- StatusBadge: Badges de statut colorés
- ConfirmationModal: Confirmations d'actions
```

### **Thème Cohérent**

```css
/* Couleurs principales: */
- Primary: #007bff (bleu)
- Success: #28a745 (vert)
- Warning: #ffc107 (jaune)
- Danger: #dc3545 (rouge)
- Info: #17a2b8 (cyan)

/* Icons utilisées: */
- 📋 Demandes
- 🏪 Fournisseurs
- ✈️ Vols
- 🍽️ Menus
- 💬 Réponses
- ✅ Accepté
- ⏳ En attente
```

## 🛠️ API Endpoints Intégrés

### **Demandes**

```javascript
// Tous les endpoints sont intégrés dans apiClient:
-getDemandes(filters) -
  createDemande(demandeData) -
  assignDemandeToFournisseur(id, assignData) -
  acceptDemandeReponse(reponseId, commentaire);
```

### **Fournisseurs**

```javascript
-getFournisseurs(filters) -
  createFournisseur(fournisseurData) -
  verifyFournisseur(id) -
  getMesDemandesAssignees(filters) -
  repondreADemande(demandeId, reponseData);
```

### **Vol Menus**

```javascript
-getAvailableMenusForVol(volId) -
  assignMenuToVol(volId, menuId, assignData) -
  getVolMenus(volId) -
  generateBCPFromMenus(volId) -
  getMenuStatisticsForVol(volId);
```

## 🚀 Démarrage et Tests

### **1. Accès Admin**

```bash
# Se connecter en tant qu'Admin/Manager
# Naviguer vers /dashboard/fournisseurs
# Créer un premier fournisseur
```

### **2. Test du Workflow**

```bash
# 1. Créer une demande (/dashboard/demandes)
# 2. L'assigner au fournisseur créé
# 3. Se connecter comme fournisseur (/dashboard/fournisseur)
# 4. Répondre à la demande
# 5. Retour admin: accepter la proposition
# 6. Affecter le menu à un vol (/dashboard/vol-menus)
# 7. Générer le BCP automatiquement
```

### **3. Données de Test**

```javascript
// Exemple de demande:
{
  titre: "Menu Vol AF1234 Paris-New York",
  description: "Menu Business Class pour vol long courrier",
  type: "MenuComplet",
  dateLimite: "2025-09-20T12:00:00Z",
  demandePlats: [
    {
      nomPlatSouhaite: "Plateau repas Business",
      typePlat: "Repas",
      prixMaximal: 25.0,
      quantiteEstimee: 50,
      isObligatoire: true
    }
  ]
}

// Exemple de fournisseur:
{
  userEmail: "contact@newrest.com",
  userFirstName: "Jean",
  userLastName: "Dupont",
  companyName: "NewRest Catering",
  address: "123 Rue de la Restauration, 75001 Paris",
  phone: "+33123456789",
  specialites: "Restauration aérienne, menus bio, cuisine internationale"
}
```

## 🔧 Personnalisations Possibles

### **Champs Additionnels**

```javascript
// Facile d'ajouter des champs aux formulaires:
// Dans les *FormFields arrays de chaque composant

// Exemple - ajouter un champ budget à DemandesManagement:
{
  name: "budgetMaximal",
  label: "Budget maximal (€)",
  type: "number",
  step: "0.01"
}
```

### **Nouveaux Statuts**

```javascript
// Modifier les StatusBadge mappings:
const statusMap = {
  EnAttente: { status: "warning", text: "En Attente" },
  EnCours: { status: "info", text: "En Cours" },
  Completee: { status: "success", text: "Complétée" },
  Annulee: { status: "danger", text: "Annulée" },
  // Ajouter nouveaux statuts ici
};
```

### **Filtres Supplémentaires**

```javascript
// Ajouter dans la section filters de chaque composant:
<div className="filter-group">
  <label>Nouveau Filtre</label>
  <select
    value={filters.nouveauFiltre}
    onChange={(e) => handleFilterChange("nouveauFiltre", e.target.value)}
  >
    <option value="">Toutes les options</option>
    <option value="option1">Option 1</option>
  </select>
</div>
```

## 📈 Métriques et Analytics

### **KPIs Implémentés**

```javascript
// Disponibles dans chaque interface:
- Taux de réponse des fournisseurs
- Temps moyen de traitement des demandes
- Coût moyen par vol
- Répartition des demandes par type
- Performance des fournisseurs
```

## 🎯 Prochaines Étapes

### **Fonctionnalités à Développer**

```javascript
// Côté Backend (à implémenter):
1. Notifications en temps réel
2. Historique des modifications
3. Templates de demandes
4. Système de notation des fournisseurs
5. Export des rapports

// Côté Frontend (extensions possibles):
1. Graphiques et charts
2. Calendrier de planification
3. Chat intégré fournisseur-admin
4. Upload de fichiers (images menus, documents)
5. Mode hors-ligne
```

---

## 🎉 **Le système est maintenant entièrement opérationnel !**

**Tous les composants sont créés, routés et intégrés. Le workflow complet de demandes de menus est fonctionnel et prêt pour les tests avec l'API backend.**

### **Navigation rapide :**

- **Admin/Manager :** Dashboard → Demandes de Menus / Gestion Fournisseurs / Affectation Menus Vols
- **Fournisseur :** Dashboard → Mes Demandes

**Le système respecte entièrement les spécifications fournies et offre une interface utilisateur moderne, intuitive et responsive ! 🚀**

