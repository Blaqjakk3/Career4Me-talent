import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  databases,
  config,
  getCurrentUser,
  getCareerPathById,
  Query,
} from '../../lib/appwrite';
import { router } from 'expo-router';
import Header from '@/components/Header';

// Import components
import CareerPathInfo from '@/components/CareerPathInfo';
import TabNavigation from '@/components/TabNavigation';
import LearningContent from '@/components/LearningContent';
import TopicModal from '@/components/TopicModal';
import ProjectModal from '@/components/ProjectModal';

// Types
interface CareerPath {
  $id: string;
  title: string;
  description: string;
  tags: string[];
  time_to_complete: string;
  required_background: string;
  learning_style: string[];
  suggestedDegrees: string[];
}

interface LearningStage {
  $id: string;
  title: string;
  description: string;
  order: number;
  careerPathId: string;
}

interface Topic {
  $id: string;
  title: string;
  description: string;
  order: number;
  learning_stageId: string;
}

interface FreeResource {
  $id: string;
  title: string;
  type: string;
  link: string;
  topicId: string;
}

interface PremiumResource {
  $id: string;
  title: string;
  type: string;
  link: string;
  careerPathId: string;
}

interface Certification {
  $id: string;
  name: string;
  provider: string;
  link: string;
  is_paid: boolean;
  duration: string;
  careerPathId: string;
}

interface Project {
  $id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedDuration: string;
  tools: string[];
  prerequisites: string[];
  careerPathId: string;
  outcome: string;
  steps: string[];
  evaluationCriteria: string[];
}

interface UserProgress {
  $id: string;
  userId: string;
  topicId: string;
  isCompleted: boolean;
}

interface User {
  $id: string;
  selectedPath?: string;
}

