import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { databases, config, Query } from '../lib/appwrite';

// Types
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

interface User {
  $id: string;
  selectedPath?: string;
}

interface TopicModalProps {
  visible: boolean;
  onClose: () => void;
  topic: Topic | null;
  freeResources: FreeResource[];
  premiumResources: PremiumResource[];
  userProgress: Record<string, boolean>;
  setUserProgress: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  user: User | null;
}

const TopicModal: React.FC<TopicModalProps> = ({
  visible,
  onClose,
  topic,
  freeResources,
  premiumResources,
  userProgress,
  setUserProgress,
  user,
}) => {
  const [markingComplete, setMarkingComplete] = useState(false);

  if (!topic) return null;

  const isCompleted = userProgress[topic.$id] || false;

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return (props: any) => <Ionicons name="play-circle-outline" {...props} />;
      case 'article':
      case 'blog':
        return (props: any) => <Feather name="file-text" {...props} />;
      case 'documentation':
      case 'docs':
        return (props: any) => <Feather name="book-open" {...props} />;
      case 'course':
        return (props: any) => <FontAwesome name="star" {...props} />;
      default:
        return (props: any) => <Feather name="globe" {...props} />;
    }
  };

  const handleResourceClick = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const toggleTopicCompletion = async () => {
    if (!user) return;

    setMarkingComplete(true);
    try {
      const newCompletionStatus = !isCompleted;

      if (newCompletionStatus) {
        await databases.createDocument(
          config.databaseId,
          config.userProgessCollectionId,
          'unique()',
          {
            userId: user.$id,
            topicId: topic.$id,
            isCompleted: true,
          }
        );
      } else {
        const progressResponse = await databases.listDocuments(
          config.databaseId,
          config.userProgessCollectionId,
          [
            Query.equal('userId', user.$id),
            Query.equal('topicId', topic.$id)
          ]
        );

        if (progressResponse.documents.length > 0) {
          await databases.deleteDocument(
            config.databaseId,
            config.userProgessCollectionId,
            progressResponse.documents[0].$id
          );
        }
      }

      setUserProgress(prev => ({
        ...prev,
        [topic.$id]: newCompletionStatus,
      }));
    } catch (error) {
      console.error('Error updating topic completion:', error);
      Alert.alert('Error', 'Unable to update topic completion status');
    } finally {
      setMarkingComplete(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Feather name="x" size={22} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{topic.title}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topicSection}>
            <Text style={styles.topicDescription}>{topic.description}</Text>

            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, isCompleted && styles.completedStatusBadge]}>
                <Text style={[styles.statusText, isCompleted && styles.completedStatusText]}>
                  {markingComplete ? 'Updating...' : isCompleted ? 'Completed' : 'Not Started'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.completionToggleButton,
                isCompleted ? styles.completedButton : styles.incompleteButton,
              ]}
              onPress={toggleTopicCompletion}
              disabled={markingComplete}
              activeOpacity={0.8}
            >
              <Text style={styles.completionButtonText}>
                {markingComplete
                  ? 'Updating...'
                  : isCompleted
                  ? 'Mark as Incomplete'
                  : 'Mark as Completed'}
              </Text>
            </TouchableOpacity>
          </View>

          {freeResources.length > 0 && (
            <View style={styles.resourceSection}>
              <Text style={styles.sectionTitle}>Free Resources</Text>
              <View style={styles.resourceGrid}>
                {freeResources.map((resource) => {
                  const IconComponent = getResourceIcon(resource.type);
                  return (
                    <TouchableOpacity
                      key={resource.$id}
                      style={styles.compactResourceItem}
                      onPress={() => handleResourceClick(resource.link)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.resourceIconContainer}>
                        <IconComponent size={16} color="#5badec" />
                      </View>
                      <View style={styles.compactResourceContent}>
                        <Text style={styles.compactResourceTitle} numberOfLines={2}>
                          {resource.title}
                        </Text>
                        <View style={styles.compactResourceMeta}>
                          <Text style={styles.compactResourceType}>{resource.type}</Text>
                          <View style={styles.compactFreeBadge}>
                            <Text style={styles.compactFreeText}>Free</Text>
                          </View>
                        </View>
                      </View>
                      <Feather name="external-link" size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {premiumResources.length > 0 && (
            <View style={styles.resourceSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Premium Resources</Text>
                <View style={styles.premiumIndicator}>
                  <FontAwesome name="star" size={12} color="#f59e0b" />
                </View>
              </View>
              <View style={styles.resourceGrid}>
                {premiumResources.map((resource) => {
                  const IconComponent = getResourceIcon(resource.type);
                  return (
                    <TouchableOpacity
                      key={resource.$id}
                      style={[styles.compactResourceItem, styles.premiumResourceItem]}
                      onPress={() => handleResourceClick(resource.link)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.resourceIconContainer}>
                        <IconComponent size={16} color="#f59e0b" />
                      </View>
                      <View style={styles.compactResourceContent}>
                        <Text style={styles.compactResourceTitle} numberOfLines={2}>
                          {resource.title}
                        </Text>
                        <View style={styles.compactResourceMeta}>
                          <Text style={styles.compactResourceType}>{resource.type}</Text>
                          <View style={styles.compactPremiumBadge}>
                            <Text style={styles.compactPremiumText}>Premium</Text>
                          </View>
                        </View>
                      </View>
                      <Feather name="external-link" size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {freeResources.length === 0 && premiumResources.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="book-open" size={32} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Resources Yet</Text>
              <Text style={styles.emptyText}>Resources are being prepared for this topic</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  closeButton: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },

  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  topicSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  topicDescription: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  statusRow: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedStatusBadge: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  completedStatusText: {
    color: '#16a34a',
  },
  completionToggleButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#dcfce7',
  },
  incompleteButton: {
    backgroundColor: '#e5e7eb',
  },
  completionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resourceSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  premiumIndicator: {
    backgroundColor: '#fef3c7',
    padding: 4,
    borderRadius: 8,
  },
  resourceGrid: {
    gap: 8,
  },
  compactResourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
    gap: 10,
  },
  premiumResourceItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  resourceIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactResourceContent: {
    flex: 1,
  },
  compactResourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  compactResourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactResourceType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  compactFreeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  compactFreeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16a34a',
  },
  compactPremiumBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  compactPremiumText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f59e0b',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default TopicModal;
