Parfait, voici une **version réécrite de ton `README.md` propre, professionnelle et conforme aux conventions standards Open Source** (structure claire, titres normalisés, avertissements sécurité, cohérence technique) 👇
Tu peux la copier-coller directement dans ton projet.

---

```md
# Portail Client DigiInfo Solutions

Portail web de consultation des commandes destiné aux clients B2B de **DigiInfo Solutions**, avec intégration complète du CRM **Salesforce** via API REST.

---

## ✨ Fonctionnalités

- Authentification via OAuth2 Salesforce
- Consultation des commandes clients
- Recherche et filtres par statut
- Statistiques des commandes
- Détail des commandes (produits, notifications)
- Déconnexion sécurisée

---

## 🏗️ Architecture
```

Backend : Node.js + Express
CRM : Salesforce (API REST v58.0)
Base de données : Azure SQL Database (optionnelle)
Authentification : OAuth2 Salesforce

````

---

## ✅ Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0
- Compte Salesforce Developer Edition
- Connected App Salesforce configurée
- Base de données Azure SQL (optionnel)

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/r43mm4/Projet_stage_M1_Suivi_Commandes.git
cd Projet_stage_M1_Suivi_Commandes
````

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d’environnement

Le fichier `.env` contient les variables nécessaires à la connexion Salesforce.

```bash
cat .env
```

Variables principales :

- `SF_CLIENT_ID` : Consumer Key de la Connected App
- `SF_CLIENT_SECRET` : Consumer Secret
- `SF_INSTANCE_URL` : URL de l’instance Salesforce
- `PORT` : Port du serveur (par défaut : 3000)

⚠️ **Ne jamais versionner le fichier `.env` en environnement de production.**

---

### 4. Démarrer le serveur

#### Mode développement

```bash
npm run dev
```

#### Mode production

```bash
npm start
```

Application disponible sur :

```
http://localhost:3000
```

---

## 🗂️ Structure du projet

```
projet_stage_m1_suivi_commandes/
├── src/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   └── commandes.js
│   ├── services/
│   │   └── salesforce.service.js
│   └── server.js
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   ├── index.html
│   ├── login.html
│   └── order-detail.html
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentification

| Méthode | Route            | Description                         |
| ------- | ---------------- | ----------------------------------- |
| GET     | /oauth/authorize | Redirection vers Salesforce OAuth   |
| GET     | /oauth/callback  | Retour OAuth après authentification |
| POST    | /logout          | Déconnexion utilisateur             |
| GET     | /auth/status     | Vérification statut utilisateur     |

### Client

| Méthode | Route       | Description                  |
| ------- | ----------- | ---------------------------- |
| GET     | /api/client | Informations client connecté |

### Commandes

| Méthode | Route             | Description           |
| ------- | ----------------- | --------------------- |
| GET     | /api/orders       | Liste des commandes   |
| GET     | /api/orders/:id   | Détail d’une commande |
| GET     | /api/orders/stats | Statistiques globales |

---

## 👤 Utilisation

### 1. Connexion

1. Accéder à `http://localhost:3000`
2. Cliquer sur **Se connecter**
3. S’authentifier via Salesforce

### 2. Consultation

Une fois connecté :

- Liste des commandes
- Filtres par statut
- Recherche
- Accès au détail d’une commande

### 3. Déconnexion

Bouton **Déconnexion** disponible dans l’interface.

---

## 🔐 Sécurité

### Mesures mises en place

- **Helmet** : sécurisation des en-têtes HTTP
- **Rate Limiting** : 100 requêtes / 15 min / IP
- **Sessions sécurisées** : cookies HttpOnly
- **OAuth2 Salesforce**
- **HTTPS obligatoire en production**
- **Protection SOQL Injection** via validation des entrées

### Gestion des secrets

> En production, utiliser un gestionnaire de secrets :

- Azure Key Vault
- AWS Secrets Manager

---

## 🧪 Tests

```bash
npm test
```

```bash
npm test -- --coverage
```

---

## ☁️ Déploiement

### Azure App Service

1. Créer un App Service
2. Ajouter les variables d’environnement
3. Déployer via Git ou GitHub Actions

```bash
az webapp up --name stagedigiinfo --resource-group stageDigiInfo
```

---

## 🛠️ Dépannage

### Session expirée

Le token Salesforce expire automatiquement après 2h.
Le middleware `autoRefreshToken` gère le rafraîchissement.

### Erreur SOQL

Vérifier :

1. Les noms des champs Salesforce
2. Les permissions des objets
3. La syntaxe de la requête

### Port déjà utilisé

Modifier le port dans `.env` :

```env
PORT=8080
```

---

## 📚 Documentation complémentaire

- `API_INTEGRATION.md`
- `FLOWS_DOCUMENTATION.md`
- `SALESFORCE_CONFIG.md`
- `ARCHITECTURE.md`

---

## 📞 Support

- 📧 Email : [raoulemma1999@gmail.com](mailto:raoulemma1999@gmail.com)
- 🐞 Issues : [https://github.com/r43mm4/Projet_stage_M1_Suivi_Commandes/issues](https://github.com/r43mm4/Projet_stage_M1_Suivi_Commandes/issues)

---

## 📄 Licence

ISC License — Raoul WAFFO

---

## 🎓 Contexte académique

**Projet académique** — MSc1 Informatique & Management
IONIS School of Technology and Management
Tuteur : Joly DONFACK
Période : 5 septembre – 28 novembre 2025

```

```
