// ============================================
// ROUTES DES COMMANDES
// ============================================
const express = require("express");
const router = express.Router();
const salesforceService = require("../services/salesforce.service");
const {
  verifierAuthentification,
  rafraichirTokenSiNecessaire,
} = require("../middleware/auth.middleware");

// ============================================
// PROTECTION DES ROUTES
// ============================================
// Toutes les routes ci-dessous nécessitent d'être connecté
router.use(verifierAuthentification);
router.use(rafraichirTokenSiNecessaire);

// ============================================
// ROUTE 1 : LISTER TOUTES LES COMMANDES DU CLIENT
// ============================================
// URL : GET /api/commandes
// Cette route récupère TOUTES les commandes du client connecté
router.get("/commandes", async (req, res) => {
  try {
    console.log("Récupération des commandes...");

    // Récupération de l'email depuis la session
    const emailClient = req.session.emailUtilisateur;

    if (!emailClient) {
      return res.status(401).json({
        success: false,
        error: "Session invalide",
      });
    }

    // Récupération des commandes depuis Salesforce
    const commandes = await salesforceService.recupererCommandesClient(
      emailClient
    );

    console.log(`${commandes.length} commande(s) récupérée(s)`);

    // Transformation des données pour le format français
    const commandesFormatees = commandes.map((cmd) => ({
      id: cmd.Id,
      numeroCommande: cmd.Name,
      montant: cmd.Montant__c,
      etat: cmd.Etat__c,
      dateCommande: cmd.Date__c,
      description: cmd.Description__c,
    }));

    res.json({
      success: true,
      count: commandesFormatees.length,
      data: commandesFormatees,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de récupérer les commandes",
      message: error.message,
    });
  }
});

// ============================================
// ROUTE 2 : DÉTAIL D'UNE COMMANDE
// ============================================
// URL : GET /api/commandes/:id
// Cette route récupère le détail d'UNE commande spécifique
// Exemple : GET /api/commandes/a015g00000XYZ789
router.get("/commandes/:id", async (req, res) => {
  try {
    const idCommande = req.params.id;
    console.log(`Récupération du détail de la commande ${idCommande}...`);

    // Récupération du détail depuis Salesforce
    const detailCommande = await salesforceService.recupererDetailCommande(
      idCommande
    );

    if (!detailCommande) {
      return res.status(404).json({
        success: false,
        error: "Commande non trouvée",
      });
    }

    // ============================================
    // SÉCURITÉ : Vérifier que la commande appartient bien au client
    // ============================================
    const emailClient = req.session.emailUtilisateur;
    if (detailCommande.Clients__r?.Email__c !== emailClient) {
      console.log("Tentative d'accès à une commande non autorisée");
      return res.status(403).json({
        success: false,
        error: "Accès refusé",
        message: "Cette commande ne vous appartient pas",
      });
    }

    // ============================================
    // FORMATAGE DES DONNÉES POUR LE FRONTEND
    // ============================================
    const commandeFormatee = {
      id: detailCommande.Id,
      numeroCommande: detailCommande.Name,
      montant: detailCommande.Montant__c,
      etat: detailCommande.Etat__c,
      dateCommande: detailCommande.Date__c,
      description: detailCommande.Description__c,

      // Informations client
      client: {
        nom: detailCommande.Clients__r?.Name,
        email: detailCommande.Clients__r?.Email__c,
      },

      // Liste des produits (si présents)
      produits: detailCommande.CommandeProduit__r
        ? detailCommande.CommandeProduit__r.records.map((ligne) => ({
            nomProduit: ligne.Produit__r?.Name,
            prixUnitaire: ligne.PrixUnitaire__c,
            quantite: ligne.Quantité__c,
            sousTotal: ligne.PrixUnitaire__c * ligne.Quantité__c,
          }))
        : [],
    };

    console.log("Détail de la commande récupéré");

    res.json({
      success: true,
      data: commandeFormatee,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du détail:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de récupérer le détail de la commande",
      message: error.message,
    });
  }
});

// ============================================
// ROUTE 3 : STATISTIQUES DES COMMANDES
// ============================================
// URL : GET /api/commandes/statistiques
// Cette route donne des statistiques sur les commandes du client
router.get("/statistiques", async (req, res) => {
  try {
    console.log("Calcul des statistiques...");

    const emailClient = req.session.emailUtilisateur;
    const commandes = await salesforceService.recupererCommandesClient(
      emailClient
    );

    // Calcul des statistiques
    const stats = {
      nombreTotal: commandes.length,
      montantTotal: commandes.reduce(
        (sum, cmd) => sum + (cmd.Montant__c || 0),
        0
      ),

      // Répartition par état
      parEtat: {
        enCours: commandes.filter((cmd) => cmd.Etat__c === "En cours").length,
        livre: commandes.filter((cmd) => cmd.Etat__c === "Livré").length,
        annule: commandes.filter((cmd) => cmd.Etat__c === "Annulé").length,
      },
    };

    console.log("Statistiques calculées");

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de calculer les statistiques",
      message: error.message,
    });
  }
});

// ============================================
// EXPORT DU ROUTER
// ============================================
module.exports = router;
