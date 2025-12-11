# Guide de Test du Portail Web

**Projet** : R_Corp Solutions  
**Auteur** : WAFFO FOTSO Raoul Emmanu

---

## Prérequis

Avant de commencer les tests :

Node.js installé (v18+)  
Tous les fichiers créés dans les bons dossiers  
Fichier `.env` configuré  
Données de test dans Salesforce (≥ 1 client + 1 commande)

---

## ÉTAPE 1 : Vérifier la structure

Votre projet doit ressembler à ceci :

```
Projet_stage_M1_Suivi_Commandes/
│
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   ├── index.html
│   └── login.html
│
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
│
├── .env
└── package.json
```

---

## ÉTAPE 2 : Installer les dépendances

Ouvrir un **Terminal** dans VS Code :

```bash
npm install
```

**Attendez** l'installation (10-30 secondes)

**Succès si vous voyez** :

```
added 57 packages in 12s
```

---

## ÉTAPE 3 : Vérifier les noms de champs Salesforce

### Pourquoi c'est important ?

Les noms de champs dans le code **DOIVENT** correspondre exactement aux noms dans Salesforce.

### Comment vérifier ?

1. Aller dans **Salesforce**
2. Cliquer sur **Setup**
3. Chercher **"Object Manager"**
4. Cliquer sur **Cmd\_\_c**
5. Aller dans **"Fields & Relationships"**
6. Noter les **API Names** (colonne de droite)

### Exemple

| Ce que vous voyez | Ce qu'il faut utiliser  |
| ----------------- | ----------------------- |
| Montant (Label)   | `Montant__c` (API Name) |
| État              | `Etat__c`               |
| Date de commande  | `Date__c`               |

### Où modifier ?

Fichier : `src/services/salesforce.service.js` (ligne ~130)

```javascript
async recupererCommandesClient(emailClient) {
  const requete = `
    SELECT
      Id,
      Name,
      Montant__c,        ← Vérifier
      Etat__c,           ← Vérifier
      Date__c,           ← Vérifier
      Description__c
    FROM Cmd__c
    WHERE Clients__r.Email__c = '${emailClient}'
  `;
  return await this.executerRequeteSOQL(requete);
}
```

---

## ÉTAPE 4 : Démarrer le serveur

Dans le Terminal :

```bash
npm run dev
```

**Succès si vous voyez** :

```
Serveur démarré sur http://localhost:3000
Environnement : development

Pages disponibles :
   - http://localhost:3000/login.html
   - http://localhost:3000/index.html
```

**Erreur courante** :

```
Error: Cannot find module 'express'
→ Solution : npm install
```

---

## ÉTAPE 5 : Test de connexion Salesforce

