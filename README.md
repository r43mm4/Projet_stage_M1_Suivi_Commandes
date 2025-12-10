# Portail Client DigiInfo Solutions

Portail web de consultation des commandes pour les clients B2B de DigiInfo Solutions, intégré avec Salesforce CRM.

## Architecture

```
Backend: Node.js + Express
CRM: Salesforce (API REST v58.0)
Base de données: Azure SQL Database
Authentification: OAuth2 Salesforce
```

## Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0
- Compte Salesforce Developer Edition
- Connected App Salesforce configurée
- Base de données Azure SQL (optionnel)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/r43mm4/Projet_stage_M1_Suivi_Commandes.git
cd Projet_stage_M1_Suivi_Commandes
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Le fichier `.env` est déjà configuré avec les credentials Salesforce. Vérifier que toutes les variables sont correctes :

```bash
# Vérifier la configuration
cat .env
```

Variables principales :

- `SF_CLIENT_ID` : Consumer Key de la Connected App
- `SF_CLIENT_SECRET` : Consumer Secret
- `SF_INSTANCE_URL` : URL de l'instance Salesforce
- `PORT` : Port du serveur (3000 par défaut)

### 4. Démarrer le serveur

**Mode développement (avec rechargement automatique) :**

```bash
npm run dev
```

**Mode production :**

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## Structure du projet

```
projet_stage_m1_suivi_commandes/
├── src/
│   ├── middleware/
│   │   ├── auth.middleware.js      # Authentification et refresh token
│   │   └── errorHandler.js         # Gestion globale des erreurs
│   ├── routes/
│   │   ├── auth.js                 # Routes OAuth2
│   │   ├── clients.js              # Routes infos client
│   │   └── commandes.js            # Routes gestion commandes
│   ├── services/
│   │   └── salesforce.service.js   # Service API Salesforce
│   └── server.js                   # Point d'entrée serveur
├── public/
│   ├── css/
│   │   └── styles.css              # Styles globaux
│   ├── js/
│   │   └── app.js                  # Logique frontend
│   ├── index.html                  # Page liste commandes
│   ├── login.html                  # Page connexion
│   └── order-detail.html           # Page détail commande
├── .env                            # Variables environnement
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentification

- `GET /oauth/authorize` - Redirection vers Salesforce OAuth
- `GET /oauth/callback` - Callback OAuth après authentification
- `POST /logout` - Déconnexion utilisateur
- `GET /auth/status` - Vérifier statut authentification

### Client

- `GET /api/client` - Informations du client connecté

### Commandes

- `GET /api/orders` - Liste des commandes (avec filtres optionnels)
- `GET /api/orders/:id` - Détail d'une commande spécifique
- `GET /api/orders/stats` - Statistiques des commandes

## Utilisation

### 1. Connexion

1. Accéder à `http://localhost:3000`
2. Cliquer sur "Se connecter avec DigiInfo"
3. S'authentifier avec credentials Salesforce :
   - Email : `raoul-emmanu.waffo-fotso852@agentforce.com`
   - Mot de passe : voir `.env`

### 2. Consultation des commandes

Après connexion, l'utilisateur accède à :

- Liste de toutes ses commandes
- Filtres par statut
- Barre de recherche
- Détail de chaque commande (produits, notifications)

### 3. Déconnexion

Cliquer sur le bouton "Déconnexion" dans le header.

## Sécurité

### Mesures implémentées

- **Helmet** : Headers de sécurité HTTP
- **Rate Limiting** : 100 requêtes/15min par IP
- **Sessions sécurisées** : HttpOnly cookies
- **OAuth2** : Authentification déléguée Salesforce
- **HTTPS** : Obligatoire en production
- **SOQL Injection** : Validation des entrées

### Variables sensibles

Ne jamais committer le fichier `.env` en production. Utiliser des secrets managers (Azure Key Vault, AWS Secrets Manager).

## Tests

```bash
# Lancer les tests unitaires
npm test

# Avec couverture de code
npm test -- --coverage
```

## Déploiement

### Azure App Service

Le projet est configuré pour un déploiement sur Azure :

1. Créer un App Service
2. Configurer les variables d'environnement via le portail Azure
3. Déployer via Git ou GitHub Actions

```bash
# Déploiement manuel
az webapp up --name stagedigiinfo --resource-group stageDigiInfo
```

## Troubleshooting

### Erreur "Session expired"

L'access token Salesforce expire après 2h. Le middleware `autoRefreshToken` le renouvelle automatiquement. Si le refresh échoue, se reconnecter.

### Erreur "SOQL query failed"

Vérifier :

1. Les noms d'objets et champs Salesforce
2. Les permissions Field-Level Security
3. La syntaxe SOQL (pas de quotes autour des IDs)

### Port 3000 déjà utilisé

Changer le port dans `.env` :

```
PORT=8080
```

## Documentation complète

Consulter les fichiers de documentation dans le repository :

- `API_INTEGRATION.md` - Documentation API REST Salesforce
- `FLOWS_DOCUMENTATION.md` - Flows d'automatisation
- `SALESFORCE_CONFIG.md` - Configuration objets Salesforce
- `ARCHITECTURE.md` - Architecture système

## Support

Pour toute question :

- Email : raoulemma1999@gmail.com
- GitHub Issues : [Ouvrir un ticket](https://github.com/r43mm4/Projet_stage_M1_Suivi_Commandes/issues)

## Licence

ISC License - Raoul WAFFO

---

**Projet académique** - MSc1 Informatique & Management  
IONIS School of Technology and Management  
Tuteur : Joly DONFACK  
Période : 5 septembre - 28 novembre 2025
