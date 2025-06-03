import { Client, Databases } from "appwrite";
import { careerPaths } from "./careerPathsData.js"; // Add the .js extension

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('67d074d0001dadc04f94') // Replace with your project ID

const databases = new Databases(client); // Fix the variable name (it was "database" earlier)

const databaseId = 'career4me';
const collectionId = 'careerPaths';

async function populateDatabase() {
  try {
    for (const career of careerPaths) {
      await databases.createDocument(databaseId, collectionId, 'unique()', career);
      console.log(`Added: ${career.title}`);
    }
    console.log("All career paths added successfully!");
  } catch (error) {
    console.error("Error adding career paths:", error);
  }
}

// Run the function
populateDatabase();