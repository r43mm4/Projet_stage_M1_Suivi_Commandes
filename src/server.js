// ============================================
// IMPORTATION DES MODULES
// ============================================
const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

// ============================================
// IMPORTATION DES ROUTES
// ============================================
const authRoutes = require("./routes/auth");
const commandesRoutes = require("./routes/commandes");
const clientsRoutes = require("./routes/clients");

// ============================================
// IMPORTATION DES MIDDLEWARES
// ============================================
const { errorHandler } = require("./middleware/errorHandler");

// ============================================
// CRÉATION DU SERVEUR
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SÉCURITÉ - DÉSACTIVÉE POUR LA DEMO
// ============================================
// On retire Helmet et Rate Limiting pour éviter les problèmes CSP

// ============================================
// CONFIGURATION DU TRAITEMENT DES DONNÉES
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CONFIGURATION DES SESSIONS
// ============================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-demo-r-corp-solutions-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // false pour localhost
      httpOnly: true,
      maxAge: 7200000, // 2 heures
    },
    name: "rcorp.sid",
  })
);

// ============================================
// SERVIR LES FICHIERS STATIQUES
// ============================================
app.use(express.static(path.join(__dirname, "../public")));

// ============================================
// DÉFINITION DES ROUTES
// ============================================

// Routes d'authentification (NON PROTÉGÉES)
app.use("/", authRoutes);

// Routes API (PROTÉGÉES)
app.use("/api", commandesRoutes);
app.use("/api", clientsRoutes);

// Page d'accueil
app.get("/", (req, res) => {
  if (req.session.accessToken) {
    res.redirect("/index.html");
  } else {
    res.redirect("/login.html");
  }
});

// ============================================
// GESTION DES ERREURS
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Page non trouvée",
  });
});

app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT, () => {
  console.log(`\nServeur démarré sur http://localhost:${PORT}`);
  console.log(`\nPages disponibles :`);
  console.log(`   - http://localhost:${PORT}/login.html`);
  console.log(`   - http://localhost:${PORT}/index.html`);
  console.log(`\nClients disponibles :`);
  console.log(`   - raoulemma1999@gmail.com (5 commandes)`);
  console.log(`   - jean.dupont@techcorp.fr (1 commande)`);
  console.log(`   - marie.martin@innovtech.fr (1 commande)`);
});

module.exports = app;
