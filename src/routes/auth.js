// ============================================
// ROUTES D'AUTHENTIFICATION (VERSION MOCK)
// ============================================
const express = require("express");
const router = express.Router();

// MOCK SERVICE au lieu de Salesforce
const mockService = require("../services/mock.service");

// ============================================
// ROUTE 1 : LOGIN (Connexion)
// ============================================
router.post("/api/login", async (req, res) => {
  try {
    console.log("Tentative de connexion...");

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email requis",
      });
    }

    // ÉTAPE 1 : Connexion
    const authData = await mockService.obtenirAccessToken();

    // ÉTAPE 2 : Vérifier que le client existe
    const infoClient = await mockService.recupererInfosClient(email);

    if (!infoClient) {
      return res.status(404).json({
        success: false,
        error: "Client non trouvé",
        message: "Aucun compte client associé à cet email",
      });
    }

    // ÉTAPE 3 : Créer la session
    req.session.accessToken = authData.accessToken;
    req.session.instanceUrl = authData.instanceUrl;
    req.session.tokenEmisLe = Date.now();
    req.session.emailUtilisateur = email;
    req.session.idClient = infoClient.Id;
    req.session.nomClient = infoClient.Name;

    console.log(`Connexion réussie pour ${infoClient.Name}`);

    // ÉTAPE 4 : Retourner succès
    res.json({
      success: true,
      message: "Connexion réussie",
      client: {
        id: infoClient.Id,
        nom: infoClient.Name,
        email: infoClient.Email__c,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la connexion",
      message: error.message,
    });
  }
});

// ============================================
// ROUTE 2 : LOGOUT (Déconnexion)
// ============================================
router.post("/api/logout", (req, res) => {
  console.log("Déconnexion en cours...");

  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la déconnexion:", err);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la déconnexion",
      });
    }

    console.log("Déconnexion réussie");
    res.json({
      success: true,
      message: "Déconnexion réussie",
    });
  });
});

// ============================================
// ROUTE 3 : VÉRIFIER LA SESSION
// ============================================
router.get("/api/verifier-session", (req, res) => {
  if (req.session.accessToken) {
    res.json({
      success: true,
      connecte: true,
      client: {
        nom: req.session.nomClient,
        email: req.session.emailUtilisateur,
      },
    });
  } else {
    res.json({
      success: true,
      connecte: false,
    });
  }
});

// ============================================
// 📤 EXPORT
// ============================================
module.exports = router;
