# 🔧 SALESFORCE - Guide de Configuration

**Projet** : R_Corp Solutions  
**Version** : 1.0   
**Auteur** : WAFFO FOTSO Raoul Emmanu

---

## Vue d'ensemble

Ce document explique comment configurer Salesforce pour le projet.

**Durée estimée** : 8-10 heures

---

## Étape 1 : Créer le compte Salesforce

### Inscription Developer Edition (gratuite)

1. Aller sur https://developer.salesforce.com/signup
2. Remplir le formulaire :
   - Prénom, Nom
   - Email (unique)
   - Username (format: prenom.nom@domaine.dev)
3. Activer le compte par email
4. Première connexion sur https://login.salesforce.com

### Configuration initiale

**My Domain** (obligatoire)

```
Setup → Company Settings → My Domain
→ Choisir un nom : R_Corp-dev-ed
→ Enregistrer et déployer
```

**Langue et région**

```
Setup → Company Information
→ Locale : France
→ Time Zone : (GMT+01:00) Paris
→ Currency : EUR - Euro
```

---

## Étape 2 : Créer les objets personnalisés

### Schéma de la base de données

```
Client__c (Clients)
    ↓ 1:N
Cmd__c (Commandes)
    ↓ 1:N
Notification__c (Emails)

Cmd__c ←N:N→ Produit__c
    (via CommandeProduit__c)
```

### Objet 1 : Client\_\_c

**Création**

```
Setup → Object Manager → Create → Custom Object

Nom : Client
API Name : Client__c
Type d'enregistrement : Text (Name)
```

**Champs à créer**

| Nom         | Type           | Obligatoire | Unique |
| ----------- | -------------- | ----------- | ------ |
| Email       | Email          |             |        |
| Téléphone   | Phone          |             |        |
| Entreprise  | Text(120)      |             |        |
| Adresse     | Text Area(255) |             |        |
| Code Postal | Text(5)        |             |        |
| Ville       | Text(80)       |             |        |
| Actif       | Checkbox       |             |        |

### Objet 2 : Cmd\_\_c (Commandes)

**Création**

```
Setup → Object Manager → Create → Custom Object

Nom : Commande
API Name : Cmd__c
Type d'enregistrement : Auto Number
Format : CMD-{0000}
```

**Champs à créer**

| Nom            | Type           | Obligatoire                                         | Options         |
| -------------- | -------------- | --------------------------------------------------- | --------------- |
| Statut         | Picklist       | Brouillon, Confirmé, En préparation, Expédié, Livré |
| Montant Total  | Currency(10,2) |                                                     | -               |
| Date Commande  | Date           |                                                     | Défaut: TODAY() |
| Date Livraison | Date           |                                                     | -               |
| Description    | Long Text      |                                                     | -               |
| Client         | Master-Detail  |                                                     | → Client\_\_c   |

**Configuration Picklist "Statut"**

```
Valeurs (dans l'ordre) :
1. Brouillon (défaut)
2. Confirmé
3. En préparation
4. Expédié
5. Livré

Options : Restreindre aux valeurs Première valeur par défaut
```

### Objet 3 : Produit\_\_c

**Champs à créer**

| Nom         | Type           | Obligatoire |
| ----------- | -------------- | ----------- |
| Nom Produit | Text(120)      |             |
| Prix        | Currency(10,2) |             |
| Catégorie   | Picklist       |             |
| Stock       | Number(18,0)   |             |
| Actif       | Checkbox       |             |

**Catégories** : Électronique, Informatique, Réseau, Accessoire

### Objet 4 : Notification\_\_c

**Champs à créer**

| Nom          | Type          | Obligatoire |
| ------------ | ------------- | ----------- |
| Numéro       | Auto Number   |             |
| Commande     | Master-Detail |             |
| Destinataire | Email         |             |
| Sujet        | Text(255)     |             |
| Envoyé le    | Date/Time     |             |
| Statut       | Picklist      |             |

**Statuts** : En attente, Envoyé, Échoué

