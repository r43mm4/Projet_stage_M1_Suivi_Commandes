// ============================================
// ROUTES D'AUTHENTIFICATION
// ============================================
const express = require("express");
const router = express.Router();
const salesforceService = require("../services/salesforce.service");

// ============================================
// ROUTE 1 : LOGIN (Connexion)
// ============================================
// URL : POST /api/login
// Cette route connecte l'utilisateur à Salesforce
router.post("/api/login", async (req, res) => {
  try {
    console.log("Tentative de connexion...");

    // Récupération de l'email depuis le formulaire de login
    const { email } = req.body;

    // Vérification que l'email est fourni
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email requis",
      });
    }

    // ============================================
    // ÉTAPE 1 : Connexion à Salesforce
    // ============================================
    const authData = await salesforceService.obtenirAccessToken();

    // ============================================
    // ÉTAPE 2 : Vérification que le client existe
    // ============================================
    const infoClient = await salesforceService.recupererInfosClient(email);

    if (!infoClient) {
      return res.status(404).json({
        success: false,
        error: "Client non trouvé",
        message: "Aucun compte client associé à cet email",
      });
    }

    // ============================================
    // ÉTAPE 3 : Création de la session utilisateur
    // ============================================
    req.session.accessToken = authData.accessToken;
    req.session.instanceUrl = authData.instanceUrl;
    req.session.tokenEmisLe = Date.now();
    req.session.emailUtilisateur = email;
    req.session.idClient = infoClient.Id;
    req.session.nomClient = infoClient.Name;

    console.log(`Connexion réussie pour ${infoClient.Name}`);

    // ============================================
    // ÉTAPE 4 : Envoi de la réponse
    // ============================================
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
// URL : POST /api/logout
// Cette route déconnecte l'utilisateur
router.post("/api/logout", (req, res) => {
  console.log("Déconnexion en cours...");

  // Destruction de la session (supprime toutes les données de session)
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
// URL : GET /api/verifier-session
// Cette route permet de vérifier si l'utilisateur est toujours connecté
router.get("/api/verifier-session", (req, res) => {
  if (req.session.accessToken) {
    // Session valide
    res.json({
      success: true,
      connecte: true,
      client: {
        nom: req.session.nomClient,
        email: req.session.emailUtilisateur,
      },
    });
  } else {
    // Session expirée ou inexistante
    res.json({
      success: true,
      connecte: false,
    });
  }
});

// ============================================
// EXPORT DU ROUTER
// ============================================
module.exports = router;
