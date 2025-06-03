import { Client, Databases } from "appwrite";
import { topics } from "./topics.js";

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('67d074d0001dadc04f94') // Replace with your project ID

const databases = new Databases(client); // Fix the variable name (it was "database" earlier)

const databaseId = 'career4me';
const collectionId = 'topics';

async function populateDatabase() {
  try {
    for (const topic of topics) {
      // Create a new document for each learning stage
      await databases.createDocument(databaseId, collectionId, 'unique()', topic);
      console.log(`Added: ${topic.title}`);
    }
    console.log("All topics added successfully!");
  } catch (error) {
    console.error("Error adding topics:", error);
  }
}

// Run the function
populateDatabase();