### Objet 5 : CommandeProduit\_\_c (Junction)

**Champs à créer**

| Nom           | Type               | Obligatoire |
| ------------- | ------------------ | ----------- |
| Commande      | Master-Detail      |             |
| Produit       | Master-Detail      |             |
| Quantité      | Number(18,0)       |             |
| Prix Unitaire | Currency(10,2)     |             |
| Sous-Total    | Formula (Currency) | -           |

**Formule Sous-Total**

```
Quantity__c * UnitPrice__c
```

---

## Étape 3 : Relations entre objets

### Relation 1 : Cmd**c → Client**c

```
Type : Master-Detail
Signification : Une commande appartient à UN client
Conséquence : Supprimer un client supprime ses commandes

Configuration :
Setup → Cmd__c → Fields → New
→ Master-Detail Relationship
→ Related To : Client__c
→ Field Name : Client__c
→ Child Relationship Name : Commandes
```

### Relation 2 : Notification**c → Cmd**c

```
Type : Master-Detail
Signification : Une notification concerne UNE commande

Configuration : Similaire à Relation 1
```

### Relation 3 : N:N (Cmd**c ↔ Produit**c)

```
Via objet junction : CommandeProduit__c

2 relations Master-Detail :
1. CommandeProduit__c → Cmd__c
2. CommandeProduit__c → Produit__c
```

---

## Étape 4 : Règles de validation

### Règle 1 : Montant positif

```
Setup → Cmd__c → Validation Rules → New

Nom : Amount_Must_Be_Positive
Formule : Amount__c <= 0
Message : "Le montant doit être supérieur à 0 €"
Emplacement : Champ Amount__c
```

### Règle 2 : Date livraison cohérente

```
Nom : Delivery_After_Order
Formule :
  AND(
    NOT(ISBLANK(DeliveryDate__c)),
    DeliveryDate__c < OrderDate__c
  )
Message : "La livraison ne peut pas être avant la commande"
```

### Règle 3 : Email valide

```
Objet : Client__c
Nom : Email_Format_Valid
Formule :
  NOT(REGEX(Email__c, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"))
Message : "Format d'email invalide"
```

---

## Étape 5 : Champs formules

### Formule 1 : Jours jusqu'à livraison

```
Objet : Cmd__c
Nom : DaysUntilDelivery__c
Type : Number
Formule :
  IF(ISBLANK(DeliveryDate__c), NULL, DeliveryDate__c - TODAY())
```

### Formule 2 : Commande urgente

```
Objet : Cmd__c
Nom : IsUrgent__c
Type : Checkbox
Formule :
  AND(
    NOT(ISBLANK(DeliveryDate__c)),
    DeliveryDate__c - TODAY() < 3,
    DeliveryDate__c >= TODAY()
  )
```

### Formule 3 : Total commandes client (Roll-Up)

```
Objet : Client__c
Nom : TotalOrders__c
Type : Roll-Up Summary
Objet résumé : Cmd__c
Type : COUNT
Filtre : Aucun
```

### Formule 4 : Chiffre d'affaires client

```
Objet : Client__c
Nom : TotalRevenue__c
Type : Roll-Up Summary
Objet résumé : Cmd__c
Type : SUM
Champ : Amount__c
Filtre : Status__c != "Brouillon"
```

---

## Étape 6 : Page Layouts

### Layout Client\_\_c

```
Setup → Client__c → Page Layouts → Edit

Structure :
┌─────────────────────────────────┐
│ INFORMATIONS CLIENT             │
├─────────────────────────────────┤
│ Nom              | Email        │
│ Entreprise       | Téléphone    │
│ Adresse                         │
│ Code Postal      | Ville        │
│ [✓] Actif                       │
├─────────────────────────────────┤
│ STATISTIQUES                    │
├─────────────────────────────────┤
│ Nb Commandes     | CA Total     │
└─────────────────────────────────┘

Related Lists :
• Commandes (colonnes : Numéro, Statut, Montant, Date)
```

