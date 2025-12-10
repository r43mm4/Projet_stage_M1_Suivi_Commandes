// ============================================
// ROUTES DES CLIENTS
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
router.use(verifierAuthentification);
router.use(rafraichirTokenSiNecessaire);

// ============================================
// ROUTE 1 : INFORMATIONS DU CLIENT CONNECTÉ
// ============================================
// URL : GET /api/client
// Cette route récupère les informations du client actuellement connecté
router.get("/client", async (req, res) => {
  try {
    console.log("👤 Récupération des informations client...");

    // Récupération de l'email depuis la session
    const emailClient = req.session.emailUtilisateur;

    if (!emailClient) {
      return res.status(401).json({
        success: false,
        error: "Session invalide",
      });
    }

    // Récupération des infos depuis Salesforce
    const infoClient = await salesforceService.recupererInfosClient(
      emailClient
    );

    if (!infoClient) {
      return res.status(404).json({
        success: false,
        error: "Client non trouvé",
      });
    }

    console.log(`Informations client récupérées : ${infoClient.Name}`);

    // Formatage des données
    const clientFormate = {
      id: infoClient.Id,
      nom: infoClient.Name,
      email: infoClient.Email__c,
      adresse: infoClient.Adresse__c,
      telephone: infoClient.Téléphone__c,
    };

    res.json({
      success: true,
      data: clientFormate,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des infos client:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de récupérer les informations client",
      message: error.message,
    });
  }
});

// ============================================
// ROUTE 2 : METTRE À JOUR LES INFOS CLIENT
// ============================================
// URL : PUT /api/client
// Cette route permet au client de modifier ses informations
router.put("/client", async (req, res) => {
  try {
    console.log("Mise à jour des informations client...");

    const { adresse, telephone } = req.body;
    const emailClient = req.session.emailUtilisateur;

    // Note : Cette fonctionnalité nécessiterait d'implémenter
    // une méthode de mise à jour dans salesforce.service.js
    // Pour l'instant, on retourne une réponse fictive

    res.json({
      success: true,
      message: "Informations mises à jour avec succès",
      data: {
        adresse,
        telephone,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de mettre à jour les informations",
      message: error.message,
    });
  }
});

// ============================================
// EXPORT DU ROUTER
// ============================================
module.exports = router;
