import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { generateInterviewQuestionsWithRetry } from '@/lib/gemini';
import { getCurrentUser } from '@/lib/appwrite';

interface InterviewQuestion {
  id: number;
  question: string;
  answer: string;
  tips: string[];
}

interface InterviewQuestionsResponse {
  questions: InterviewQuestion[];
  metadata: {
    totalQuestions: number;
    talent: { id: string; fullname: string; careerStage: string };
    careerPath: { id: string; title: string } | null;
    generatedAt: string;
  };
}

// In-memory storage for questions (you could also use AsyncStorage for persistence)
let cachedQuestions: InterviewQuestion[] = [];
let cachedMetadata: InterviewQuestionsResponse['metadata'] | null = null;
let cachedExpandedQuestions: Set<number> = new Set();
let cachedViewedAnswers: Set<number> = new Set();
let cachedShowTips: Set<number> = new Set();

const InterviewQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(cachedQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(cachedExpandedQuestions);
  const [viewedAnswers, setViewedAnswers] = useState<Set<number>>(cachedViewedAnswers);
  const [showTips, setShowTips] = useState<Set<number>>(cachedShowTips);
  const [responseMeta, setResponseMeta] = useState<InterviewQuestionsResponse['metadata'] | null>(cachedMetadata);
  const [refreshing, setRefreshing] = useState(false);

  // Update cache when state changes
  useEffect(() => {
    cachedQuestions = questions;
    cachedMetadata = responseMeta;
    cachedExpandedQuestions = expandedQuestions;
    cachedViewedAnswers = viewedAnswers;
    cachedShowTips = showTips;
  }, [questions, responseMeta, expandedQuestions, viewedAnswers, showTips]);

  const generateQuestions = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to generate interview questions');
        return;
      }
      const response = await generateInterviewQuestionsWithRetry(user.talentId, 3);
      setQuestions(response.questions);
      setResponseMeta(response.metadata);
      // Reset UI state for new questions
      setExpandedQuestions(new Set());
      setViewedAnswers(new Set());
      setShowTips(new Set());
    } catch (error) {
      console.error('Error generating questions:', error);
      Alert.alert('Error', 'Failed to generate interview questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSet = (set: Set<number>, setFunction: React.Dispatch<React.SetStateAction<Set<number>>>, index: number) => {
    const newSet = new Set(set);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setFunction(newSet);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await generateQuestions();
    setRefreshing(false);
  };

  // Remove the automatic generation on mount
  // useEffect(() => { generateQuestions(); }, []);

  if (isLoading && questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5badec" />
        <Text style={styles.loadingText}>Generating your interview questions...</Text>
      </View>
    );
  }

  const renderQuestionCard = (question: InterviewQuestion, index: number) => {
    const isExpanded = expandedQuestions.has(index);
    const hasViewedAnswer = viewedAnswers.has(index);
    const showQuestionTips = showTips.has(index);

    return (
      <View key={question.id} style={styles.questionCard}>
        <TouchableOpacity style={styles.questionHeader} onPress={() => toggleSet(expandedQuestions, setExpandedQuestions, index)} activeOpacity={0.7}>
          <View style={styles.questionContent}>
            <Text style={styles.questionNumber}>Q{question.id}</Text>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>
          <View style={styles.questionActions}>
            {hasViewedAnswer && <Ionicons name="eye-outline" size={16} color="#10b981" style={styles.viewedIcon} />}
            {isExpanded ? (
              <Ionicons name="chevron-up" size={20} color="#6b7280" />
            ) : (
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.answerContainer}>
            <TouchableOpacity style={styles.tipsToggle} onPress={() => toggleSet(showTips, setShowTips, index)}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color="#f59e0b" />
              <Text style={styles.tipsToggleText}>{showQuestionTips ? 'Hide Tips' : 'Show Tips'}</Text>
            </TouchableOpacity>

            {showQuestionTips && (
              <View style={styles.tipsContainer}>
                {question.tips.map((tip, tipIndex) => (
                  <View key={tipIndex} style={styles.tipItem}>
                    <Text style={styles.tipNumber}>{tipIndex + 1}.</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.answerHeader}>
              <Text style={styles.answerTitle}>Sample Answer:</Text>
              {!hasViewedAnswer && (
                <TouchableOpacity style={styles.viewAnswerButton} onPress={() => toggleSet(viewedAnswers, setViewedAnswers, index)}>
                  <Ionicons name="eye-off-outline" size={16} color="#6b7280" />
                  <Text style={styles.viewAnswerText}>View Answer</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {hasViewedAnswer ? (
              <Text style={styles.answerText}>{question.answer}</Text>
            ) : (
              <TouchableOpacity style={styles.revealButton} onPress={() => toggleSet(viewedAnswers, setViewedAnswers, index)}>
                <Text style={styles.revealButtonText}>Tap to reveal sample answer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitle}>
            <MaterialCommunityIcons name="brain" size={24} color="#5badec" />
            <Text style={styles.title}>Interview Practice</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={generateQuestions} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#5badec" />
            ) : (
              <Ionicons name="refresh" size={20} color="#5badec" />
            )}
          </TouchableOpacity>
        </View>

        {responseMeta && (
          <>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{responseMeta.talent.fullname}</Text>
              <Text style={styles.userStage}>{responseMeta.talent.careerStage}</Text>
              {responseMeta.careerPath && <Text style={styles.careerPath}>{responseMeta.careerPath.title}</Text>}
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{responseMeta.totalQuestions}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{viewedAnswers.size}</Text>
                <Text style={styles.statLabel}>Viewed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{showTips.size}</Text>
                <Text style={styles.statLabel}>Tips Shown</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.questionsContainer}>
        {questions.map(renderQuestionCard)}
      </View>

      {questions.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="brain" size={48} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>No questions available</Text>
          <Text style={styles.emptyStateText}>Generate personalized interview questions based on your profile</Text>
          <TouchableOpacity style={styles.generateButton} onPress={generateQuestions}>
            <Text style={styles.generateButtonText}>Generate Questions</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 },
  loadingText: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginTop: 16, textAlign: 'center' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1f2937', marginLeft: 8 },
  refreshButton: { padding: 8, borderRadius: 8, backgroundColor: '#eff6ff' },
  userInfo: { marginBottom: 16 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  userStage: { fontSize: 14, color: '#5badec', marginTop: 2 },
  careerPath: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  questionsContainer: { padding: 16 },
  questionCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: 'hidden' },
  questionHeader: { flexDirection: 'row', padding: 16, alignItems: 'flex-start' },
  questionContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  questionNumber: { fontSize: 14, fontWeight: '700', color: '#5badec', marginRight: 12, marginTop: 2, minWidth: 24 },
  questionText: { fontSize: 16, fontWeight: '600', color: '#1f2937', lineHeight: 22, flex: 1 },
  questionActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  viewedIcon: { marginRight: 8 },
  answerContainer: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  tipsToggle: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginTop: 8 },
  tipsToggleText: { fontSize: 14, fontWeight: '500', color: '#f59e0b', marginLeft: 8 },
  tipsContainer: { backgroundColor: '#fffbeb', borderRadius: 8, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  tipItem: { flexDirection: 'row', marginBottom: 8 },
  tipNumber: { fontSize: 12, fontWeight: '600', color: '#92400e', marginRight: 8, marginTop: 1 },
  tipText: { fontSize: 12, color: '#92400e', lineHeight: 16, flex: 1 },
  answerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  answerTitle: { fontSize: 14, fontWeight: '600', color: '#374151' },
  viewAnswerButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f3f4f6' },
  viewAnswerText: { fontSize: 12, color: '#6b7280', marginLeft: 4, fontWeight: '500' },
  answerText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  revealButton: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 8, alignItems: 'center' },
  revealButtonText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginTop: 16 },
  emptyStateText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  generateButton: { backgroundColor: '#5badec', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  generateButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default InterviewQuestions;