### Layout Cmd\_\_c

```
Structure :
┌─────────────────────────────────┐
│ INFORMATIONS COMMANDE           │
├─────────────────────────────────┤
│ Numéro (auto)                   │
│ Client (lookup)                 │
│ Statut           | [✓] Urgent   │
│ Montant          | Date         │
│ Date Livraison   | Jours restant│
│ Description                     │
└─────────────────────────────────┘

Related Lists :
• Lignes de Commande (Produit, Qté, Prix, Total)
• Notifications (Numéro, Destinataire, Date, Statut)
```

---

## Étape 7 : Données de test

### Script de création (Developer Console)

```apex
// Developer Console → Debug → Execute Anonymous

// 1. Créer clients
List<Client__c> clients = new List<Client__c>();
clients.add(new Client__c(
    Name='Jean Dupont',
    Email__c='jean.dupont@techcorp.fr',
    Phone__c='0145678901',
    Company__c='TechCorp SAS',
    IsActive__c=true
));
clients.add(new Client__c(
    Name='Marie Martin',
    Email__c='m.martin@digitalsolutions.com',
    Phone__c='0298765432',
    Company__c='Digital Solutions',
    IsActive__c=true
));
insert clients;

// 2. Créer produits
List<Produit__c> produits = new List<Produit__c>();
produits.add(new Produit__c(
    ProductName__c='Dell Latitude 5540',
    Price__c=1299.00,
    Category__c='Informatique',
    Stock__c=25,
    IsActive__c=true
));
insert produits;

// 3. Créer commandes
List<Cmd__c> commandes = new List<Cmd__c>();
commandes.add(new Cmd__c(
    Client__c = clients[0].Id,
    Status__c = 'Expédié',
    Amount__c = 12500.00,
    OrderDate__c = Date.today().addDays(-10),
    DeliveryDate__c = Date.today().addDays(5)
));
insert commandes;

System.debug('Données créées avec succès !');
```

---

## Étape 8 : Vérification

### Requêtes SOQL de test

```sql
-- Nombre de clients
SELECT COUNT() FROM Client__c

-- Commandes par statut
SELECT Status__c, COUNT(Id)
FROM Cmd__c
GROUP BY Status__c

-- Commandes urgentes
SELECT OrderNumber__c, DaysUntilDelivery__c, IsUrgent__c
FROM Cmd__c
WHERE IsUrgent__c = true
```

---

## Checklist finale

**Configuration de base**

- [ ] Compte Developer Edition créé
- [ ] My Domain activé
- [ ] Région configurée (FR, EUR)

**Objets**

- [ ] Client\_\_c créé (8 champs)
- [ ] Cmd\_\_c créé (7 champs)
- [ ] Produit\_\_c créé (6 champs)
- [ ] Notification\_\_c créé (8 champs)
- [ ] CommandeProduit\_\_c créé (4 champs)

**Relations**

- [ ] Cmd**c → Client**c (Master-Detail)
- [ ] Notification**c → Cmd**c (Master-Detail)
- [ ] CommandeProduit**c ↔ Cmd**c + Produit\_\_c

**Règles et formules**

- [ ] 3 règles de validation
- [ ] 4 champs formules

**Données de test**

- [ ] 10 clients
- [ ] 15 produits
- [ ] 20 commandes

---

## ⏱Temps de configuration

| Tâche                  | Durée   |
| ---------------------- | ------- |
| Compte + Setup initial | 30 min  |
| Création objets        | 2h      |
| Configuration champs   | 2h      |
| Relations              | 1h      |
| Règles + Formules      | 1h30    |
| Page Layouts           | 1h      |
| Données de test        | 1h      |
| **TOTAL**              | **~9h** |

---

## Ressources

- [Trailhead - Data Modeling](https://trailhead.salesforce.com/content/learn/modules/data_modeling)
- [Object Manager Guide](https://help.salesforce.com/s/articleView?id=sf.customize_objectfields.htm)

---
