// ============================================
// IMPORTATION DES MODULES
// ============================================
const express = require("express"); // Framework web pour créer le serveur
const session = require("express-session"); // Gestion des sessions utilisateur (pour se souvenir de qui est connecté)
const helmet = require("helmet"); // Sécurité : protège contre les attaques web
const rateLimit = require("express-rate-limit"); // Limite le nombre de requêtes (anti-spam)
const path = require("path"); // Gestion des chemins de fichiers
require("dotenv").config(); // Charge les variables du fichier .env

// ============================================
// IMPORTATION DES ROUTES (chemins du site)
// ============================================
const authRoutes = require("./routes/auth");
const commandesRoutes = require("./routes/commandes");
const clientsRoutes = require("./routes/clients");

// ============================================
// IMPORTATION DES MIDDLEWARES (outils de sécurité)
// ============================================
const { errorHandler } = require("./middleware/errorHandler");

// ============================================
// CRÉATION DU SERVEUR
// ============================================
const app = express();
const PORT = process.env.PORT || 3000; // Port 3000 par défaut

// ============================================
// CONFIGURATION DE LA SÉCURITÉ
// ============================================

// Helmet : Ajoute des en-têtes de sécurité HTTP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Par défaut, autoriser uniquement les ressources de notre site
        styleSrc: ["'self'", "'unsafe-inline'"], // Autoriser les styles inline (pour le CSS dans les balises HTML)
        scriptSrc: ["'self'"], // Autoriser uniquement les scripts de notre site
        imgSrc: ["'self'", "data:", "https:"], // Autoriser les images de notre site + data URLs + https
      },
    },
  })
);

// Rate Limiting : Limite les requêtes à 100 par 15 minutes par IP
// Cela empêche quelqu'un de spammer notre serveur
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requêtes
  message: "Trop de requêtes, réessayez plus tard.",
});
app.use("/api/", limiter);

// ============================================
// CONFIGURATION DU TRAITEMENT DES DONNÉES
// ============================================
app.use(express.json()); // Permet de lire les données JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les formulaires HTML

// ============================================
// CONFIGURATION DES SESSIONS
// ============================================
// Les sessions permettent de "se souvenir" de l'utilisateur connecté
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-super-complexe-a-changer", // Clé de chiffrement des sessions
    resave: false, // Ne pas sauvegarder si rien n'a changé
    saveUninitialized: false, // Ne pas créer de session vide
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS uniquement en production
      httpOnly: true, // Protection contre le vol de cookies via JavaScript
      maxAge: 7200000, // Durée de vie : 2 heures
    },
  })
);

// ============================================
// SERVIR LES FICHIERS STATIQUES (HTML, CSS, JS)
// ============================================
// Tout ce qui est dans le dossier "public" sera accessible directement
app.use(express.static(path.join(__dirname, "../public")));

// ============================================
// DÉFINITION DES ROUTES (chemins du site)
// ============================================

// Routes d'authentification (login, logout)
app.use("/", authRoutes);

// Routes API (récupération des données)
app.use("/api", commandesRoutes);
app.use("/api", clientsRoutes);

// Page d'accueil : redirige vers login ou index selon l'état de connexion
app.get("/", (req, res) => {
  if (req.session.accessToken) {
    // Si l'utilisateur a un token (= connecté), on l'envoie vers la page principale
    res.redirect("/index.html");
  } else {
    // Sinon, on l'envoie vers la page de connexion
    res.redirect("/login.html");
  }
});

// ============================================
// GESTION DES ERREURS
// ============================================

// Page 404 : quand on demande une page qui n'existe pas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Page non trouvée",
  });
});

// Gestionnaire d'erreurs global (attrape toutes les erreurs)
app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Environnement : ${process.env.NODE_ENV || "development"}`);
  console.log(`\n Pages disponibles :`);
  console.log(`   - http://localhost:${PORT}/login.html`);
  console.log(`   - http://localhost:${PORT}/index.html`);
  console.log(`\n🔌 Connexion à Salesforce...`);
});

// Export pour les tests
module.exports = app;
