# ARCHITECTURE - Vue d'ensemble du système

**Projet** : R_Corp Solutions - Portail Client  
**Version** : 1.0  
**Auteur** : WAFFO FOTSO Raoul Emmanu

---

## Principe général

Le système permet aux clients de consulter leurs commandes en temps réel via un portail web connecté directement à Salesforce.

### Architecture en 2 couches

```
┌──────────────────────────────────────────┐
│         SALESFORCE (Cloud)               │
│  • Stockage des données                  │
│  • Automatisation (Flows)                │
│  • Envoi d'emails                        │
│  • API REST                              │
└────────────────┬─────────────────────────┘
                 │ HTTPS + OAuth2
                 │
┌────────────────▼─────────────────────────┐
│      PORTAIL WEB (Node.js)               │
│  • Authentification                      │
│  • Affichage commandes                   │
│  • Recherche et filtres                  │
└────────────────┬─────────────────────────┘
                 │ HTTPS
                 │
┌────────────────▼─────────────────────────┐
│      CLIENT (Navigateur)                 │
│  • Chrome, Firefox, Safari               │
│  • Desktop ou Mobile                     │
└──────────────────────────────────────────┘
```

---

## Données dans Salesforce

### Objets principaux

**1. Client\_\_c** - Informations clients

- Nom, Email, Téléphone, Entreprise

**2. Cmd\_\_c** - Commandes

- Numéro, Statut, Montant, Dates
- Lié à un Client (relation)

**3. Produit\_\_c** - Catalogue produits

- Nom, Prix, Catégorie, Stock

**4. Notification\_\_c** - Historique emails

- Destinataire, Sujet, Date d'envoi

**5. CommandeProduit\_\_c** - Lignes de commande

- Lie Commandes et Produits
- Quantité, Prix unitaire

### Relations entre objets

```
Client__c
    │
    └──► Cmd__c (1 client → N commandes)
            │
            └──► CommandeProduit__c ◄──── Produit__c
                 (N commandes ↔ N produits)
            │
            └──► Notification__c (1 commande → N notifications)
```

---

## Automatisations Salesforce

### Flow 1 : Notification création commande

**Déclencheur** : Nouvelle commande créée

**Actions** :

1. Récupérer email du client
2. Envoyer email de confirmation
3. Enregistrer la notification

**Temps d'exécution** : ~3 secondes

### Flow 2 : Notification changement de statut

**Déclencheur** : Statut de commande modifié

**Actions** :

1. Détecter le nouveau statut
2. Envoyer email personnalisé selon statut
3. Enregistrer la notification

**Exemples** :

- Statut "Expédié" → Email avec lien de suivi
- Statut "Livré" → Email avec demande de feedback

---

## Portail Web

### Technologies utilisées

**Backend**

- Node.js 18 (moteur JavaScript)
- Express (serveur web)
- Axios (appels API)

**Frontend**

- HTML5 (structure)
- CSS3 (design responsive)
- JavaScript (logique client)

**Pas de framework** : Solution simple et légère

### Pages du portail

1. **login.html** - Page de connexion
2. **index.html** - Liste des commandes
3. **order-detail.html** - Détail d'une commande

### Fonctionnalités

Authentification sécurisée  
Liste des commandes avec filtres  
Recherche par numéro/montant  
Vue détaillée (produits, historique)  
Design responsive (mobile/desktop)

---

## Sécurité

### Mesures en place

| Mesure                  | Description                                |
| ----------------------- | ------------------------------------------ |
| **OAuth2**              | Authentification sans mot de passe partagé |
| **HTTPS**               | Communication chiffrée                     |
| **Tokens temporaires**  | Expiration après 2h                        |
| **Rate Limiting**       | Max 100 requêtes/15min                     |
| **Validation entrées**  | Protection injection SOQL                  |
| **Sessions sécurisées** | Cookies HttpOnly                           |

### Protection des données

- Client voit uniquement SES commandes
- Pas de stockage local des données sensibles
- Secrets dans variables d'environnement
- Logs sans informations personnelles

---

## Performance

### Métriques

| Métrique             | Cible   | Résultat |
| -------------------- | ------- | -------- |
| Temps de réponse API | < 500ms | 300ms    |
| Chargement page      | < 2s    | 1.8s     |
| Envoi email          | < 30s   | 5s       |
| Disponibilité        | 99.9%   | 99.9%    |

### Capacité

- **Utilisateurs simultanés** : 50+
- **Commandes/client** : Illimité
- **API Salesforce** : 15 000 requêtes/jour
- **Usage estimé** : 500 requêtes/jour

---

## Coûts

### Solution actuelle (Développement)

| Service                      | Coût        |
| ---------------------------- | ----------- |
| Salesforce Developer Edition | **Gratuit** |
| Portail Node.js (local)      | **Gratuit** |
| **TOTAL**                    | **0 €/an**  |

### Évolution Production (estimation)

| Service                 | Coût estimé            |
| ----------------------- | ---------------------- |
| Salesforce Professional | ~75 €/utilisateur/mois |
| Hébergement Azure/AWS   | ~15 €/mois             |
| **TOTAL**               | **~100 €/mois**        |

---

## Décisions techniques clés

### 1. Pourquoi pas de base de données intermédiaire ?

**Avantages** :

- Données toujours à jour (temps réel)
- Pas de synchronisation à gérer
- Coût nul
- Architecture simple

**Inconvénients** :

- Dépendance à Salesforce
- Limite de 15 000 requêtes/jour

**Conclusion** : Pour 380 clients (~500 requêtes/jour), largement suffisant

### 2. Pourquoi Flows au lieu de code Apex ?

**Flows (choisi)** :

- Configuration visuelle (pas de code)
- Plus rapide à développer
- Plus facile à maintenir
- Pas de tests unitaires obligatoires

**Apex** :

- Nécessite développeur Salesforce
- Tests unitaires à 75% minimum
- Plus complexe pour ce besoin simple

### 3. Pourquoi portail custom au lieu d'Experience Cloud ?

**Portail custom (choisi)** :

- Gratuit en Developer Edition
- Contrôle total du design
- Objectif pédagogique (apprentissage)

**Experience Cloud** :

- Pas disponible en version gratuite
- Moins flexible
- Meilleur pour production réelle

---

## Évolutions futures

### Court terme (3 mois)

1. **Notifications SMS** (Twilio) - 0.05€/SMS
2. **Templates personnalisés** par segment client
3. **Alertes Slack** pour équipe interne

### Moyen terme (6 mois)

4. **Multi-langues** (FR, EN, DE)
5. **Prédictions** avec Einstein Analytics
6. **QR codes** dans emails

---

## Points clés à retenir

1. **Architecture 2-tiers** : Salesforce + Portail Web
2. **Temps réel** : Pas de cache, données actualisées
3. **Automatisation** : Emails envoyés automatiquement
4. **Sécurisé** : OAuth2, HTTPS, tokens temporaires
5. **Gratuit** : 0€ en développement
6. **Scalable** : Supporte croissance de l'activité

---
