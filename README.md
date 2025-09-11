# 🛫 GSC Frontend - Système de Gestion de la Sous-traitance du Catering

## 📋 Vue d'ensemble

Interface React moderne pour le système GSC (Gestion de la Sous-traitance du Catering) de Tunisair. Cette application frontend communique avec l'API GSC pour gérer l'ensemble du workflow de catering des vols, depuis la programmation jusqu'aux rapports budgétaires.

## ✨ Fonctionnalités Principales

### 🔐 Authentification et Autorisation

- Connexion sécurisée avec JWT
- Authentification Google OAuth
- Gestion des rôles (Administrator, Manager, User, Viewer)
- Vérification d'email et récupération de mot de passe

### 🛫 Gestion des Vols

- CRUD complet des vols
- Recherche et filtrage avancés
- Gestion des informations de vol (origine, destination, passagers, etc.)
- Interface intuitive avec validation des données

### 🍽️ Gestion des Menus

- Création et modification des menus par classe de service
- Gestion des articles de menu avec quantités
- Filtrage par saison, zone géographique et type de passager
- Calcul automatique des prix totaux

### 📦 Gestion des Articles

- Catalogue complet des articles de catering
- Gestion des types (Repas, Boisson, Matériel, etc.)
- Suivi des fournisseurs et prix unitaires
- Statistiques en temps réel

### 🏗️ Modules à Venir

- **Plans d'Hébergement** - Association articles/menus aux vols
- **BCP (Bons de Commande Prévisionnels)** - Génération automatique
- **BL (Bons de Livraison)** - Validation et rapprochement
- **Gestion des Écarts** - Détection et résolution automatiques
- **Boîtes Médicales** - Suivi des expirations et assignations
- **Dossiers de Vol** - Consolidation documentaire
- **Rapports Budgétaires** - Analytics et tendances

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+ et npm
- Accès à l'API GSC Backend

### Installation

```bash
# Cloner le repository
git clone [your-repo-url]
cd GSC.API-Frontend-main

# Installer les dépendances
npm install
```

### Configuration

Créer un fichier `.env` à la racine :

```env
REACT_APP_API_BASE_URL=http://localhost:5114
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Démarrage

```bash
# Mode développement
npm start

# Construction pour production
npm run build
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Architecture

### Structure du Projet

```
src/
├── components/
│   ├── Shared/              # Composants réutilisables
│   │   ├── DataTable/       # Table de données avec tri/pagination
│   │   ├── Modal/           # Modales et confirmations
│   │   ├── Form/            # Formulaires avec validation
│   │   └── StatusBadge/     # Badges de statut
│   ├── FlightManagement/    # Gestion des vols
│   ├── MenuManagement/      # Gestion des menus
│   ├── ArticleManagement/   # Gestion des articles
│   ├── Dashboard/           # Tableau de bord principal
│   └── Auth/                # Composants d'authentification
├── contexts/
│   └── AuthContext.js       # Contexte d'authentification
├── services/
│   └── api.js              # Client API avec tous les endpoints
└── styles/
    └── global.css          # Styles globaux
```

### Technologies Utilisées

- **React 18** - Framework frontend
- **React Router 6** - Navigation SPA
- **Axios** - Client HTTP pour API
- **CSS Modules** - Styles componentisés
- **React Context** - Gestion d'état globale
- **Date-fns** - Manipulation des dates
- **Recharts** - Graphiques et visualisations

## 🔌 API Integration

Le frontend communique avec l'API GSC via un client Axios centralisé (`services/api.js`) qui inclut :

### Endpoints Implémentés

- **Authentification** - Login, register, refresh token
- **Vols** - CRUD complet avec recherche
- **Menus** - Gestion des menus et items
- **Articles** - Catalogue des produits
- **BCP/BL** - Bons de commande et livraison
- **Écarts** - Gestion des discordances
- **Boîtes Médicales** - Suivi médical
- **Dossiers de Vol** - Documentation
- **Rapports** - Analytics budgétaires

### Fonctionnalités du Client API

- Intercepteurs pour authentification automatique
- Gestion centralisée des erreurs
- Retry automatique et timeout
- Support complet des endpoints GSC

## 🎨 Design System

### Composants Partagés

- **DataTable** - Table responsive avec tri, pagination, recherche
- **Modal** - Modales configurables avec animations
- **Form** - Formulaires avec validation automatique
- **StatusBadge** - Badges de statut contextuels

