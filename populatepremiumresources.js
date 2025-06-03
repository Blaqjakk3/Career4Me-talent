import { Client, Databases } from "appwrite";
import { premiumResources } from "./data/premium resources data.js";

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('67d074d0001dadc04f94') // Replace with your project ID

const databases = new Databases(client); // Fix the variable name (it was "database" earlier)

const databaseId = 'career4me';
const collectionId = 'premiumResources';

async function populateDatabase() {
  try {
    for (const resource of premiumResources) {
      // Create a new document for each learning stage
      await databases.createDocument(databaseId, collectionId, 'unique()', resource);
      console.log(`Added: ${resource.title}`);
    }
    console.log("All resources added successfully!");
  } catch (error) {
    console.error("Error adding resources:", error);
  }
}

// Run the function
populateDatabase();