// ============================================
// VARIABLES GLOBALES
// ============================================
let toutesLesCommandes = []; // Stocke toutes les commandes récupérées
let commandesFiltrees = []; // Stocke les commandes après filtrage

// ============================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ============================================
window.addEventListener("DOMContentLoaded", async () => {
  console.log("Chargement de la page...");

  // Vérifier que l'utilisateur est connecté
  await verifierAuthentification();

  // Charger les informations de l'utilisateur
  await chargerInfoUtilisateur();

  // Charger les commandes
  await chargerCommandes();
});

// ============================================
// FONCTION : Vérifier l'authentification
// ============================================
async function verifierAuthentification() {
  try {
    const reponse = await fetch("/api/verifier-session");
    const donnees = await reponse.json();

    if (!donnees.connecte) {
      // Pas connecté → redirection vers login
      console.log("Utilisateur non connecté, redirection...");
      window.location.href = "/login.html";
    }
  } catch (erreur) {
    console.error("Erreur vérification auth:", erreur);
    window.location.href = "/login.html";
  }
}

// ============================================
// 👤 FONCTION : Charger les infos utilisateur
// ============================================
async function chargerInfoUtilisateur() {
  try {
    const reponse = await fetch("/api/client");
    const donnees = await reponse.json();

    if (donnees.success) {
      const client = donnees.data;

      // Afficher les infos dans l'en-tête
      document.getElementById("info-utilisateur").innerHTML = `
        <div class="info-client">
          <span class="nom-client">👤 ${client.nom}</span>
          <span class="email-client">${client.email}</span>
        </div>
        <button onclick="seDeconnecter()" class="bouton-deconnexion">
          🚪 Déconnexion
        </button>
      `;
    }
  } catch (erreur) {
    console.error("Erreur chargement info client:", erreur);
  }
}

// ============================================
// FONCTION : Charger les commandes
// ============================================
async function chargerCommandes() {
  const loader = document.getElementById("loader");
  const grilleCommandes = document.getElementById("grille-commandes");
  const messageVide = document.getElementById("message-vide");
  const messageErreur = document.getElementById("message-erreur");

  try {
    // Afficher le loader
    loader.style.display = "block";
    grilleCommandes.style.display = "none";
    messageVide.style.display = "none";
    messageErreur.style.display = "none";

    console.log("Récupération des commandes...");

    // Appel API
    const reponse = await fetch("/api/commandes");
    const donnees = await reponse.json();

    // Masquer le loader
    loader.style.display = "none";

    if (donnees.success) {
      toutesLesCommandes = donnees.data;
      commandesFiltrees = toutesLesCommandes;

      console.log(`${toutesLesCommandes.length} commande(s) récupérée(s)`);

      if (toutesLesCommandes.length === 0) {
        // Aucune commande
        messageVide.style.display = "block";
      } else {
        // Afficher les commandes
        afficherCommandes(toutesLesCommandes);
        grilleCommandes.style.display = "grid";
      }
    } else {
      throw new Error(donnees.error);
    }
  } catch (erreur) {
    console.error("Erreur chargement commandes:", erreur);

    loader.style.display = "none";
    messageErreur.style.display = "block";
    messageErreur.textContent =
      "Impossible de charger les commandes. Veuillez réessayer.";
  }
}

// ============================================
// FONCTION : Afficher les commandes
// ============================================
function afficherCommandes(commandes) {
  const grilleCommandes = document.getElementById("grille-commandes");

  // Générer le HTML pour chaque commande
  const html = commandes
    .map(
      (commande) => `
    <div class="carte-commande" onclick="voirDetail('${commande.id}')">
      
      <!-- En-tête de la carte -->
      <div class="carte-entete">
        <h3 class="numero-commande">${commande.numeroCommande}</h3>
        <span class="badge badge-${obtenirClasseEtat(commande.etat)}">
          ${commande.etat}
        </span>
      </div>

      <!-- Corps de la carte -->
      <div class="carte-corps">
        <div class="info-ligne">
          <span class="libelle">Montant :</span>
          <strong class="valeur">${formaterMontant(commande.montant)}</strong>
        </div>
        <div class="info-ligne">
          <span class="libelle">Date :</span>
          <span class="valeur">${formaterDate(commande.dateCommande)}</span>
        </div>
        ${
          commande.description
            ? `
          <div class="info-ligne">
            <span class="libelle">Description :</span>
            <span class="valeur">${commande.description}</span>
          </div>
        `
            : ""
        }
      </div>

      <!-- Pied de la carte -->
      <div class="carte-pied">
        <button class="bouton-detail">
          Voir le détail →
        </button>
      </div>

    </div>
  `
    )
    .join("");

  grilleCommandes.innerHTML = html;
}

// ============================================
// FONCTION : Filtrer les commandes
// ============================================
function filtrerCommandes() {
  const recherche = document
    .getElementById("champ-recherche")
    .value.toLowerCase();
  const filtreEtat = document.getElementById("filtre-etat").value;

  console.log(`Filtrage: recherche="${recherche}", état="${filtreEtat}"`);

  // Appliquer les filtres
  commandesFiltrees = toutesLesCommandes.filter((commande) => {
    // Filtre par recherche
    const correspondRecherche =
      commande.numeroCommande.toLowerCase().includes(recherche) ||
      (commande.description &&
        commande.description.toLowerCase().includes(recherche)) ||
      commande.montant.toString().includes(recherche);

    // Filtre par état
    const correspondEtat = filtreEtat === "" || commande.etat === filtreEtat;

    return correspondRecherche && correspondEtat;
  });

  console.log(`${commandesFiltrees.length} commande(s) après filtrage`);

  // Afficher les résultats
  if (commandesFiltrees.length === 0) {
    document.getElementById("grille-commandes").style.display = "none";
    document.getElementById("message-vide").style.display = "block";
  } else {
    document.getElementById("message-vide").style.display = "none";
    afficherCommandes(commandesFiltrees);
    document.getElementById("grille-commandes").style.display = "grid";
  }
}

// ============================================
// FONCTION : Actualiser la page
// ============================================
async function actualiser() {
  console.log("Actualisation...");
  await chargerCommandes();
}

// ============================================
// FONCTION : Voir le détail d'une commande
// ============================================
function voirDetail(idCommande) {
  console.log(`Navigation vers détail commande ${idCommande}`);
  window.location.href = `/order-detail.html?id=${idCommande}`;
}

// ============================================
// FONCTION : Se déconnecter
// ============================================
async function seDeconnecter() {
  if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
    try {
      console.log("Déconnexion...");

      await fetch("/api/logout", { method: "POST" });

      console.log("Déconnexion réussie");
      window.location.href = "/login.html";
    } catch (erreur) {
      console.error("Erreur déconnexion:", erreur);
      alert("Erreur lors de la déconnexion");
    }
  }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Formate un montant en euros
 */
function formaterMontant(montant) {
  if (!montant) return "0,00 €";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(montant);
}

/**
 * Formate une date au format français
 */
function formaterDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Retourne la classe CSS correspondant à un état
 */
function obtenirClasseEtat(etat) {
  const mapping = {
    "En cours": "en-cours",
    Expédié: "expedie",
    Livré: "livre",
    Annulé: "annule",
  };

  return mapping[etat] || "defaut";
}
