// test-salesforce.js
require("dotenv").config();
const salesforceService = require("./src/services/salesforce.service");

async function tester() {
  console.log("Test de connexion Salesforce...\n");

  try {
    // Test 1 : Connexion
    console.log("Test 1 : Obtenir Access Token...");
    const auth = await salesforceService.obtenirAccessToken();
    console.log("Token obtenu:", auth.accessToken.substring(0, 20) + "...\n");

    // Test 2 : Récupérer client
    console.log("Test 2 : Récupérer infos client...");
    const client = await salesforceService.recupererInfosClient(
      "raoulemma1999@gmail.com"
    );

    if (client) {
      console.log("Client trouvé:");
      console.log("   - ID:", client.Id);
      console.log("   - Nom:", client.Name);
      console.log("   - Email:", client.Email__c);
      console.log("   - Telephone:", client.Telephone__c || "N/A");
      console.log("   - Adresse:", client.Adresse__c || "N/A");
    } else {
      console.log("Client NON trouvé !");
    }

    // Test 3 : Récupérer commandes
    console.log("\nTest 3 : Récupérer commandes...");
    const commandes = await salesforceService.recupererCommandesClient(
      "raoulemma1999@gmail.com"
    );
    console.log(`${commandes.length} commande(s) trouvée(s)\n`);

    if (commandes.length > 0) {
      console.log("Première commande:");
      console.log("   - Numéro:", commandes[0].Name);
      console.log("   - Montant:", commandes[0].Montant__c);
      console.log("   - État:", commandes[0].Etat__c);
      console.log("   - Date:", commandes[0].Date__c);
    }

    console.log("\nTOUS LES TESTS SONT PASSÉS !");
    process.exit(0);
  } catch (error) {
    console.error("\nERREUR:", error.message);
    console.error("\nDétails:", error.response?.data || error);
    process.exit(1);
  }
}

tester();
