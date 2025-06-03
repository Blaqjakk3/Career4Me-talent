import { Client, Databases } from "appwrite";
import { quotes } from "./quotes.js"; // Add the .js extension

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('67d074d0001dadc04f94') // Replace with your project ID

const databases = new Databases(client); // Fix the variable name (it was "database" earlier)

const databaseId = 'career4me';
const collectionId = 'quotes';

async function populatequotes() {
  try {
    for (const quote of quotes) {
      await databases.createDocument(databaseId, collectionId, 'unique()', quote);
      console.log(`Added: ${quote.quote}`);
    }
    console.log("All quotes added successfully!");
  } catch (error) {
    console.error("Error adding quotes:", error);
  }
}

// Run the function
populatequotes();