Ouvrir un **nouveau terminal** (garder l'autre ouvert) :

```bash
node -e "require('./src/services/salesforce.service').obtenirAccessToken()"
```

**Succès** :

```
Connexion Salesforce réussie !
Token: 00D5g00000XXXXX...
```

**Erreur** :

```
Erreur : authentication failure
→ Solution : Vérifier SF_USERNAME et SF_PASSWORD dans .env
```

---

## ÉTAPE 6 : Test du portail web

### Test 1 : Page de login

1. Ouvrir navigateur
2. Aller sur : http://localhost:3000/login.html

**Succès si vous voyez** :

- Page avec fond violet
- Logo R_Corp
- Bouton "Se connecter"

### Test 2 : Connexion

1. Cliquer sur **"Se connecter"**
2. Saisir un email de test : `jean.dupont@techcorp.fr`

**Succès** :

```
Bienvenue Jean Dupont ! Redirection...
```

→ Redirection automatique vers la page d'accueil

**Erreur** :

```
Client non trouvé
→ Solution : Vérifier que ce client existe dans Salesforce
```

---

## ÉTAPE 7 : Test de la liste des commandes

Une fois connecté, vous devriez voir :

**Éléments à vérifier** :

- [ ] Votre nom en haut à droite
- [ ] Bouton "Déconnexion"
- [ ] Liste de commandes (cartes blanches)
- [ ] Chaque carte affiche :
  - Numéro de commande
  - Badge de statut coloré
  - Montant
  - Date
  - Bouton "Voir le détail →"

### Console du navigateur

Appuyer sur **F12** → **Console**

**Succès si vous voyez** :

```
Chargement de la page...
Utilisateur authentifié
Récupération des informations client...
Informations client récupérées : Jean Dupont
Récupération des commandes...
3 commande(s) récupérée(s)
```

---

## ÉTAPE 8 : Test des filtres

### Test 1 : Recherche

Dans la barre de recherche, taper : `CMD-2025`

**Succès** : Liste filtrée instantanément

### Test 2 : Filtre par état

Sélectionner **"En cours"** dans le menu déroulant

**Succès** : Seules les commandes "En cours" s'affichent

---

## ÉTAPE 9 : Test de déconnexion

Cliquer sur **"Déconnexion"**

**Succès** :

- Popup de confirmation
- Redirection vers `/login.html`
- Impossible d'accéder à `/index.html` sans reconnexion

---

## DÉPANNAGE

### Problème 1 : Le serveur ne démarre pas

**Symptôme** :

```
Error: Cannot find module 'express'
```

**Solution** :

```bash
rm -rf node_modules
npm install
npm run dev
```

---

### Problème 2 : "Client non trouvé"

**Symptôme** :

```
Client non trouvé
Aucun compte client associé à cet email
```

**Solutions** :

1. **Vérifier que le champ Email\_\_c existe** dans Salesforce
2. **Créer un client de test** :

   ```
   Salesforce → Clients → New
   → Name: Jean Dupont
   → Email: jean.dupont@techcorp.fr
   → Save
   ```

3. **Tester avec requête SOQL** :
   ```sql
   SELECT Id, Name, Email__c
   FROM Clients__c
   WHERE Email__c = 'jean.dupont@techcorp.fr'
   ```

---

### Problème 3 : Aucune commande ne s'affiche

**Symptôme** :

- Page se charge
- Message : "Aucune commande trouvée"

**Solutions** :

1. **Vérifier que des commandes existent** :

   ```sql
   SELECT Id, Name
   FROM Cmd__c
   WHERE Clients__r.Email__c = 'jean.dupont@techcorp.fr'
   ```

2. **Vérifier les noms de champs** dans `salesforce.service.js`

3. **Regarder la console serveur** (Terminal) :
   - Devrait afficher : `X commande(s) récupérée(s)`
   - Si erreur SOQL → Problème de nom de champ

---

### Problème 4 : Token expiré

**Symptôme** :

```
Session expirée
Veuillez vous reconnecter
```

**Solution** : C'est normal après 2h. Se reconnecter.

---

## CHECKLIST FINALE

Avant de valider que tout fonctionne :

- [ ] Serveur démarre sans erreur
- [ ] Page login s'affiche correctement
- [ ] Connexion fonctionne avec email de test
- [ ] Liste des commandes s'affiche
- [ ] Nom et email du client en haut
- [ ] Filtres fonctionnent
- [ ] Déconnexion fonctionne
- [ ] Impossible d'accéder à `/index.html` sans authentification
- [ ] Console navigateur sans erreurs
- [ ] Console serveur sans erreurs

---

## PROCHAINES ÉTAPES

Une fois que tout fonctionne :

1. Créer la page `order-detail.html`
2. Ajouter plus de clients de test
3. Tester sur différents navigateurs
4. Déployer sur Azure (optionnel)

---

## BESOIN D'AIDE ?

En cas de problème :

1. **Console serveur** (Terminal npm run dev)
2. **Console navigateur** (F12 → Console)
3. **Copier le message d'erreur exact**
4. **Vérifier les noms de champs Salesforce**

---
