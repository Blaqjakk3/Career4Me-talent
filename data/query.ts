import { databases } from "../lib/appwrite";
import { Query } from "appwrite";

// Replace with your actual IDs
const databaseId = 'career4me';
const collectionId = 'careerPaths';

// Fetch all documents (with pagination if needed)
async function getDistinctFields() {
  try {
    const response = await databases.listDocuments(databaseId, collectionId, [
      Query.limit(100) // Increase or loop for more documents
    ]);

    const skills = new Set<string>();
    const interests = new Set<string>();
    const requiredCerts = new Set<string>();
    const suggestedCerts = new Set<string>();

    for (const doc of response.documents) {
      doc.requiredSkills?.forEach((s: string) => skills.add(s));
      doc.requiredInterests?.forEach((i: string) => interests.add(i));
      doc.requiredCertifications?.forEach((c: string) => requiredCerts.add(c));
      doc.suggestedCertifications?.forEach((sc: string) => suggestedCerts.add(sc));
    }

    console.log("Distinct Required Skills:", Array.from(skills));
    console.log("Distinct Required Interests:", Array.from(interests));
    console.log("Distinct Required Certifications:", Array.from(requiredCerts));
    console.log("Distinct Suggested Certifications:", Array.from(suggestedCerts));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

getDistinctFields();
