// ============================================
// SERVICE MOCK (SANS SALESFORCE)
// ============================================
// Ce service simule Salesforce avec des données locales

const mockData = require("./mockData");

class MockService {
  constructor() {}

  // ============================================
  // MÉTHODE : Obtenir Access Token (simulé)
  // ============================================
  async obtenirAccessToken() {
    console.log(" Connexion Salesforce...");

    // Simuler un délai réseau
    await mockData.simulerDelai(300);

    console.log(" Connexion réussie !");

    return {
      accessToken: "MOCK_TOKEN_" + Date.now(),
      instanceUrl: "https://mock-salesforce.local",
    };
  }

  // ============================================
  // MÉTHODE : Récupérer infos client
  // ============================================
  async recupererInfosClient(emailClient) {
    console.log(` Recherche client: ${emailClient}`);

    // Simuler un délai réseau
    await mockData.simulerDelai(200);

    const client = mockData.trouverClientParEmail(emailClient);

    if (client) {
      console.log(` Client trouvé: ${client.Name}`);
    } else {
      console.log(` Client non trouvé`);
    }

    return client;
  }

  // ============================================
  // MÉTHODE : Récupérer commandes client
  // ============================================
  async recupererCommandesClient(emailClient) {
    console.log(` Recherche commandes pour: ${emailClient}`);

    // Simuler un délai réseau
    await mockData.simulerDelai(400);

    // Trouver le client
    const client = mockData.trouverClientParEmail(emailClient);

    if (!client) {
      console.log(` Client non trouvé`);
      return [];
    }

    // Récupérer ses commandes
    const commandes = mockData.trouverCommandesParClient(client.Id);

    console.log(` ${commandes.length} commande(s) trouvée(s)`);

    return commandes;
  }

  // ============================================
  // MÉTHODE : Récupérer détail commande
  // ============================================
  async recupererDetailCommande(idCommande) {
    console.log(` Recherche détail commande: ${idCommande}`);

    // Simuler un délai réseau
    await mockData.simulerDelai(300);

    const commande = mockData.trouverCommandeParId(idCommande);

    if (!commande) {
      console.log(` Commande non trouvée`);
      return null;
    }

    // Trouver le client associé
    const client = mockData.clients.find((c) => c.Id === commande.ClientId);

    // Trouver les produits
    const produits = mockData.trouverProduitsCommande(idCommande);

    console.log(` Détail commande récupéré`);

    // Retourner au format attendu par le frontend
    return {
      Id: commande.Id,
      Name: commande.Name,
      Montant__c: commande.Montant__c,
      Etat__c: commande.Etat__c,
      Date__c: commande.Date__c,
      DateLivraison__c: commande.DateLivraison__c,
      Description__c: commande.Description__c,
      Clients__r: {
        Name: client?.Name || "Client inconnu",
        Email__c: client?.Email__c || "N/A",
      },
      Produits: produits,
    };
  }

  // ============================================
  // MÉTHODE : Exécuter requête SOQL (simulé)
  // ============================================
  async executerRequeteSOQL(requete) {
    console.log(` Exécution SOQL : ${requete.substring(0, 50)}...`);

    // Simuler un délai
    await mockData.simulerDelai(200);

    console.log(` Requête exécutée`);

    return [];
  }

  // ============================================
  // MÉTHODE : Récupérer enregistrement par ID
  // ============================================
  async recupererEnregistrement(typeObjet, idEnregistrement) {
    console.log(` Récupération ${typeObjet}/${idEnregistrement}`);

    // Simuler un délai
    await mockData.simulerDelai(200);

    console.log(` Enregistrement récupéré`);

    return null;
  }
}

// ============================================
// EXPORT (Singleton)
// ============================================
module.exports = new MockService();
