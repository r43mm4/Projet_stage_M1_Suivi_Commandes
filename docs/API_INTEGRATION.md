# API INTEGRATION - Guide Simplifié

**Projet** : R_Corp Solutions - Portail Client  
**Version** : 1.0  
**Auteur** : WAFFO FOTSO Raoul Emmanu

---

## Vue d'ensemble

Ce document explique comment le portail web communique avec Salesforce pour afficher les commandes clients en temps réel.

### Principe de base

Le portail web interroge directement Salesforce via son API REST. Pas de base de données intermédiaire = données toujours à jour.

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │ ──────► │  Portail Web │ ──────► │  Salesforce │
│ (Navigateur)│ ◄────── │   (Node.js)  │ ◄────── │     CRM     │
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## Authentification OAuth2

### Qu'est-ce qu'OAuth2 ?

**OAuth2** permet au portail d'accéder aux données Salesforce sans que le client partage son mot de passe.

### Étapes d'authentification

1. **Client clique sur "Se connecter"**
2. **Redirection vers Salesforce** pour saisir identifiants
3. **Salesforce valide** et génère un code temporaire
4. **Le portail échange ce code** contre un token d'accès
5. **Le token est utilisé** pour toutes les requêtes API

**Durée du token** : 2 heures (renouvelé automatiquement)

### Configuration nécessaire dans Salesforce

```
Setup → Apps → App Manager → New Connected App

Informations essentielles :
- Nom : R_Corp Portail Client
- URL de retour : http://localhost:3000/oauth/callback
- Permissions : Accès API + Rafraîchissement token
```

---

## Requêtes API

### Endpoint principal

```
https://votre-instance.salesforce.com/services/data/v58.0/
```

### Exemple 1 : Récupérer les commandes d'un client

**Requête**

```
GET /services/data/v58.0/query?q=
SELECT Id, OrderNumber__c, Status__c, Amount__c
FROM Cmd__c
WHERE Client__r.Email__c = 'client@exemple.fr'
```

**Réponse** (format JSON)

```json
{
  "records": [
    {
      "Id": "a015g00000XYZ789",
      "OrderNumber__c": "CMD-2025-00042",
      "Status__c": "Expédié",
      "Amount__c": 12500.0
    }
  ]
}
```

### Exemple 2 : Récupérer le détail d'une commande

**Requête**

```
GET /services/data/v58.0/sobjects/Cmd__c/a015g00000XYZ789
```

**Réponse**

```json
{
  "OrderNumber__c": "CMD-2025-00042",
  "Status__c": "Expédié",
  "Amount__c": 12500.0,
  "OrderDate__c": "2025-10-15",
  "Client__c": "a025g00000ABC123"
}
```

---

## 🛡️ Sécurité

### Mesures en place

**HTTPS obligatoire** - Toutes les communications sont chiffrées  
**Tokens temporaires** - Expirent après 2h  
✅ **Secrets protégés** - Stockés dans variables d'environnement  
**Validation des données** - Protection contre les injections

### Limites Salesforce

| Limite               | Valeur   | Usage projet        |
| -------------------- | -------- | ------------------- |
| Requêtes API / jour  | 15 000   | ~500                |
| Durée token          | 2 heures | Renouvellement auto |
| Requêtes simultanées | 25       | < 5                 |

---

## Code Backend (Simplifié)

### Service Salesforce

```javascript
class SalesforceService {
  // 1. Obtenir un token d'accès
  async getAccessToken(authCode) {
    const response = await fetch(
      "https://login.salesforce.com/services/oauth2/token",
      {
        method: "POST",
        body: {
          grant_type: "authorization_code",
          code: authCode,
          client_id: process.env.SF_CLIENT_ID,
          client_secret: process.env.SF_CLIENT_SECRET,
        },
      }
    );
    return response.json(); // { access_token, refresh_token, instance_url }
  }

  // 2. Exécuter une requête
  async query(soql, accessToken) {
    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/query?q=${soql}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  }
}
```

---

## Gestion des erreurs

### Erreurs courantes

| Code | Erreur                  | Solution                   |
| ---- | ----------------------- | -------------------------- |
| 401  | Token expiré            | Rafraîchir automatiquement |
| 400  | Requête incorrecte      | Vérifier la syntaxe SOQL   |
| 404  | Donnée introuvable      | Vérifier l'ID              |
| 503  | Salesforce indisponible | Réessayer après 30s        |

---

## Points clés à retenir

1. **API REST** : Communication standard entre portail et Salesforce
2. **OAuth2** : Authentification sécurisée sans partage de mot de passe
3. **Temps réel** : Données toujours à jour (pas de synchronisation)
4. **Sécurisé** : HTTPS, tokens temporaires, validation des données
5. **Gratuit** : Inclus dans Salesforce Developer Edition

---

## Ressources

- [Documentation Salesforce REST API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [Guide OAuth2](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_flows.htm)

---
