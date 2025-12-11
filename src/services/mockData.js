// ============================================
// DONNÉES SIMULÉES (MOCK DATA)
// ============================================

// Base de données fictive de clients
const clients = [
  {
    Id: "CLI001",
    Name: "Jean Dupont",
    Email__c: "jean.dupont@techcorp.fr",
    Adresse__c: "12 Avenue des Champs-Élysées, 75008 Paris",
    Telephone__c: "+33 1 42 56 78 90",
  },
  {
    Id: "CLI002",
    Name: "Marie Martin",
    Email__c: "marie.martin@innovtech.fr",
    Adresse__c: "45 Rue de la Paix, 69002 Lyon",
    Telephone__c: "+33 4 78 90 12 34",
  },
  {
    Id: "CLI003",
    Name: "Pierre Dubois",
    Email__c: "pierre.dubois@digitalpro.fr",
    Adresse__c: "78 Boulevard Haussmann, 75009 Paris",
    Telephone__c: "+33 1 45 67 89 01",
  },
  {
    Id: "CLI004",
    Name: "raoul Waffo",
    Email__c: "raoulemma1999@gmail.com",
    Adresse__c: "10 Rue de la République, 95000 Cergy",
    Telephone__c: "+33 6 12 34 56 78",
  },
];

// Base de données fictive de commandes
const commandes = [
  {
    Id: "CMD001",
    Name: "CMD-2025-00042",
    Montant__c: 12500.0,
    Etat__c: "Expédié",
    Date__c: "2025-01-15",
    DateLivraison__c: "2025-01-25",
    Description__c: "Renouvellement parc informatique - 10 laptops Dell",
    ClientId: "CLI004",
  },
  {
    Id: "CMD002",
    Name: "CMD-2025-00038",
    Montant__c: 8900.0,
    Etat__c: "Livré",
    Date__c: "2025-01-10",
    DateLivraison__c: "2025-01-18",
    Description__c: "Équipement réseau - Switchs et routeurs Cisco",
    ClientId: "CLI004",
  },
  {
    Id: "CMD003",
    Name: "CMD-2025-00025",
    Montant__c: 3500.0,
    Etat__c: "Livré",
    Date__c: "2024-12-20",
    DateLivraison__c: "2025-01-05",
    Description__c: "Moniteurs LG 27 pouces x5",
    ClientId: "CLI004",
  },
  {
    Id: "CMD004",
    Name: "CMD-2025-00055",
    Montant__c: 15200.0,
    Etat__c: "En cours",
    Date__c: "2025-01-18",
    DateLivraison__c: "2025-02-05",
    Description__c: "Serveur Dell PowerEdge + stockage NAS",
    ClientId: "CLI004",
  },
  {
    Id: "CMD005",
    Name: "CMD-2025-00012",
    Montant__c: 4200.0,
    Etat__c: "Annulé",
    Date__c: "2024-12-15",
    DateLivraison__c: null,
    Description__c: "Commande annulée - Client a changé d'avis",
    ClientId: "CLI004",
  },
  {
    Id: "CMD006",
    Name: "CMD-2025-00018",
    Montant__c: 7800.0,
    Etat__c: "En cours",
    Date__c: "2025-01-12",
    DateLivraison__c: "2025-01-30",
    Description__c: "Licences Microsoft 365 Enterprise",
    ClientId: "CLI001",
  },
  {
    Id: "CMD007",
    Name: "CMD-2025-00033",
    Montant__c: 22500.0,
    Etat__c: "Expédié",
    Date__c: "2025-01-14",
    DateLivraison__c: "2025-01-28",
    Description__c: "Infrastructure complète - 15 postes + serveur",
    ClientId: "CLI002",
  },
];

// Base de données fictive de produits
const produits = [
  {
    Id: "PROD001",
    Name: "Dell Latitude 5540",
    Category__c: "Laptop",
    Prix__c: 1299.0,
  },
  {
    Id: "PROD002",
    Name: "Cisco Catalyst 2960-X",
    Category__c: "Réseau",
    Prix__c: 2450.0,
  },
  {
    Id: "PROD003",
    Name: "LG 27UK850-W",
    Category__c: "Écran",
    Prix__c: 450.0,
  },
  {
    Id: "PROD004",
    Name: "Dell PowerEdge R740",
    Category__c: "Serveur",
    Prix__c: 8500.0,
  },
  {
    Id: "PROD005",
    Name: "Synology DS920+",
    Category__c: "Stockage",
    Prix__c: 650.0,
  },
];

// Lignes de commande (relation commande-produit)
const lignesCommande = [
  {
    CommandeId: "CMD001",
    ProduitId: "PROD001",
    Quantite__c: 10,
    PrixUnitaire__c: 1250.0,
  },
  {
    CommandeId: "CMD002",
    ProduitId: "PROD002",
    Quantite__c: 4,
    PrixUnitaire__c: 2225.0,
  },
  {
    CommandeId: "CMD003",
    ProduitId: "PROD003",
    Quantite__c: 5,
    PrixUnitaire__c: 700.0,
  },
  {
    CommandeId: "CMD004",
    ProduitId: "PROD004",
    Quantite__c: 1,
    PrixUnitaire__c: 8500.0,
  },
  {
    CommandeId: "CMD004",
    ProduitId: "PROD005",
    Quantite__c: 2,
    PrixUnitaire__c: 3350.0,
  },
];

// ============================================
// FONCTIONS HELPER
// ============================================

/**
 * Trouve un client par email
 */
function trouverClientParEmail(email) {
  return clients.find((c) => c.Email__c.toLowerCase() === email.toLowerCase());
}

/**
 * Trouve toutes les commandes d'un client
 */
function trouverCommandesParClient(clientId) {
  return commandes
    .filter((cmd) => cmd.ClientId === clientId)
    .sort((a, b) => new Date(b.Date__c) - new Date(a.Date__c));
}

/**
 * Trouve une commande par ID
 */
function trouverCommandeParId(commandeId) {
  return commandes.find((cmd) => cmd.Id === commandeId);
}

/**
 * Trouve les produits d'une commande
 */
function trouverProduitsCommande(commandeId) {
  const lignes = lignesCommande.filter((l) => l.CommandeId === commandeId);

  return lignes.map((ligne) => {
    const produit = produits.find((p) => p.Id === ligne.ProduitId);
    return {
      nomProduit: produit?.Name || "Produit inconnu",
      categorie: produit?.Category__c || "N/A",
      quantite: ligne.Quantite__c,
      prixUnitaire: ligne.PrixUnitaire__c,
      sousTotal: ligne.Quantite__c * ligne.PrixUnitaire__c,
    };
  });
}

/**
 * Simule un délai réseau (pour réalisme)
 */
function simulerDelai(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// EXPORT
// ============================================
module.exports = {
  clients,
  commandes,
  produits,
  lignesCommande,
  trouverClientParEmail,
  trouverCommandesParClient,
  trouverCommandeParId,
  trouverProduitsCommande,
  simulerDelai,
};
