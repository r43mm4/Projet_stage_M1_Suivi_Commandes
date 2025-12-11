// ============================================
// SCRIPT DE CONNEXION
// ============================================

// ============================================
// FONCTION : Se connecter
// ============================================
async function seConnecter(event) {
  // Empêcher le rechargement de la page
  event.preventDefault();

  console.log("Tentative de connexion...");

  // Récupération des éléments du DOM
  const email = document.getElementById("email").value;
  const bouton = document.getElementById("bouton-connexion");
  const loader = document.getElementById("loader");
  const messageErreur = document.getElementById("message-erreur");

  // Masquer le message d'erreur précédent
  messageErreur.style.display = "none";

  // Désactiver le bouton et afficher le loader
  bouton.disabled = true;
  loader.style.display = "block";

  try {
    // ============================================
    // APPEL API : Connexion
    // ============================================
    const reponse = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    const donnees = await reponse.json();

    console.log("Réponse serveur:", donnees);

    // ============================================
    // TRAITEMENT DE LA RÉPONSE
    // ============================================
    if (donnees.success) {
      // Connexion réussie
      console.log("Connexion réussie !");

      // Afficher un message de succès temporaire
      messageErreur.style.display = "block";
      messageErreur.className = "message-succes";
      messageErreur.textContent = `Bienvenue ${donnees.client.nom} ! Redirection...`;

      // Redirection vers la page d'accueil après 1 seconde
      setTimeout(() => {
        console.log("Redirection vers /index.html");
        window.location.href = "/index.html";
      }, 1000);
    } else {
      // Erreur de connexion
      console.error("Erreur:", donnees.error);

      messageErreur.style.display = "block";
      messageErreur.className = "message-erreur";
      messageErreur.textContent = donnees.message || donnees.error;

      // Réactiver le bouton
      bouton.disabled = false;
      loader.style.display = "none";
    }
  } catch (erreur) {
    // Erreur réseau ou serveur
    console.error("Erreur lors de la connexion:", erreur);

    messageErreur.style.display = "block";
    messageErreur.className = "message-erreur";
    messageErreur.textContent =
      "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";

    bouton.disabled = false;
    loader.style.display = "none";
  }
}

// ============================================
// VÉRIFICATION : Déjà connecté ?
// ============================================
// Si l'utilisateur est déjà connecté, on le redirige vers l'accueil
window.addEventListener("DOMContentLoaded", async () => {
  console.log("Chargement de login.html");

  try {
    const reponse = await fetch("/api/verifier-session");
    const donnees = await reponse.json();

    console.log("Vérification session:", donnees);

    if (donnees.connecte) {
      console.log("Utilisateur déjà connecté, redirection...");
      window.location.href = "/index.html";
    }
  } catch (erreur) {
    console.log("Pas de session active (normal)");
  }
});

// Attacher la fonction au formulaire
document.addEventListener("DOMContentLoaded", () => {
  const formulaire = document.getElementById("formulaire-login");
  if (formulaire) {
    formulaire.addEventListener("submit", seConnecter);
  }
});
