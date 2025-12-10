// ============================================
// IMPORTATION DES MODULES
// ============================================
const axios = require("axios"); // Pour faire des requêtes HTTP vers Salesforce
require("dotenv").config(); // Pour accéder aux variables d'environnement (.env)

// ============================================
// CLASSE SALESFORCE SERVICE
// ============================================
// Cette classe gère TOUTES les communications avec Salesforce
class SalesforceService {
  // ============================================
  // CONSTRUCTEUR (initialisation)
  // ============================================
  constructor() {
    // Récupération des identifiants depuis le fichier .env
    this.clientId = process.env.SF_CLIENT_ID;
    this.clientSecret = process.env.SF_CLIENT_SECRET;
    this.username = process.env.SF_USERNAME;
    this.password = process.env.SF_PASSWORD;
    this.loginUrl = process.env.SF_LOGIN_URL;
    this.instanceUrl = process.env.SF_INSTANCE_URL;

    // Token d'accès (sera rempli après connexion)
    this.accessToken = null;
  }

  // ============================================
  // MÉTHODE 1 : OBTENIR UN ACCESS TOKEN
  // ============================================
  // Cette méthode se connecte à Salesforce et récupère un "badge" (access_token)
  async obtenirAccessToken() {
    try {
      console.log("Connexion à Salesforce...");

      // Préparation des données pour la demande de token
      const params = new URLSearchParams({
        grant_type: "password", // Type d'authentification : mot de passe
        client_id: this.clientId, // Notre carte d'identité
        client_secret: this.clientSecret, // Notre mot de passe secret
        username: this.username, // Email Salesforce
        password: this.password, // Mot de passe Salesforce + Security Token
      });

      // Envoi de la requête à Salesforce
      const response = await axios.post(
        `${this.loginUrl}/services/oauth2/token`,
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Récupération du token d'accès
      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;

      console.log("Connexion Salesforce réussie !");

      // On retourne les données importantes
      return {
        accessToken: this.accessToken,
        instanceUrl: this.instanceUrl,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la connexion Salesforce:",
        error.response?.data || error.message
      );
      throw new Error("Impossible de se connecter à Salesforce");
    }
  }

  // ============================================
  // MÉTHODE 2 : EXÉCUTER UNE REQUÊTE SOQL
  // ============================================
  // SOQL = Salesforce Object Query Language (comme SQL mais pour Salesforce)
  // Cette méthode permet de récupérer des données
  async executerRequeteSOQL(requeteSOQL) {
    try {
      // Si on n'a pas de token, on en récupère un
      if (!this.accessToken) {
        await this.obtenirAccessToken();
      }

      console.log("Exécution de la requête SOQL:", requeteSOQL);

      // Envoi de la requête à Salesforce
      const response = await axios.get(
        `${this.instanceUrl}/services/data/v58.0/query`,
        {
          params: { q: requeteSOQL }, // La requête SOQL
          headers: {
            Authorization: `Bearer ${this.accessToken}`, // Notre badge d'accès
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`${response.data.totalSize} enregistrement(s) trouvé(s)`);

      // On retourne les résultats
      return response.data.records;
    } catch (error) {
      // Si le token a expiré (erreur 401), on en récupère un nouveau et on réessaie
      if (error.response?.status === 401) {
        console.log("Token expiré, renouvellement...");
        this.accessToken = null;
        await this.obtenirAccessToken();
        return this.executerRequeteSOQL(requeteSOQL); // On réessaie
      }

      console.error("Erreur SOQL:", error.response?.data || error.message);
      throw error;
    }
  }

  // ============================================
  // MÉTHODE 3 : RÉCUPÉRER UN ENREGISTREMENT PAR ID
  // ============================================
  // Cette méthode récupère UN enregistrement spécifique
  async recupererEnregistrement(typeObjet, idEnregistrement) {
    try {
      // Si on n'a pas de token, on en récupère un
      if (!this.accessToken) {
        await this.obtenirAccessToken();
      }

      console.log(
        `Récupération de l'enregistrement ${typeObjet}/${idEnregistrement}`
      );

      // Envoi de la requête à Salesforce
      const response = await axios.get(
        `${this.instanceUrl}/services/data/v58.0/sobjects/${typeObjet}/${idEnregistrement}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Enregistrement récupéré");
      return response.data;
    } catch (error) {
      // Si l'enregistrement n'existe pas
      if (error.response?.status === 404) {
        console.log("Enregistrement non trouvé");
        return null;
      }

      // Si le token a expiré
      if (error.response?.status === 401) {
        console.log("Token expiré, renouvellement...");
        this.accessToken = null;
        await this.obtenirAccessToken();
        return this.recupererEnregistrement(typeObjet, idEnregistrement);
      }

      console.error(
        "Erreur récupération:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // ============================================
  // MÉTHODES MÉTIER (spécifiques à notre projet)
  // ============================================

  /**
   * Récupère toutes les commandes d'un client
   * @param {string} emailClient - Email du client
   * @returns {Array} Liste des commandes
   */
  async recupererCommandesClient(emailClient) {
    // Construction de la requête SOQL en français
    const requete = `
      SELECT 
        Id,
        Name,
        Montant__c,
        Etat__c,
        Date__c,
        Description__c
      FROM Cmd__c
      WHERE Clients__r.Email__c = '${emailClient}'
      ORDER BY Date__c DESC
      LIMIT 50
    `;

    return await this.executerRequeteSOQL(requete);
  }

  /**
   * Récupère le détail d'une commande avec ses produits
   * @param {string} idCommande - ID Salesforce de la commande
   * @returns {Object} Détail de la commande
   */
  async recupererDetailCommande(idCommande) {
    const requete = `
      SELECT 
        Id,
        Name,
        Montant__c,
        Etat__c,
        Date__c,
        Description__c,
        Clients__r.Name,
        Clients__r.Email__c,
        (
          SELECT 
            Produit__r.Name,
            PrixUnitaire__c,
            Quantité__c
          FROM CommandeProduit__r
        )
      FROM Cmd__c
      WHERE Id = '${idCommande}'
    `;

    const resultats = await this.executerRequeteSOQL(requete);
    return resultats.length > 0 ? resultats[0] : null;
  }

  /**
   * Récupère les informations d'un client
   * @param {string} emailClient - Email du client
   * @returns {Object} Informations du client
   */
  async recupererInfosClient(emailClient) {
    const requete = `
      SELECT 
        Id,
        Name,
        Email__c,
        Adresse__c,
        Telephone__c
      FROM Clients__c
      WHERE Email__c = '${emailClient}'
      LIMIT 1
    `;

    const resultats = await this.executerRequeteSOQL(requete);
    return resultats.length > 0 ? resultats[0] : null;
  }
}

// ============================================
// EXPORT DE LA CLASSE
// ============================================
// On crée UNE SEULE instance de la classe (singleton)
// Cela permet de réutiliser le même token d'accès
module.exports = new SalesforceService();
