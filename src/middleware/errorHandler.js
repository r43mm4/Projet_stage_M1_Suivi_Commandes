// ============================================
// GESTIONNAIRE D'ERREURS GLOBAL
// ============================================
// Ce fichier attrape TOUTES les erreurs qui se produisent dans l'application

/**
 * Fonction qui gère les erreurs de manière centralisée
 *
 * @param {Error} err - L'erreur qui s'est produite
 * @param {Request} req - La requête HTTP
 * @param {Response} res - La réponse HTTP
 * @param {Function} next - Fonction pour passer à l'étape suivante
 */
function errorHandler(err, req, res, next) {
  // Affichage détaillé de l'erreur dans la console du serveur
  console.error("ERREUR DÉTECTÉE :");
  console.error("  URL:", req.method, req.url);
  console.error("  Message:", err.message);
  console.error("  Détails:", err);

  // ============================================
  // CAS 1 : Erreur venant de Salesforce
  // ============================================
  if (err.response?.data) {
    const erreurSalesforce = err.response.data[0] || err.response.data;

    return res.status(err.response.status || 500).json({
      success: false,
      error: erreurSalesforce.message || "Erreur Salesforce",
      codeErreur: erreurSalesforce.errorCode,
      source: "Salesforce",
    });
  }

  // ============================================
  // CAS 2 : Erreur de validation (400)
  // ============================================
  if (err.status === 400 || err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message || "Données invalides",
      source: "Validation",
    });
  }

  // ============================================
  // CAS 3 : Erreur d'authentification (401)
  // ============================================
  if (err.status === 401 || err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      error: "Non autorisé",
      message: "Vous devez être connecté",
      source: "Authentification",
    });
  }

  // ============================================
  // CAS 4 : Ressource non trouvée (404)
  // ============================================
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: "Ressource non trouvée",
      message: err.message || "L'élément demandé n'existe pas",
      source: "NotFound",
    });
  }

  // ============================================
  // CAS 5 : Erreur générique (500)
  // ============================================
  // Si on arrive ici, c'est une erreur qu'on n'a pas prévue
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Erreur interne du serveur",
    // En développement, on affiche plus de détails
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err,
    }),
    source: "Serveur",
  });
}

// ============================================
// EXPORT
// ============================================
module.exports = { errorHandler };
