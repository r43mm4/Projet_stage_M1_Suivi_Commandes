// ============================================
// MIDDLEWARE D'AUTHENTIFICATION
// ============================================
// Un "middleware" est une fonction qui vérifie quelque chose AVANT de laisser passer la requête

/**
 * MIDDLEWARE : Vérifier que l'utilisateur est connecté
 *
 * Ce middleware s'assure que l'utilisateur a bien un token d'accès valide
 * avant de lui donner accès aux pages protégées
 */
function verifierAuthentification(req, res, next) {
  // On vérifie si l'utilisateur a un accessToken dans sa session
  if (!req.session.accessToken) {
    // Pas de token = pas connecté
    console.log("Tentative d'accès non autorisé");

    return res.status(401).json({
      success: false,
      error: "Non autorisé",
      message: "Vous devez être connecté pour accéder à cette page",
    });
  }

  // Token présent = connecté, on laisse passer
  console.log("Utilisateur authentifié");
  next(); // Passe à l'étape suivante
}

/**
 * MIDDLEWARE : Rafraîchir automatiquement le token si nécessaire
 *
 * Les tokens Salesforce expirent après 2 heures
 * Ce middleware vérifie si le token est proche de l'expiration
 * et le renouvelle automatiquement si besoin
 */
async function rafraichirTokenSiNecessaire(req, res, next) {
  const DUREE_VIE_TOKEN = 7200000; // 2 heures en millisecondes
  const SEUIL_RAFRAICHISSEMENT = 6300000; // 1h45 en millisecondes

  // Récupération des informations de session
  const { tokenEmisLe } = req.session;

  // Si on n'a pas de date d'émission, on passe (le token est récent)
  if (!tokenEmisLe) {
    return next();
  }

  // Calcul de l'âge du token
  const ageToken = Date.now() - tokenEmisLe;

  // Si le token a plus de 1h45, on le rafraîchit de manière préventive
  if (ageToken > SEUIL_RAFRAICHISSEMENT) {
    try {
      console.log("Token proche de l'expiration, rafraîchissement...");

      const salesforceService = require("../services/salesforce.service");
      const nouvellesDonnees = await salesforceService.obtenirAccessToken();

      // Mise à jour de la session
      req.session.accessToken = nouvellesDonnees.accessToken;
      req.session.instanceUrl = nouvellesDonnees.instanceUrl;
      req.session.tokenEmisLe = Date.now();

      console.log("Token rafraîchi avec succès");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);

      // En cas d'erreur, on détruit la session et on force une reconnexion
      req.session.destroy();

      return res.status(401).json({
        success: false,
        error: "Session expirée",
        message: "Veuillez vous reconnecter",
      });
    }
  }

  next(); // Passe à l'étape suivante
}

// ============================================
// EXPORT DES MIDDLEWARES
// ============================================
module.exports = {
  verifierAuthentification,
  rafraichirTokenSiNecessaire,
};
