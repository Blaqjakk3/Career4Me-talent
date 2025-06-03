import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  databases,
  config,
  getCurrentUser,
  getCareerPathById,
  Query,
  ID,
} from '../../lib/appwrite';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

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
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [freeResources, setFreeResources] = useState<FreeResource[]>([]);
  const [premiumResources, setPremiumResources] = useState<PremiumResource[]>([]);
  const [markingComplete, setMarkingComplete] = useState(false);

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

      // Load career path details
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
  const handleProjectClick = (project: Project) => {
  setSelectedProject(project);
  setProjectModalVisible(true);
    };

  const loadLearningData = async (careerPathId: string, userId: string) => {
    try {
      // Load learning stages with error handling
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

      // Load user progress with error handling
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

      // Load certifications with error handling
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

      // Load projects with error handling
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

  // Calculate stage progress
  const getStageProgress = (stageId: string): number => {
    const topics = topicsByStage[stageId] || [];
    if (topics.length === 0) return 0;

    const completedTopics = topics.filter(topic => userProgress[topic.$id]);
    return (completedTopics.length / topics.length) * 100;
  };

  // Handle topic click
  const handleTopicClick = async (topic: Topic) => {
    setSelectedTopic(topic);
    setModalVisible(true);

    try {
      // Load free resources for this topic with error handling
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

      // Load premium resources for the career path with error handling
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

  // Mark topic as complete
  const toggleTopicComplete = async () => {
    if (!selectedTopic || !user) return;

    setMarkingComplete(true);

    try {
      const isCurrentlyCompleted = userProgress[selectedTopic.$id];

      // Check if progress record already exists
      const existingProgress = await databases.listDocuments(
        config.databaseId,
        config.userProgessCollectionId,
        [
          Query.equal('userId', user.$id),
          Query.equal('topicId', selectedTopic.$id)
        ]
      );

      if (existingProgress.documents.length > 0) {
        if (isCurrentlyCompleted) {
          // Delete the record to unmark as complete
          await databases.deleteDocument(
            config.databaseId,
            config.userProgessCollectionId,
            existingProgress.documents[0].$id
          );
        } else {
          // Update existing record to mark as complete
          await databases.updateDocument(
            config.databaseId,
            config.userProgessCollectionId,
            existingProgress.documents[0].$id,
            { isCompleted: true }
          );
        }
      } else {
        // Create new record (only when marking as complete)
        if (!isCurrentlyCompleted) {
          await databases.createDocument(
            config.databaseId,
            config.userProgessCollectionId,
            ID.unique(),
            {
              userId: user.$id,
              topicId: selectedTopic.$id,
              isCompleted: true
            }
          );
        }
      }

      // Update local state
      setUserProgress(prev => ({
        ...prev,
        [selectedTopic.$id]: !isCurrentlyCompleted
      }));

      Alert.alert(
        'Success',
        isCurrentlyCompleted
          ? 'Topic unmarked as complete!'
          : 'Topic marked as complete!'
      );
      setModalVisible(false);
    } catch (error) {
      console.error('Error toggling topic completion:', error);
      Alert.alert('Error', 'Failed to update topic completion status');
    } finally {
      setMarkingComplete(false);
    }
  };


  // Handle resource link click
  const handleResourceClick = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
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

  // Render error state if no career path data
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
      {/* Header Section */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <TouchableOpacity
            className="p-2 rounded-full bg-gray-50"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-gray-800">Learning Roadmap and Resources</Text>
          </View>
          <View style={{ width: 40 }}>{/* Spacer */}</View>
        </View>
        <View style={styles.header}>
          {/* Tags */}
          {careerPath.tags && careerPath.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {careerPath.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{careerPath.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{careerPath.description}</Text>

          {/* Key Information */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Time to Complete</Text>
              <Text style={styles.infoValue}>{careerPath.time_to_complete}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Required Background</Text>
              <Text style={styles.infoValue}>{careerPath.required_background}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Learning Style</Text>
              <Text style={styles.infoValue}>{careerPath.learning_style.join(', ')}</Text>
            </View>
            {careerPath.suggestedDegrees && careerPath.suggestedDegrees.length > 0 && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Suggested Degrees</Text>
                <Text style={styles.infoValue}>{careerPath.suggestedDegrees.join(', ')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'learning' && styles.activeTab]}
            onPress={() => setActiveTab('learning')}
          >
            <Text style={[styles.tabText, activeTab === 'learning' && styles.activeTabText]}>
              📚 Learning Path
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'certifications' && styles.activeTab]}
            onPress={() => setActiveTab('certifications')}
          >
            <Text style={[styles.tabText, activeTab === 'certifications' && styles.activeTabText]}>
              🏆 Certifications
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
            onPress={() => setActiveTab('projects')}
          >
            <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>
              🚀 Projects
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'learning' && (
          <View style={styles.tabContent}>
            {learningStages.map((stage) => (
              <View key={stage.$id} style={styles.stageContainer}>
                <Text style={styles.stageTitle}>{stage.title}</Text>
                <Text style={styles.stageDescription}>{stage.description}</Text>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${getStageProgress(stage.$id)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(getStageProgress(stage.$id))}% Complete
                  </Text>
                </View>

                {/* Topics */}
                {topicsByStage[stage.$id]?.map((topic) => (
                  <TouchableOpacity
                    key={topic.$id}
                    style={[
                      styles.topicButton,
                      userProgress[topic.$id] && styles.completedTopic
                    ]}
                    onPress={() => handleTopicClick(topic)}
                  >
                    <View style={styles.topicContent}>
                      <Text style={[
                        styles.topicTitle,
                        userProgress[topic.$id] && styles.completedTopicText
                      ]}>
                        {userProgress[topic.$id] ? '✅ ' : ''}{topic.title}
                      </Text>
                      <Text style={styles.topicSubtitle}>
                        Click to view resources and learn more
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'certifications' && (
          <View style={styles.tabContent}>
            {certifications.map((cert) => (
              <TouchableOpacity
                key={cert.$id}
                style={styles.certificationCard}
                onPress={() => handleResourceClick(cert.link)}
              >
                <Text style={styles.certificationName}>{cert.name}</Text>
                <Text style={styles.certificationProvider}>Provider: {cert.provider}</Text>
                <Text style={styles.certificationDuration}>Duration: {cert.duration}</Text>
                <View style={styles.certificationFooter}>
                  <Text style={[
                    styles.certificationPrice,
                    cert.is_paid ? styles.paidText : styles.freeText
                  ]}>
                    {cert.is_paid ? 'Paid' : 'Free'}
                  </Text>
                  <Text style={styles.linkText}>Tap to open →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

       {activeTab === 'projects' && (
  <View style={styles.tabContent}>
    {projects.length === 0 ? (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No projects available for this career path yet.</Text>
      </View>
    ) : (
      projects.map((project) => (
        <TouchableOpacity
          key={project.$id}
          style={styles.projectButton}
          onPress={() => handleProjectClick(project)}
        >
          <View style={styles.projectButtonContent}>
            <Text style={styles.projectButtonTitle}>{project.title}</Text>
            <Text style={styles.projectButtonSubtitle} numberOfLines={2}>
              {project.description}
            </Text>
            <View style={styles.projectButtonFooter}>
              <View style={styles.projectButtonDetails}>
                <Text style={styles.projectButtonDetail}>
                  📊 {project.difficulty}
                </Text>
                <Text style={styles.projectButtonDetail}>
                  ⏱️ {project.estimatedDuration}
                </Text>
              </View>
              <Text style={styles.projectButtonArrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))
    )}
  </View>
)}

      </ScrollView>

      {/* Topic Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedTopic && (
              <>
                <Text style={styles.modalTitle}>{selectedTopic.title}</Text>
                <Text style={styles.modalDescription}>{selectedTopic.description}</Text>

                {/* Free Resources */}
                <View style={styles.resourceSection}>
                  <Text style={styles.resourceSectionTitle}>Free Resources</Text>
                  {freeResources.map((resource) => (
                    <TouchableOpacity
                      key={resource.$id}
                      style={styles.resourceItem}
                      onPress={() => handleResourceClick(resource.link)}
                    >
                      <View style={styles.resourceType}>
                        <Text style={styles.resourceTypeText}>{resource.type}</Text>
                      </View>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Premium Resources */}
                {premiumResources.length > 0 && (
                  <View style={styles.resourceSection}>
                    <Text style={styles.resourceSectionTitle}>Premium Resources</Text>
                    <Text style={styles.premiumNote}>
                      Premium resources available for all topics in this career path
                    </Text>
                    {premiumResources.map((resource) => (
                      <TouchableOpacity
                        key={resource.$id}
                        style={styles.resourceItem}
                        onPress={() => handleResourceClick(resource.link)}
                      >
                        <View style={[styles.resourceType, styles.premiumResourceType]}>
                          <Text style={styles.resourceTypeText}>{resource.type}</Text>
                        </View>
                        <Text style={styles.resourceTitle}>{resource.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Mark Complete Button */}
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    userProgress[selectedTopic.$id] && styles.completedButton
                  ]}
                  onPress={toggleTopicComplete}  // CHANGED: from markTopicComplete to toggleTopicComplete
                  disabled={markingComplete}     // CHANGED: removed the userProgress[selectedTopic.$id] condition
                >
                  {markingComplete ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.completeButtonText}>
                      {userProgress[selectedTopic.$id] ? 'Unmark as Complete' : 'Mark as Complete'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Project Modal */}
<Modal
  animationType="slide"
  transparent={false}
  visible={projectModalVisible}
  onRequestClose={() => setProjectModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setProjectModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>

    <ScrollView style={styles.modalContent}>
      {selectedProject && (
        <>
          <Text style={styles.modalTitle}>{selectedProject.title}</Text>
          <Text style={styles.modalDescription}>{selectedProject.description}</Text>

          {/* Project Overview Cards */}
          <View style={styles.overviewCardsContainer}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewCardEmoji}>📊</Text>
              <Text style={styles.overviewCardLabel}>Difficulty</Text>
              <Text style={styles.overviewCardValue}>{selectedProject.difficulty}</Text>
            </View>
            
            <View style={styles.overviewCard}>
              <Text style={styles.overviewCardEmoji}>⏱️</Text>
              <Text style={styles.overviewCardLabel}>Duration</Text>
              <Text style={styles.overviewCardValue}>{selectedProject.estimatedDuration}</Text>
            </View>
          </View>

          {/* Expected Outcome */}
          {selectedProject.outcome && (
            <View style={styles.outcomeSection}>
              <Text style={styles.outcomeSectionTitle}>🎯 Expected Outcome</Text>
              <Text style={styles.outcomeSectionText}>{selectedProject.outcome}</Text>
            </View>
          )}

          {/* Tools Section */}
          {selectedProject.tools && selectedProject.tools.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🛠️ Tools & Technologies</Text>
              <View style={styles.toolsContainer}>
                {selectedProject.tools.map((tool, index) => (
                  <View key={index} style={styles.toolChip}>
                    <Text style={styles.toolChipText}>{tool}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Prerequisites Section */}
          {selectedProject.prerequisites && selectedProject.prerequisites.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>📋 Prerequisites</Text>
              <View style={styles.listContainer}>
                {selectedProject.prerequisites.map((prerequisite, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemBullet}>•</Text>
                    <Text style={styles.listItemText}>{prerequisite}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Steps Section */}
          {selectedProject.steps && selectedProject.steps.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>📝 Project Steps</Text>
              <View style={styles.stepsContainer}>
                {selectedProject.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Evaluation Criteria Section */}
          {selectedProject.evaluationCriteria && selectedProject.evaluationCriteria.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>✅ Evaluation Criteria</Text>
              <View style={styles.listContainer}>
                {selectedProject.evaluationCriteria.map((criteria, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemBullet}>•</Text>
                    <Text style={styles.listItemText}>{criteria}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.startProjectButton}
            onPress={() => {
              setProjectModalVisible(false);
              // Add your project start logic here
              Alert.alert('Project Started', 'Good luck with your project!');
            }}
          >
            <Text style={styles.startProjectButtonText}>🚀 Start This Project</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  </View>
</Modal>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#5badec',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5badec',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#5badec',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  stageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stageDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5badec',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  topicButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  completedTopic: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedTopicText: {
    color: '#4caf50',
  },
  topicSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  certificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  certificationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  certificationProvider: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  certificationDuration: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  certificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certificationPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  paidText: {
    color: '#e74c3c',
  },
  freeText: {
    color: '#27ae60',
  },
  linkText: {
    fontSize: 14,
    color: '#5badec',
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  projectDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  projectDetailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5badec',
    marginRight: 8,
  },
  projectDetailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  // projectSection and projectSectionTitle definitions intentionally omitted to avoid duplicates
  projectSectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },
  resourceSection: {
    marginBottom: 24,
  },
  resourceSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  premiumNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resourceType: {
    backgroundColor: '#5badec',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  premiumResourceType: {
    backgroundColor: '#ff9800',
  },
  resourceTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#5badec',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  completedButton: {
    backgroundColor: '#4caf50',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
   projectButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  projectButtonContent: {
    flex: 1,
  },
  projectButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  projectButtonSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectButtonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectButtonDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  projectButtonDetail: {
    fontSize: 12,
    color: '#5badec',
    fontWeight: '600',
  },
  projectButtonArrow: {
    fontSize: 18,
    color: '#5badec',
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Project modal styles
  projectDetailsGrid: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  projectDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  // projectSection and projectSectionTitle definitions intentionally omitted to avoid duplicates
  toolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toolChipText: {
    color: '#5badec',
    fontSize: 14,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listItemBullet: {
    fontSize: 16,
    color: '#5badec',
    marginRight: 8,
    marginTop: 2,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    backgroundColor: '#5badec',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  startProjectButton: {
    backgroundColor: '#5badec',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  startProjectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
   overviewCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  overviewCardEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  overviewCardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  overviewCardValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  outcomeSection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  outcomeSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  outcomeSectionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  listContainer: {
    gap: 8,
  },
  stepsContainer: {
    gap: 12,
  },

  
});

export default Learning;