import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { saveCareerPath, getCurrentUser } from '../lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

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
  const [loadingPathId, setLoadingPathId] = React.useState<string | null>(null);
  const [showFullAdvice, setShowFullAdvice] = React.useState<boolean>(false);
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
    setLoadingPathId(pathId);
    try {
      const result = await saveCareerPath(pathId);
      if (result.success) {
        setSavedPaths(result.savedPaths);
      }
    } catch (error) {
      console.error("Error saving path:", error);
    } finally {
      setLoadingPathId(null);
    }
  };

  if (!results) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyStateCard}>
          <Ionicons name="refresh-circle-outline" size={64} color="#5badec" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyStateTitle}>Ready for a Fresh Start?</Text>
          <Text style={styles.emptyStateText}>You've already taken the test. Retake it to get updated recommendations.</Text>
          <TouchableOpacity onPress={onRetake} style={styles.primaryButton}>
            <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Retake Test</Text>
          </TouchableOpacity>
          {/* Go Back Button */}
          <TouchableOpacity
            onPress={() => router.replace('/career-path')}
            style={styles.goBackButton}
          >
            <Ionicons name="arrow-back" size={20} color="#5badec" style={{ marginRight: 8 }} />
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const truncatedAdvice = results.generalAdvice.length > 120 
    ? results.generalAdvice.substring(0, 120) + '...' 
    : results.generalAdvice;

  return (
    <View style={styles.outerContainer}>
      {/* Header */}
      <Header
        title="Career Results"
        onBackPress={() => router.replace('/CareerSurvey')}
      />

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>🎯 Your Career Recommendations</Text>
        <Text style={styles.headerSubtitle}>
          Tailored for you as a <Text style={styles.stageHighlight}>{careerStage}</Text>
        </Text>
      </View>

      {/* General Advice - Compact Version */}
      <TouchableOpacity 
        style={styles.adviceCard} 
        onPress={() => setShowFullAdvice(!showFullAdvice)}
        activeOpacity={0.7}
      >
        <View style={styles.adviceHeader}>
          <View style={styles.adviceIconContainer}>
            <Ionicons name="bulb" size={20} color="#5badec" />
          </View>
          <Text style={styles.adviceTitle}>General Advice</Text>
          <Ionicons 
            name={showFullAdvice ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#5badec" 
          />
        </View>
        <Text style={styles.adviceText} numberOfLines={showFullAdvice ? undefined : 2}>
          {showFullAdvice ? results.generalAdvice : truncatedAdvice}
        </Text>
      </TouchableOpacity>

      {/* Recommendations Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Paths</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{results.recommendations.length}</Text>
        </View>
      </View>

      {/* Recommendations List - Takes up most space */}
      <FlatList<Recommendation>
        data={results.recommendations}
        keyExtractor={(item: Recommendation) => item.pathId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }: { item: Recommendation; index: number }) => (
          <View style={[styles.cardContainer, { marginTop: index === 0 ? 0 : 16 }]}>
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle} numberOfLines={5}>{item.title}</Text>
                  <View style={styles.matchScoreBadge}>
                    <Ionicons name="star" size={14} color="#fff" />
                    <Text style={styles.matchScoreText}>{item.matchScore}%</Text>
                  </View>
                </View>
              </View>

              {/* Reason */}
              <Text style={styles.reason} >{item.reason}</Text>

              {/* Improvement Areas */}
              {item.improvementAreas && item.improvementAreas.length > 0 && (
                <View style={styles.improvementContainer}>
                  <Text style={styles.improvementTitle}>Areas to focus on:</Text>
                  <View style={styles.improvementList}>
                    {item.improvementAreas.map((area: string, index: number) => (
                      <View key={index} style={styles.improvementTag}>
                        <Text style={styles.improvementText}>{area}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => handleSavePath(item.pathId)}
                  style={[
                    styles.saveButton,
                    savedPaths.includes(item.pathId) && styles.savedButton
                  ]}
                  disabled={loadingPathId === item.pathId}
                >
                  <Ionicons
                    name={savedPaths.includes(item.pathId) ? 'bookmark' : 'bookmark-outline'}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.saveButtonText}>
                    {loadingPathId === item.pathId ? 'Saving...' : 
                     savedPaths.includes(item.pathId) ? 'Saved' : 'Save'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.learnMoreButton}
                  onPress={() => router.push(`/path-info/${item.pathId}`)}
                >
                  <Text style={styles.learnMoreButtonText}>Learn More</Text>
                  <Ionicons name="arrow-forward" size={16} color="#5badec" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={onRetake} style={styles.retakeButton}>
          <Ionicons name="refresh" size={20} color="#5badec" style={{ marginRight: 8 }} />
          <Text style={styles.retakeButtonText}>Retake Assessment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#5badec',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    maxWidth: 300,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  stageHighlight: {
    color: '#5badec',
    fontWeight: '600',
  },
  adviceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#5badec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#5badec',
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adviceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  adviceText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  countBadge: {
    backgroundColor: '#5badec',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    shadowColor: '#5badec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5badec',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  matchScoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reason: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 12,
  },
  improvementContainer: {
    marginBottom: 16,
  },
  improvementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5badec',
    marginBottom: 8,
  },
  improvementList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  improvementTag: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  improvementText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5badec',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  savedButton: {
    backgroundColor: '#22c55e',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5badec',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  learnMoreButtonText: {
    color: '#5badec',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5badec',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
    shadowColor: '#5badec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#5badec',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  retakeButtonText: {
    color: '#5badec',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#5badec',
    marginTop: 12,
  },
  goBackButtonText: {
    color: '#5badec',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CareerResults;