const Learning = () => {
  // State Management
  const [user, setUser] = useState<User | null>(null);
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [learningStages, setLearningStages] = useState<LearningStage[]>([]);
  const [topicsByStage, setTopicsByStage] = useState<Record<string, Topic[]>>({});
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'learning' | 'certifications' | 'projects'>('learning');

  // Modal States
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [freeResources, setFreeResources] = useState<FreeResource[]>([]);
  const [premiumResources, setPremiumResources] = useState<PremiumResource[]>([]);

  // Load initial data
  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        Alert.alert('Error', 'Please sign in to view your learning pathway');
        return;
      }

      setUser(currentUser);

      if (!currentUser.selectedPath) {
        setLoading(false);
        return;
      }

      const pathData = await getCareerPathById(currentUser.selectedPath);
      if (pathData) {
        setCareerPath({
          $id: pathData.$id,
          title: pathData.title,
          description: pathData.description,
          tags: pathData.tags,
          time_to_complete: pathData.time_to_complete,
          required_background: pathData.required_background,
          learning_style: pathData.learning_style,
          suggestedDegrees: pathData.suggestedDegrees,
        });
        await loadLearningData(currentUser.selectedPath, currentUser.$id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load learning pathway data');
    } finally {
      setLoading(false);
    }
  };

  const loadLearningData = async (careerPathId: string, userId: string) => {
    try {
      // Load learning stages
      try {
        const stagesResponse = await databases.listDocuments(
          config.databaseId,
          config.learningStagesId,
          [
            Query.equal('careerPathId', careerPathId),
            Query.orderAsc('order'),
            Query.limit(100)
          ]
        );
        setLearningStages(
          stagesResponse.documents.map((doc: any) => ({
            $id: doc.$id,
            title: doc.title,
            description: doc.description,
            order: doc.order,
            careerPathId: doc.careerPathId,
          })) as LearningStage[]
        );

        // Load topics for each stage
        const topicsMap: Record<string, Topic[]> = {};
        for (const stage of stagesResponse.documents) {
          try {
            const topicsResponse = await databases.listDocuments(
              config.databaseId,
              config.topicsCollectionId,
              [
                Query.equal('learning_stageId', stage.$id),
                Query.orderAsc('order'),
                Query.limit(100)
              ]
            );
            topicsMap[stage.$id] = topicsResponse.documents.map((doc: any) => ({
              $id: doc.$id,
              title: doc.title,
              description: doc.description,
              order: doc.order,
              learning_stageId: doc.learning_stageId,
            })) as Topic[];
          } catch (topicError) {
            console.warn(`Error loading topics for stage ${stage.$id}:`, topicError);
            topicsMap[stage.$id] = [];
          }
        }
        setTopicsByStage(topicsMap);
      } catch (stagesError) {
        console.warn('Error loading learning stages:', stagesError);
        setLearningStages([]);
      }

      // Load user progress
      try {
        const progressResponse = await databases.listDocuments(
          config.databaseId,
          config.userProgessCollectionId,
          [
            Query.equal('userId', userId),
            Query.limit(1000)
          ]
        );

        const progressMap: Record<string, boolean> = {};
        progressResponse.documents.forEach((progress: any) => {
          progressMap[progress.topicId] = progress.isCompleted;
        });
        setUserProgress(progressMap);
      } catch (progressError) {
        console.warn('Error loading user progress:', progressError);
        setUserProgress({});
      }

      // Load certifications
      try {
        const certificationsResponse = await databases.listDocuments(
          config.databaseId,
          config.certificationsCollectionId,
          [
            Query.equal('careerPathId', careerPathId),
            Query.limit(100)
          ]
        );
        setCertifications(
          certificationsResponse.documents.map((doc: any) => ({
            $id: doc.$id,
            name: doc.name,
            provider: doc.provider,
            link: doc.link,
            is_paid: doc.is_paid,
            duration: doc.duration,
            careerPathId: doc.careerPathId,
          }))
        );
      } catch (certError) {
        console.warn('Error loading certifications:', certError);
        setCertifications([]);
      }

      // Load projects
      try {
        const projectsResponse = await databases.listDocuments(
          config.databaseId,
          config.projectsCollectionId,
          [
            Query.equal('careerPathId', careerPathId),
            Query.limit(100)
          ]
        );
        setProjects(
          projectsResponse.documents.map((doc: any) => ({
            $id: doc.$id,
            title: doc.title,
            description: doc.description,
            difficulty: doc.difficulty,
            estimatedDuration: doc.estimatedDuration,
            tools: doc.tools,
            prerequisites: doc.prerequisites,
            careerPathId: doc.careerPathId,
            outcome: doc.outcome,
            steps: doc.steps,
            evaluationCriteria: doc.evaluationCriteria,
          }))
        );
      } catch (projectError) {
        console.warn('Error loading projects:', projectError);
        setProjects([]);
      }

    } catch (error) {
      console.error('Error loading learning data:', error);
      Alert.alert(
        'Permission Error',
        'Unable to load learning data. Please contact support if this issue persists.',
        [{ text: 'OK' }]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleTopicClick = async (topic: Topic) => {
    setSelectedTopic(topic);
    setTopicModalVisible(true);

    try {
      // Load free resources
      try {
        const freeResourcesResponse = await databases.listDocuments(
          config.databaseId,
          config.freeResourcesCollectionId,
          [
            Query.equal('topicId', topic.$id),
            Query.limit(100)
          ]
        );
        setFreeResources(
          freeResourcesResponse.documents.map((doc: any) => ({
            $id: doc.$id,
            title: doc.title,
            type: doc.type,
            link: doc.link,
            topicId: doc.topicId,
          }))
        );
      } catch (freeResourceError) {
        console.warn('Error loading free resources:', freeResourceError);
        setFreeResources([]);
      }

      // Load premium resources
      if (careerPath) {
        try {
          const premiumResourcesResponse = await databases.listDocuments(
            config.databaseId,
            config.premiumResourcesCollectionId,
            [
              Query.equal('careerPathId', careerPath.$id),
              Query.limit(100)
            ]
          );
          setPremiumResources(
            premiumResourcesResponse.documents.map((doc: any) => ({
              $id: doc.$id,
              title: doc.title,
              type: doc.type,
              link: doc.link,
              careerPathId: doc.careerPathId,
            }))
          );
        } catch (premiumResourceError) {
          console.warn('Error loading premium resources:', premiumResourceError);
          setPremiumResources([]);
        }
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      Alert.alert('Error', 'Unable to load resources for this topic');
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setProjectModalVisible(true);
  };

  const handleBackPress = () => {
    router.back();
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5badec" />
        <Text style={styles.loadingText}>Loading your learning pathway...</Text>
      </View>
    );
  }

  // Render no selected path state
  if (!user?.selectedPath) {
    return (
      <View style={styles.noPathContainer}>
        <Text style={styles.noPathText}>
          Please take the career assessment test or select a career path to view your learning pathway
        </Text>
      </View>
    );
  }

  // Render error state
  if (!careerPath) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load career path data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Learning Pathway" onBackPress={handleBackPress} />
        
        <CareerPathInfo careerPath={careerPath} />
        
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <LearningContent
          activeTab={activeTab}
          learningStages={learningStages}
          topicsByStage={topicsByStage}
          userProgress={userProgress}
          certifications={certifications}
          projects={projects}
          onTopicClick={handleTopicClick}
          onProjectClick={handleProjectClick}
        />
      </ScrollView>

      <TopicModal
        visible={topicModalVisible}
        onClose={() => setTopicModalVisible(false)}
        topic={selectedTopic}
        freeResources={freeResources}
        premiumResources={premiumResources}
        userProgress={userProgress}
        setUserProgress={setUserProgress}
        user={user}
      />

      <ProjectModal
        visible={projectModalVisible}
        onClose={() => setProjectModalVisible(false)}
        project={selectedProject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noPathContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  noPathText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#e74c3c',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#5badec',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Learning;