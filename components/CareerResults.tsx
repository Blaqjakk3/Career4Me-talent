// components/CareerResults.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { saveCareerPath, getCurrentUser } from '../lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Recommendation { 
  pathId: string;
  title: string;
  matchScore: number;
  reason: string;
  improvementAreas?: string[];
}

interface ResultsData {
  generalAdvice: string;
  recommendations: Recommendation[];
}

interface CareerResultsProps {
  results: ResultsData | null;
  onRetake: () => void;
  careerStage: string;
}

const CareerResults: React.FC<CareerResultsProps> = ({ results, onRetake, careerStage }) => {
  const [savedPaths, setSavedPaths] = React.useState<string[]>([]);
  const [loadingPathId, setLoadingPathId] = React.useState<string | null>(null); // Optional: for loading state
  const router = useRouter();

  // Fetch saved paths on mount
  React.useEffect(() => {
    const fetchSavedPaths = async () => {
      try {
        const user = await getCurrentUser();
        if (user && Array.isArray(user.savedPaths)) {
          setSavedPaths(user.savedPaths);
        }
      } catch (error) {
        console.error("Failed to fetch saved paths:", error);
      }
    };
    fetchSavedPaths();
  }, []);

  const handleSavePath = async (pathId: string) => {
    setLoadingPathId(pathId); // Optional: show loading
    try {
      const result = await saveCareerPath(pathId);
      if (result.success) {
        setSavedPaths(result.savedPaths); // Use the updated array from backend
      }
    } catch (error) {
      console.error("Error saving path:", error);
    } finally {
      setLoadingPathId(null); // Optional: end loading
    }
  };

  if (!results) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.infoText}>You have already taken the test.</Text>
        <TouchableOpacity onPress={onRetake} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Retake Test</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Text style={styles.headerTitle}>🎯 Your Career Recommendations</Text>
      <Text style={styles.headerSubtitle}>Based on your profile as a <Text style={{ color: '#5badec', fontWeight: 'bold' }}>{careerStage}</Text></Text>

      <View style={styles.adviceCard}>
        <Ionicons name="bulb-outline" size={24} color="#5badec" style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.adviceTitle}>General Advice</Text>
          <Text style={styles.adviceText}>{results.generalAdvice}</Text>
        </View>
      </View>

      <FlatList<Recommendation>
        data={results.recommendations}
        keyExtractor={(item: Recommendation) => item.pathId}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }: { item: Recommendation }) => (
          <View style={styles.cardShadowWrap}>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.matchScoreBadge}>
                  <Ionicons name="star" size={16} color="#fff" style={{ marginRight: 2 }} />
                  <Text style={styles.matchScoreText}>{item.matchScore}%</Text>
                </View>
              </View>
              <Text style={styles.reason}>{item.reason}</Text>

              {item.improvementAreas && item.improvementAreas.length > 0 && (
                <View style={styles.improvementContainer}>
                  <Text style={styles.improvementTitle}>Areas to improve:</Text>
                  {item.improvementAreas.map((area: string, index: number) => (
                    <Text key={index} style={styles.improvementText}>• {area}</Text>
                  ))}
                </View>
              )}

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  onPress={() => handleSavePath(item.pathId)}
                  style={[
                    styles.saveButton,
                    savedPaths.includes(item.pathId) && styles.savedButton
                  ]}
                >
                  <Ionicons
                    name={savedPaths.includes(item.pathId) ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.saveButtonText}>
                    {savedPaths.includes(item.pathId) ? 'Saved' : 'Save Path'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.learnMoreButton}
                  onPress={() => router.push(`/path-info/${item.pathId}`)}
                >
                  <Text style={styles.learnMoreButtonText}>Learn More</Text>
                  <Ionicons name="arrow-forward" size={16} color="#5badec" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity onPress={onRetake} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Retake Test</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f7fbff',
    padding: 0,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fbff',
    padding: 24,
  },
  infoText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 30,
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center',
  },
  adviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f0fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#5badec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  adviceTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#5badec',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 15,
    color: '#333',
    fontStyle: 'italic',
  },
  cardShadowWrap: {
    marginHorizontal: 18,
    marginBottom: 22,
    shadowColor: '#5badec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 10,
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5badec',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 60,
    justifyContent: 'center',
  },
  matchScoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 2,
  },
  reason: {
    marginVertical: 10,
    fontStyle: 'italic',
    color: '#444',
    fontSize: 15,
  },
  improvementContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f7fbff',
    borderRadius: 8,
  },
  improvementTitle: {
    fontWeight: 'bold',
    color: '#5badec',
    marginBottom: 4,
  },
  improvementText: {
    color: '#333',
    fontSize: 14,
    marginLeft: 4,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5badec',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  savedButton: {
    backgroundColor: '#4CD964',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5badec',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  learnMoreButtonText: {
    color: '#5badec',
    fontWeight: 'bold',
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 20,
    marginHorizontal: 18,
    padding: 16,
    backgroundColor: '#5badec',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#5badec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default CareerResults;