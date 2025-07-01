// InterviewQuestions.tsx - Updated version
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
    category: string;
    talent: { id: string; fullname: string; careerStage: string };
    careerPath: { id: string; title: string } | null;
    generatedAt: string;
  };
}

const QUESTION_CATEGORIES = [
  { id: 'personal', name: 'Personal Background' },
  { id: 'career', name: 'Career Goals' },
  { id: 'company', name: 'Company Fit' },
  { id: 'technical', name: 'Technical Skills' },
  { id: 'behavioral', name: 'Behavioral' },
  { id: 'problem-solving', name: 'Problem Solving' },
  { id: 'teamwork', name: 'Teamwork' }
];

// In-memory storage for questions
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Update cache when state changes
  useEffect(() => {
    cachedQuestions = questions;
    cachedMetadata = responseMeta;
    cachedExpandedQuestions = expandedQuestions;
    cachedViewedAnswers = viewedAnswers;
    cachedShowTips = showTips;
  }, [questions, responseMeta, expandedQuestions, viewedAnswers, showTips]);

  const generateQuestions = async (category: string) => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to generate interview questions');
        return;
      }
      const response = await generateInterviewQuestionsWithRetry(user.talentId, category, 3);
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
    if (!selectedCategory) return;
    setRefreshing(true);
    await generateQuestions(selectedCategory);
    setRefreshing(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    generateQuestions(category);
  };

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
          {selectedCategory && (
            <TouchableOpacity style={styles.refreshButton} onPress={() => generateQuestions(selectedCategory)} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#5badec" />
              ) : (
                <Ionicons name="refresh" size={20} color="#5badec" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.subtitle}>Select a question category:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {QUESTION_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.selectedCategoryButtonText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {responseMeta && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{responseMeta.talent.fullname}</Text>
            <Text style={styles.userStage}>{responseMeta.talent.careerStage}</Text>
            {responseMeta.careerPath && <Text style={styles.careerPath}>{responseMeta.careerPath.title}</Text>}
            <Text style={styles.categoryLabel}>Category: {responseMeta.category}</Text>
          </View>
        )}

        {selectedCategory && !responseMeta && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Interview Preparation Tips</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>1.</Text>
              <Text style={styles.tipText}>Research the company and role thoroughly</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>2.</Text>
              <Text style={styles.tipText}>Practice your answers out loud</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>3.</Text>
              <Text style={styles.tipText}>Prepare examples that demonstrate your skills</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>4.</Text>
              <Text style={styles.tipText}>Dress appropriately for the interview</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>5.</Text>
              <Text style={styles.tipText}>Prepare thoughtful questions to ask the interviewer</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.questionsContainer}>
        {questions.map(renderQuestionCard)}
      </View>

      {!selectedCategory && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="brain" size={48} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>Select a question category</Text>
          <Text style={styles.emptyStateText}>Choose a category to generate personalized interview questions</Text>
        </View>
      )}

      {selectedCategory && questions.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="brain" size={48} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>No questions available</Text>
          <Text style={styles.emptyStateText}>Press refresh to generate questions for {QUESTION_CATEGORIES.find(c => c.id === selectedCategory)?.name}</Text>
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
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 12 },
  refreshButton: { padding: 8, borderRadius: 8, backgroundColor: '#eff6ff' },
  userInfo: { marginBottom: 16 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  userStage: { fontSize: 14, color: '#5badec', marginTop: 2 },
  careerPath: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  categoryLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginTop: 8 },
  categoriesContainer: { marginBottom: 16 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 8
  },
  selectedCategoryButton: {
    backgroundColor: '#5badec'
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#4b5563'
  },
  selectedCategoryButtonText: {
    color: '#fff'
  },
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
  tipsTitle: { fontSize: 14, fontWeight: '600', color: '#92400e', marginBottom: 8 },
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
});

export default InterviewQuestions;