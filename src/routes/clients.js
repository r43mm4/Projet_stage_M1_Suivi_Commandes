// ============================================
// 👤 ROUTES DES CLIENTS (VERSION MOCK)
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
// ROUTE 1 : INFORMATIONS DU CLIENT CONNECTÉ
// ============================================
router.get("/client", async (req, res) => {
  try {
    console.log("Récupération des informations client...");

    const emailClient = req.session.emailUtilisateur;

    if (!emailClient) {
      return res.status(401).json({
        success: false,
        error: "Session invalide",
      });
    }

    // Récupérer les infos (mock)
    const infoClient = await mockService.recupererInfosClient(emailClient);

    if (!infoClient) {
      return res.status(404).json({
        success: false,
        error: "Client non trouvé",
      });
    }

    console.log(`Informations client récupérées : ${infoClient.Name}`);

    // Formater pour le frontend
    const clientFormate = {
      id: infoClient.Id,
      nom: infoClient.Name,
      email: infoClient.Email__c,
      adresse: infoClient.Adresse__c,
      telephone: infoClient.Telephone__c,
    };

    res.json({
      success: true,
      data: clientFormate,
    });
  } catch (error) {
    console.error("Erreur récupération infos client:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de récupérer les informations",
      message: error.message,
    });
  }
});

// ============================================
// EXPORT
// ============================================
module.exports = router;
