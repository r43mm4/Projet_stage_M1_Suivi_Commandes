// ============================================
// ROUTES DES COMMANDES (VERSION MOCK)
// ============================================
const express = require("express");
const router = express.Router();

// MOCK SERVICE
const mockService = require("../services/mock.service");

const {
  verifierAuthentification,
  rafraichirTokenSiNecessaire,
} = require("../middleware/auth.middleware");

// ============================================
// PROTECTION DES ROUTES
// ============================================
router.use(verifierAuthentification);
router.use(rafraichirTokenSiNecessaire);

// ============================================
// ROUTE 1 : LISTER TOUTES LES COMMANDES
// ============================================
router.get("/commandes", async (req, res) => {
  try {
    console.log("Récupération des commandes...");

    const emailClient = req.session.emailUtilisateur;

    if (!emailClient) {
      return res.status(401).json({
        success: false,
        error: "Session invalide",
      });
    }

    // Récupérer les commandes (mock)
    const commandes = await mockService.recupererCommandesClient(emailClient);

    console.log(`${commandes.length} commande(s) récupérée(s)`);

    // Formater pour le frontend
    const commandesFormatees = commandes.map((cmd) => ({
      id: cmd.Id,
      numeroCommande: cmd.Name,
      montant: cmd.Montant__c,
      etat: cmd.Etat__c,
      dateCommande: cmd.Date__c,
      dateLivraison: cmd.DateLivraison__c,
      description: cmd.Description__c,
    }));

    res.json({
      success: true,
      count: commandesFormatees.length,
      data: commandesFormatees,
    });
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
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
router.get("/commandes/:id", async (req, res) => {
  try {
    const idCommande = req.params.id;
    console.log(`Récupération détail commande ${idCommande}...`);

    // Récupérer le détail
    const detailCommande = await mockService.recupererDetailCommande(
      idCommande
    );

    if (!detailCommande) {
      return res.status(404).json({
        success: false,
        error: "Commande non trouvée",
      });
    }

    // Vérifier que la commande appartient au client
    const emailClient = req.session.emailUtilisateur;
    if (detailCommande.Clients__r?.Email__c !== emailClient) {
      console.log("Tentative d'accès non autorisé");
      return res.status(403).json({
        success: false,
        error: "Accès refusé",
        message: "Cette commande ne vous appartient pas",
      });
    }

    // Formater pour le frontend
    const commandeFormatee = {
      id: detailCommande.Id,
      numeroCommande: detailCommande.Name,
      montant: detailCommande.Montant__c,
      etat: detailCommande.Etat__c,
      dateCommande: detailCommande.Date__c,
      dateLivraison: detailCommande.DateLivraison__c,
      description: detailCommande.Description__c,
      client: {
        nom: detailCommande.Clients__r?.Name,
        email: detailCommande.Clients__r?.Email__c,
      },
      produits: detailCommande.Produits || [],
    };

    console.log("Détail commande récupéré");

    res.json({
      success: true,
      data: commandeFormatee,
    });
  } catch (error) {
    console.error("Erreur récupération détail:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de récupérer le détail",
      message: error.message,
    });
  }
});

// ============================================
// ROUTE 3 : STATISTIQUES
// ============================================
router.get("/statistiques", async (req, res) => {
  try {
    console.log("Calcul des statistiques...");

    const emailClient = req.session.emailUtilisateur;
    const commandes = await mockService.recupererCommandesClient(emailClient);

    const stats = {
      nombreTotal: commandes.length,
      montantTotal: commandes.reduce(
        (sum, cmd) => sum + (cmd.Montant__c || 0),
        0
      ),
      parEtat: {
        enCours: commandes.filter((cmd) => cmd.Etat__c === "En cours").length,
        expedie: commandes.filter((cmd) => cmd.Etat__c === "Expédié").length,
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
    console.error("Erreur calcul statistiques:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de calculer les statistiques",
      message: error.message,
    });
  }
});

// ============================================
// EXPORT
// ============================================
module.exports = router;