### Couleurs et Thème

- **Primaire** - Bleu Tunisair (#007bff)
- **Secondaire** - Gris moderne (#6c757d)
- **Succès** - Vert (#28a745)
- **Attention** - Orange (#ffc107)
- **Danger** - Rouge (#dc3545)

### Responsive Design

- Mobile-first approach
- Breakpoints : 480px, 768px, 1200px
- Interface adaptative pour tous écrans

## 🔒 Sécurité

### Authentification

- JWT tokens sécurisés
- Refresh token automatique
- Session timeout configurable
- Protection CSRF

### Autorisation

- Contrôle d'accès basé sur les rôles
- Routes protégées par composant
- Permissions granulaires par fonctionnalité

## 📱 Fonctionnalités UX

### Interface Utilisateur

- Navigation intuitive avec sidebar collapsible
- Recherche en temps réel
- Filtres avancés sauvegardés
- Actions en lot pour efficacité

### Performance

- Lazy loading des composants
- Pagination optimisée
- Cache intelligent des données
- Debounced search

### Accessibilité

- Support clavier complet
- ARIA labels appropriés
- Contraste conforme WCAG
- Navigation screen reader

## 🧪 Tests et Qualité

### Tests Prévus

- Tests unitaires avec Jest/React Testing Library
- Tests d'intégration API
- Tests E2E avec Cypress
- Tests de performance

### Standards de Code

- ESLint configuration stricte
- Prettier pour formatage
- Husky pre-commit hooks
- Documentation JSDoc

## 🚀 Déploiement

### Environnements

- **Développement** - `npm start`
- **Test** - Build optimisé avec source maps
- **Production** - Build minifié et optimisé

### CI/CD Pipeline

- Build automatique sur push
- Tests automatisés
- Déploiement automatique
- Monitoring des performances

## 📈 Roadmap

### Phase 1 ✅ (Complétée)

- [x] Architecture de base et authentification
- [x] Composants partagés réutilisables
- [x] Gestion des vols complète
- [x] Système de menus avec articles
- [x] Catalogue d'articles avec statistiques

### Phase 2 🚧 (En cours)

- [ ] Plans d'hébergement avec associations
- [ ] Workflow BCP/BL complet
- [ ] Gestion des écarts automatisée
- [ ] Boîtes médicales avec alertes

### Phase 3 📋 (Planifiée)

- [ ] Dossiers de vol documentaires
- [ ] Rapports budgétaires avec graphiques
- [ ] Dashboard analytics avancé
- [ ] Intégration ERP externe

### Phase 4 🔮 (Future)

- [ ] Application mobile companion
- [ ] API temps réel avec WebSockets
- [ ] Intelligence artificielle prédictive
- [ ] Intégration IoT pour suivi matériel

## 🤝 Contribution

### Workflow de Développement

1. Fork du repository
2. Création d'une branche feature
3. Développement avec tests
4. Pull request avec description détaillée
5. Review et merge

### Standards de Commit

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactoring
test: ajout de tests
chore: maintenance
```

## 📞 Support

### Documentation

- Guide utilisateur intégré
- Documentation technique complète
- FAQ et troubleshooting
- Vidéos de démonstration

### Contact

- **Équipe Technique** - [email technique]
- **Support Utilisateur** - [email support]
- **Issues GitHub** - [lien repository]

---

## 🏆 Workflow GSC Complet

Le système GSC suit un workflow métier complet :

1. **📅 Programmation** - Import des vols depuis système externe
2. **🏠 Plans d'Hébergement** - Affectation automatique selon règles métier
3. **🍽️ Menus** - Conception et association aux plans
4. **📝 BCP** - Génération automatique des commandes
5. **🚚 Livraison** - Réception et validation des BL
6. **⚠️ Écarts** - Détection et traitement automatiques
7. **⚕️ Médical** - Affectation des boîtes médicales
8. **📁 Dossiers** - Consolidation documentaire
9. **📊 Rapports** - Analytics et pilotage
10. **💼 ERP** - Transfert vers système de gestion

**🎯 Objectif : Automatiser et optimiser l'ensemble de la chaîne de catering Tunisair**

---

_Développé avec ❤️ pour Tunisair - Système GSC v1.0.0_
