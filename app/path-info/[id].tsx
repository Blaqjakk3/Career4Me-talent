import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { databases, config, getCurrentUser, saveCareerPath, isCareerPathSaved, selectCareerPath, isCareerPathSelected } from '@/lib/appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';

interface CareerPath {
  $id: string;
  title: string;
  industry: string;
  requiredSkills: string[];
  requiredInterests: string[];
  requiredCertifications: string[];
  suggestedDegrees: string[];
  minSalary: number;
  maxSalary: number;
  description: string;
  jobOutlook: string;
  dayToDayResponsibilities: string[];
  toolsAndTechnologies: string[];
  careerProgression: string[];
  typicalEmployers: string[];
}

interface ListItemProps {
  text: string;
}

interface TagProps {
  text: string;
  type?: "default" | "primary" | "secondary";
}

interface ProgressStepProps {
  title: string;
  isLast: boolean;
  index: number;
}

interface CardProps {
  title: string;
  children: React.ReactNode;
}

interface SalaryDetailModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ConfirmToastProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PathInfo: React.FC = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id as string | undefined;

  const [data, setData] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [salaryModalVisible, setSalaryModalVisible] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState<boolean>(false);
  const [isSelectingPath, setIsSelectingPath] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    const fetchCareerPath = async () => {
      if (!id) {
        console.error("ID is not available.");
        setLoading(false);
        return;
      }

      try {
        const res = await databases.getDocument(
          config.databaseId,
          config.careerPathsCollectionId,
          id
        );
        setData(res as CareerPath);
        
        // Check if career path is saved and selected
        const [saved, selected] = await Promise.all([
          isCareerPathSaved(id),
          isCareerPathSelected(id)
        ]);
        setIsSaved(saved);
        setIsSelected(selected);
      } catch (error) {
        console.error("Error fetching career path:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerPath();
  }, [id]);

  const handleBookmark = async () => {
    if (!id) return;
    
    setIsBookmarkLoading(true);
    try {
      const result = await saveCareerPath(id);
      if (result.success) {
        setIsSaved(result.isSaved);
        
        // Show appropriate toast message based on whether the path was saved or removed
        Toast.show({
          type: result.isSaved ? 'success' : 'success', // Both use success type for consistency
          text1: result.isSaved ? `${data?.title} saved to Bookmarks` : `${data?.title} removed from Bookmarks`,
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error("Failed to save career path:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update bookmarks',
      });
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleSelectPath = async () => {
    if (!data) return;
    
    try {
      // Get current user to check for currently selected path
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'You must be logged in to select a career path',
        });
        return;
      }
      
      if (isSelected) {
        // Show confirmation for leaving the path
        Toast.show({
          type: 'info',
          position: 'bottom',
          text1: 'Confirm Career Change',
          text2: `Do you want to leave ${data.title} as your career path?`,
          props: {
            onConfirm: () => confirmPathSelection(true),
            onCancel: () => Toast.hide(),
          },
          visibilityTime: 6000,
          autoHide: true,
        });
      } else if (currentUser.selectedPath) {
        // User is changing from one path to another
        // Fetch the current path's details
        try {
          const currentPathDetails = await databases.getDocument(
            config.databaseId,
            config.careerPathsCollectionId,
            currentUser.selectedPath
          );
          
          // Show confirmation dialog for changing paths
          Toast.show({
            type: 'info',
            position: 'bottom',
            text1: 'Change Career Path',
            text2: `Do you want to change your career path from ${currentPathDetails.title} to ${data.title}?`,
            props: {
              onConfirm: () => confirmPathSelection(false),
              onCancel: () => Toast.hide(),
            },
            visibilityTime: 6000,
            autoHide: true,
          });
        } catch (error) {
          // If can't fetch current path details, show generic message
          Toast.show({
            type: 'info',
            position: 'bottom',
            text1: 'Change Career Path',
            text2: `Do you want to change your current career path to ${data.title}?`,
            props: {
              onConfirm: () => confirmPathSelection(false),
              onCancel: () => Toast.hide(),
            },
            visibilityTime: 6000,
            autoHide: true,
          });
        }
      } else {
        // No path currently selected, standard confirmation
        Toast.show({
          type: 'info',
          position: 'bottom',
          text1: 'Confirm Career Selection',
          text2: `Do you want to select ${data.title} as your career path?`,
          props: {
            onConfirm: () => confirmPathSelection(false),
            onCancel: () => Toast.hide(),
          },
          visibilityTime: 6000,
          autoHide: true,
        });
      }
    } catch (error) {
      console.error("Error in handleSelectPath:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to process your request. Please try again.',
      });
    }
  };

 const confirmPathSelection = async (isDeselecting: boolean) => {
  if (!id || !data) return;
  setIsSelectingPath(true);
  
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to select a career path',
      });
      return;
    }
    
    if (isDeselecting) {
      // Deselect the path
      await databases.updateDocument(
        config.databaseId,
        config.talentsCollectionId,
        currentUser.$id,
        { selectedPath: null }
      );
      setIsSelected(false);
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: `You have left ${data.title} as your career path`,
        visibilityTime: 4000,
      });
    } else {
      // Select the path
      await selectCareerPath(id);
      setIsSelected(true);
      setShowConfetti(true);
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: `You have selected ${data.title} as your career path`,
        visibilityTime: 4000,
      });
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  } catch (error) {
    console.error("Error selecting career path:", error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to update career path. Please try again.',
    });
  } finally {
    setIsSelectingPath(false);
  }
};

  if (loading) {
    return (
      <View style={{ 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
      }}>
        <ActivityIndicator size="large" color="#5badec" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 16,
      }}>
        <Text style={{ 
          fontSize: 18,
          fontWeight: '600',
          color: '#EF4444',
          marginBottom: 8,
        }}>Error loading career path.</Text>
        <Text>Debug ID: {id}</Text>
        <TouchableOpacity
          style={{ 
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: '#5badec',
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ 
            color: 'white',
            fontWeight: '500',
          }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatSalary = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const extractGrowthPercentage = (): string => {
    const percentMatch = data.jobOutlook.match(/\d+(\.\d+)?%/);
    return percentMatch ? percentMatch[0] : 'N/A';
  };
  
  const formatGrowthRate = (): string => {
    return `Growth: ${extractGrowthPercentage()}`;
  };

  const getGrowthColor = (): string => {
    const percentStr = extractGrowthPercentage();
    if (percentStr === 'N/A') return '#D97706';
    
    const percentValue = parseFloat(percentStr);
    if (percentValue >= 7) {
      return '#16A34A';
    } else if (percentValue >= 3) {
      return '#65A30D';
    } else if (percentValue > 0) {
      return '#D97706';
    } else {
      return '#DC2626';
    }
  };

  const Card: React.FC<CardProps> = ({ title, children }) => (
    <View 
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
      }}>{title}</Text>
      {children}
    </View>
  );

  const ListItem: React.FC<ListItemProps> = ({ text }) => (
    <View style={{
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'flex-start',
    }}>
      <Text style={{
        fontSize: 14,
        color: '#6B7280',
        marginRight: 8,
        marginTop: -2,
      }}>•</Text>
      <Text style={{
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
        lineHeight: 20,
      }}>{text}</Text>
    </View>
  );

  const Tag: React.FC<TagProps> = ({ text, type = "default" }) => {
    const tagStyle = {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 9999,
      alignSelf: 'flex-start' as const,
      backgroundColor: type === "primary" ? 'rgba(91, 173, 236, 0.2)' :
                      type === "secondary" ? 'rgba(91, 173, 236, 0.15)' :
                      '#F3F4F6',
      margin: 4,
    };

    const textStyle = {
      fontSize: 12,
      fontWeight: '500' as const,
      color: type === "primary" ? '#5badec' :
             type === "secondary" ? '#5badec' :
             '#4B5563',
    };

    return (
      <View style={tagStyle}>
        <Text style={textStyle}>{text}</Text>
      </View>
    );
  };

  const ProgressStep: React.FC<ProgressStepProps> = ({ title, isLast, index }) => (
    <View style={{
      flexDirection: 'row',
      marginBottom: 16,
    }}>
      <View style={{
        alignItems: 'center',
        marginRight: 12,
      }}>
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#5badec',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
          }}>{index + 1}</Text>
        </View>
        {!isLast && (
          <View style={{
            width: 1,
            height: 20,
            backgroundColor: '#E5E7EB',
            marginTop: 4,
          }} />
        )}
      </View>
      <View style={{
        flex: 1,
        paddingTop: 2,
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#111827',
        }}>{title}</Text>
      </View>
    </View>
  );

  const SalaryDetailModal: React.FC<SalaryDetailModalProps> = ({ visible, onClose }) => {
    if (!visible || !data) return null;
    
    return (
      <View 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          height: '100%',
          justifyContent: 'flex-end',
        }}
      >
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          maxHeight: '80%',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
            }}>Salary Information</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{
                fontSize: 24,
                color: '#6B7280',
              }}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={{
            fontSize: 14,
            color: '#4B5563',
            marginBottom: 16,
            lineHeight: 20,
          }}>
            The salary range for a {data.title} typically depends on experience, location, and industry.
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
            }}>Entry Level</Text>
            <Text style={{
              fontSize: 14,
              color: '#111827',
            }}>{formatSalary(data.minSalary)}</Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
            }}>Senior Level</Text>
            <Text style={{
              fontSize: 14,
              color: '#111827',
            }}>{formatSalary(data.maxSalary)}</Text>
          </View>
          
          <TouchableOpacity 
            style={{
              backgroundColor: '#5badec',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 24,
            }}
            onPress={onClose}
          >
            <Text style={{
              color: 'white',
              fontWeight: '600',
              fontSize: 14,
            }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ConfirmToast: React.FC<ConfirmToastProps> = ({ title, message, onConfirm, onCancel }) => (
    <View style={{
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
      }}>
        {title}
      </Text>
      <Text style={{
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
      }}>
        {message}
      </Text>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
      }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            marginRight: 8,
            backgroundColor: '#F3F4F6',
          }}
          onPress={onCancel}
        >
          <Text style={{
            color: '#4B5563',
            fontWeight: '500',
          }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
            backgroundColor: '#5badec',
          }}
          onPress={onConfirm}
        >
          <Text style={{
            color: 'white',
            fontWeight: '500',
          }}>Yes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = {
    descriptionText: {
      fontSize: 14,
      lineHeight: 20,
      color: '#4B5563',
    },
    tagGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      marginHorizontal: -4,
      marginVertical: 4,
    },
    progressionContainer: {
      paddingVertical: 8,
    },
    educationSection: {
      marginBottom: 16,
    },
    educationSubtitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#374151',
      marginBottom: 8,
    },
    employersGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      marginBottom: 16,
    },
    employerTag: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginRight: 8,
      marginBottom: 8,
    },
    employerText: {
      fontSize: 12,
      color: '#4B5563',
    },
    interestsTitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#374151',
      marginBottom: 8,
    },
    bottomSpacing: {
      height: 32,
    },
    actionsContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginTop: 12,
      paddingHorizontal: 16,
    },
    primaryActionButton: {
      flex: 1,
      backgroundColor: '#5badec',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    },
    selectedActionButton: {
      flex: 1,
      backgroundColor: '#16a34a',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    },
    bookmarkButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#EBF5FF',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginLeft: 12,
    },
    actionButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 15,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: 'white',
      }}>
        <TouchableOpacity
          style={{ 
            padding: 8,
            borderRadius: 9999,
            backgroundColor: '#F3F4F6',
          }}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={{ 
          flex: 1,
          alignItems: 'center',
        }}>
          <Text style={{ 
            fontSize: 16,
            fontWeight: '600',
            color: '#5badec',
          }}>{data.title}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Industry Section */}
        <View 
          style={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 8,
          }}>{data.title}</Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <Tag text={data.industry} type="secondary" />
            <Tag 
              text={formatGrowthRate()} 
              type="primary" 
            />
          </View>
        </View>

        {/* Select this path & Bookmark buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={isSelected ? styles.selectedActionButton : styles.primaryActionButton}
            onPress={handleSelectPath}
            disabled={isSelectingPath}>
            {isSelectingPath ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.actionButtonText}>
                {isSelected ? 'Path Selected' : 'Select This Path'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={handleBookmark}
            disabled={isBookmarkLoading}>
            {isBookmarkLoading ? (
              <ActivityIndicator size="small" color="#5badec" />
            ) : (
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#5badec"
              />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Salary Card */}
        <View 
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View>
            <Text style={{
              fontSize: 12,
              color: '#6B7280',
              marginBottom: 4,
            }}>Annual Salary</Text>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#5badec',
            }}>
              {formatSalary(data.minSalary)} - {formatSalary(data.maxSalary)}
            </Text>
          </View>
          <TouchableOpacity 
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: '#EBF5FF',
            }}
            onPress={() => setSalaryModalVisible(true)}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: '#5badec',
            }}>Details</Text>
          </TouchableOpacity>
        </View>
        
        {/* Description Card */}
        <Card title="Overview">
          <Text style={styles.descriptionText}>{data.description}</Text>
        </Card>
        
        {/* Responsibilities Card */}
        <Card title="What You'll Do">
          {data.dayToDayResponsibilities.map((responsibility, index) => (
            <ListItem key={index} text={responsibility} />
          ))}
        </Card>
        
        {/* Required Skills Card */}
        <Card title="Required Skills">
          <View style={styles.tagGrid}>
            {data.requiredSkills.map((skill, index) => (
              <Tag key={index} text={skill} />
            ))}
          </View>
        </Card>
        
        {/* Tools & Technologies Card */}
        <Card title="Tools & Technologies">
          <View style={styles.tagGrid}>
            {data.toolsAndTechnologies.map((tool, index) => (
              <Tag key={index} text={tool} />
            ))}
          </View>
        </Card>
        
        {/* Career Progression Card */}
        <Card title="Career Path">
          <View style={styles.progressionContainer}>
            {data.careerProgression.map((step, index) => (
              <ProgressStep 
                key={index} 
                title={step} 
                isLast={index === data.careerProgression.length - 1}
                index={index}
              />
            ))}
          </View>
        </Card>
        
        {/* Education Card */}
        <Card title="Education">
          <View style={styles.educationSection}>
            <Text style={styles.educationSubtitle}>Suggested Degrees</Text>
            {data.suggestedDegrees.map((degree, index) => (
              <ListItem key={index} text={degree} />
            ))}
          </View>
          
          <View style={styles.educationSection}>
            <Text style={styles.educationSubtitle}>Certifications</Text>
            {data.requiredCertifications.length > 0 ? (
              data.requiredCertifications.map((cert, index) => (
                <ListItem key={index} text={cert} />
              ))
            ) : (
              <Text style={{fontSize: 14, color: '#6B7280', fontStyle: 'italic'}}>
                No specific certifications required
              </Text>
            )}
          </View>
        </Card>
        
        {/* Where You'll Work Card */}
        <Card title="Where You'll Work">
          <View style={styles.employersGrid}>
            {data.typicalEmployers.map((employer, index) => (
              <View key={index} style={styles.employerTag}>
                <Text style={styles.employerText}>{employer}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.interestsTitle}>Recommended Interests</Text>
          <View style={styles.tagGrid}>
            {data.requiredInterests.map((interest, index) => (
              <Tag key={index} text={interest} type="primary" />
            ))}
          </View>
        </Card>
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Salary Details Modal */}
      <SalaryDetailModal 
        visible={salaryModalVisible} 
        onClose={() => setSalaryModalVisible(false)} 
      />

      {/* Confetti effect */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{x: -10, y: 0}} 
          autoStart={true}
          fadeOut={true}
          colors={['#5badec', '#65A30D', '#FCD34D', '#F87171', '#A78BFA']}
        />
      )}

      {/* Custom toast component */}
      <Toast
        config={{
          info: ({ text1, text2, props }) => (
            <ConfirmToast
            title={text1 || "Confirm"}
            message={text2 || "Are you sure you want to proceed?"}
            onConfirm={props?.onConfirm}
            onCancel={props?.onCancel}
            />
          )
        }}
      />
    </SafeAreaView>
  );
};

export default PathInfo;