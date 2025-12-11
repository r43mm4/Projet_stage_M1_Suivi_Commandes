// ============================================
// 🎯 VARIABLES GLOBALES
// ============================================
let toutesLesCommandes = [];
let commandesFiltrees = [];

// ============================================
// 🚀 INITIALISATION
// ============================================
window.addEventListener("DOMContentLoaded", async () => {
  console.log("Chargement de la page index.html");

  await verifierAuthentification();
  await chargerInfoUtilisateur();
  await chargerCommandes();
});

// ============================================
// 🔐 VÉRIFIER AUTHENTIFICATION
// ============================================
async function verifierAuthentification() {
  try {
    const reponse = await fetch("/api/verifier-session");
    const donnees = await reponse.json();

    if (!donnees.connecte) {
      console.log("Utilisateur non connecté, redirection...");
      window.location.href = "/login.html";
    }
  } catch (erreur) {
    console.error("Erreur vérification auth:", erreur);
    window.location.href = "/login.html";
  }
}

// ============================================
// 👤 CHARGER INFOS UTILISATEUR
// ============================================
async function chargerInfoUtilisateur() {
  try {
    const reponse = await fetch("/api/client");
    const donnees = await reponse.json();

    if (donnees.success) {
      const client = donnees.data;

      document.getElementById("info-utilisateur").innerHTML = `
        <div class="info-client">
          <span class="nom-client">${client.nom}</span>
          <span class="email-client">${client.email}</span>
        </div>
        <button id="btn-deconnexion" class="bouton-deconnexion">
          Déconnexion
        </button>
      `;

      // Attacher l'événement au bouton
      document
        .getElementById("btn-deconnexion")
        .addEventListener("click", seDeconnecter);
    }
  } catch (erreur) {
    console.error("Erreur chargement info client:", erreur);
  }
}

// ============================================
// CHARGER COMMANDES
// ============================================
async function chargerCommandes() {
  const loader = document.getElementById("loader");
  const grilleCommandes = document.getElementById("grille-commandes");
  const messageVide = document.getElementById("message-vide");
  const messageErreur = document.getElementById("message-erreur");

  try {
    loader.style.display = "block";
    grilleCommandes.style.display = "none";
    messageVide.style.display = "none";
    messageErreur.style.display = "none";

    console.log("Récupération des commandes...");

    const reponse = await fetch("/api/commandes");
    const donnees = await reponse.json();

    loader.style.display = "none";

    if (donnees.success) {
      toutesLesCommandes = donnees.data;
      commandesFiltrees = toutesLesCommandes;

      console.log(`${toutesLesCommandes.length} commande(s) récupérée(s)`);

      if (toutesLesCommandes.length === 0) {
        messageVide.style.display = "block";
      } else {
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
// AFFICHER COMMANDES
// ============================================
function afficherCommandes(commandes) {
  const grilleCommandes = document.getElementById("grille-commandes");

  const html = commandes
    .map(
      (commande) => `
    <div class="carte-commande">
      <div class="carte-entete">
        <h3 class="numero-commande">${commande.numeroCommande}</h3>
        <span class="badge badge-${obtenirClasseEtat(commande.etat)}">
          ${commande.etat}
        </span>
      </div>

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

      <div class="carte-pied">
        <button class="bouton-detail" data-id="${commande.id}">
          Voir le détail →
        </button>
      </div>
    </div>
  `
    )
    .join("");

  grilleCommandes.innerHTML = html;

  // Attacher les événements aux boutons
  document.querySelectorAll(".bouton-detail").forEach((bouton) => {
    bouton.addEventListener("click", function () {
      const idCommande = this.getAttribute("data-id");
      voirDetail(idCommande);
    });
  });
}

// ============================================
// FILTRER COMMANDES
// ============================================
function filtrerCommandes() {
  const recherche = document
    .getElementById("champ-recherche")
    .value.toLowerCase();
  const filtreEtat = document.getElementById("filtre-etat").value;

  console.log(`Filtrage: recherche="${recherche}", état="${filtreEtat}"`);

  commandesFiltrees = toutesLesCommandes.filter((commande) => {
    const correspondRecherche =
      commande.numeroCommande.toLowerCase().includes(recherche) ||
      (commande.description &&
        commande.description.toLowerCase().includes(recherche)) ||
      commande.montant.toString().includes(recherche);

    const correspondEtat = filtreEtat === "" || commande.etat === filtreEtat;

    return correspondRecherche && correspondEtat;
  });

  console.log(`${commandesFiltrees.length} commande(s) après filtrage`);

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
// ACTUALISER
// ============================================
async function actualiser() {
  console.log("Actualisation...");
  await chargerCommandes();
}

// ============================================
// VOIR DÉTAIL
// ============================================
function voirDetail(idCommande) {
  console.log(`Navigation vers détail commande ${idCommande}`);
  alert(`Détail de la commande ${idCommande}\n\n(Page de détail à créer)`);
}

// ============================================
// DÉCONNEXION
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
// UTILITAIRES
// ============================================

function formaterMontant(montant) {
  if (!montant) return "0,00 €";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(montant);
}

function formaterDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function obtenirClasseEtat(etat) {
  const mapping = {
    "En cours": "en-cours",
    Expédié: "expedie",
    Livré: "livre",
    Annulé: "annule",
  };
  return mapping[etat] || "defaut";
}

// Rendre les fonctions globales pour les inputs
window.filtrerCommandes = filtrerCommandes;
window.actualiser = actualiser;
