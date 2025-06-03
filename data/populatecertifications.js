import { Client, Databases } from "appwrite";
import { certifications } from "./certifications.js";

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('67d074d0001dadc04f94') // Replace with your project ID

const databases = new Databases(client); // Fix the variable name (it was "database" earlier)

const databaseId = 'career4me';
const collectionId = 'certifications';

async function populateDatabase() {
  try {
    for (const certificate of certifications) {
      // Create a new document for each learning stage
      await databases.createDocument(databaseId, collectionId, 'unique()', certificate);
      console.log(`Added: ${certificate.name}`);
    }
    console.log("All certifications added successfully!");
  } catch (error) {
    console.error("Error adding certifications:", error);
  }
}

// Run the function
populateDatabase();