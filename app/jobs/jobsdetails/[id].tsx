import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  Feather, 
  AntDesign 
} from '@expo/vector-icons';
import {
  config,
  databases,
  Query,
  account,
  saveJob,
  isJobSaved,
  getCurrentUser,
  checkExistingApplication
} from '../../../lib/appwrite';
import Header from '@/components/Header';
import JobCompatibilityAnalyzer from '@/components/JobCompatibilityAnalyzer';
import QuickApplyModal from '@/components/QuickApplyModal';

// Define types
type Job = {
  $id: string;
  name: string;
  location: string;
  description: string;
  jobtype: string;
  workenvironment: string;
  seniorityLevel: string;
  applylink: string;
  employer: string;
  relatedpaths: string[];
  skills?: string[];
  requiredDegrees?: string[];
  suggestedCertifications?: string[];
  responsibilities?: string[];
  industry?: string;
  numViews?: number;
  numClicks?: number;
  clickers?: string[]; // Add this to track user IDs who clicked
  allowCareer4MeApplications?: boolean;
};

type Employer = {
  employerId: string;
  name: string;
  field?: string;
  about?: string;
  location?: string;
  website?: string;
  avatar?: string;
};

const JobDetails = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savingJob, setSavingJob] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isQuickApplyModalVisible, setQuickApplyModalVisible] = useState(false);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchJobDetails(id as string);
      getCurrentAccount();
    }
  }, [id]);

  useEffect(() => {
    if (job && currentUserId) {
      checkIfJobSaved();
    }
  }, [job, currentUserId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (currentUserId) {
        const user = await getCurrentUser();
        setCurrentUser(user);
      }
    };
    fetchCurrentUser();
  }, [currentUserId]);

  useEffect(() => {
    if (job && currentUser) {
      checkApplicationStatus();
    }
  }, [job, currentUser]);

  const checkApplicationStatus = async () => {
    if (!job || !currentUser) {
      return;
    }

    try {
      const existingApplication = await checkExistingApplication(currentUser.talentId, job.$id);

      setHasApplied(existingApplication.hasApplied);
      setApplicationStatus(existingApplication.status);
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  };

  const getCurrentAccount = async () => {
    try {
      const user = await account.get();
      setCurrentUserId(user.$id);
    } catch (error) {
      // Handle case where user is not authenticated
      setCurrentUserId(null);
    }
  };

  const checkIfJobSaved = async () => {
    if (!job) return;
    
    try {
      const saved = await isJobSaved(job.$id);
      setIsSaved(saved);
    } catch (error) {
      // Handle error silently
    }
  };

  const fetchJobDetails = async (jobId: string) => {
    try {
      setLoading(true);

      // Fetch job details
      const jobData = await databases.getDocument<Job>(
        config.databaseId,
        config.jobsCollectionId,
        jobId
      );

      if (jobData) {
        setJob(jobData);

        // Fetch employer details
        if (jobData.employer) {
          const employersResponse = await databases.listDocuments<Employer>(
            config.databaseId,
            config.employersCollectionId,
            [Query.equal('employerId', [jobData.employer])]
          );

          if (employersResponse.documents.length > 0) {
            setEmployer(employersResponse.documents[0]);
          }
        }
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSaveJob = async () => {
    if (!job) return;
    
    if (!currentUserId) {
      Alert.alert('Authentication Required', 'Please log in to save jobs.');
      return;
    }

    try {
      setSavingJob(true);
      const result = await saveJob(job.$id);
      
      if (result.success) {
        setIsSaved(result.isSaved);
        Alert.alert(
          'Success', 
          result.isSaved ? 'Job saved successfully!' : 'Job removed from saved jobs.'
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save job. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save job. Please try again.');
    } finally {
      setSavingJob(false);
    }
  };

  const handleApply = async () => {
    try {
      if (!job?.applylink) {
        Alert.alert('No Link Available', 'No application link available for this job.');
        return;
      }

      if (!currentUserId) {
        Alert.alert('Authentication Required', 'Please log in to apply for this job.');
        return;
      }

      // Check if current user has already clicked apply
      const hasAlreadyClicked = job.clickers?.includes(currentUserId) || false;

      if (!hasAlreadyClicked) {
        // Add current user to clickers array and increment numClicks
        const updatedClickers = [...(job.clickers || []), currentUserId];
        
        await databases.updateDocument(
          config.databaseId,
          config.jobsCollectionId,
          job.$id,
          {
            clickers: updatedClickers,
            numClicks: (job.numClicks || 0) + 1
          }
        );

        // Update local state to reflect the change
        setJob(prevJob => ({
          ...prevJob!,
          clickers: updatedClickers,
          numClicks: (prevJob!.numClicks || 0) + 1
        }));
      }

      // Open link regardless of whether it's a new click or not
      const canOpen = await Linking.canOpenURL(job.applylink);
      if (canOpen) {
        await Linking.openURL(job.applylink);
      } else {
        Alert.alert('Error', 'Cannot open this application link. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open application link. Please try again later.');
    }
  };

  const handleEmployerPress = () => {
    if (job?.employer) {
      router.push(`/jobs/employer/${job.employer}`);
    }
  };

  

  const InfoPill = ({ icon, text, variant = 'primary' }: { 
    icon: React.ReactNode; 
    text: string;
    variant?: 'primary' | 'secondary' | 'accent';
  }) => {
    const getColors = () => {
      switch (variant) {
        case 'secondary':
          return { bg: '#10b981', text: 'white' };
        case 'accent':
          return { bg: '#f59e0b', text: 'white' };
        default:
          return { bg: '#5badec', text: 'white' };
      }
    };

    const colors = getColors();

    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
        shadowColor: colors.bg,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      }}>
        {icon}
        <Text style={{ 
          marginLeft: 6, 
          fontSize: 13, 
          color: colors.text,
          fontWeight: '600'
        }}>{text}</Text>
      </View>
    );
  };

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{
      backgroundColor: 'white',
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderLeftWidth: 4,
      borderLeftColor: '#5badec',
    }}>
      <Text style={{
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16
      }}>{title}</Text>
      {children}
    </View>
  );

  const ListItem = ({ text }: { text: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
      <View style={{
        backgroundColor: '#5badec',
        borderRadius: 10,
        padding: 4,
        marginRight: 12,
        marginTop: 2
      }}>
        <AntDesign name="checkcircle" size={14} color="white" />
      </View>
      <Text style={{
        fontSize: 16,
        lineHeight: 24,
        color: '#4b5563',
        flex: 1,
        fontWeight: '400'
      }}>{text}</Text>
    </View>
  );

  const ActionButton = ({ onPress, icon, label, variant = 'outline', disabled = false }: {
    onPress: () => void;
    icon: React.ReactNode;
    label: string;
    variant?: 'outline' | 'filled';
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: variant === 'filled' ? '#5badec' : 'transparent',
        borderWidth: variant === 'outline' ? 2 : 0,
        borderColor: '#5badec',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flex: 1,
        marginHorizontal: 4,
        opacity: disabled ? 0.6 : 1,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <Text style={{
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: variant === 'filled' ? 'white' : '#5badec'
      }}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 8,
        }}>
          <ActivityIndicator size="large" color="#5badec" />
          <Text style={{
            marginTop: 16,
            fontSize: 16,
            color: '#6b7280',
            fontWeight: '500'
          }}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 20
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 24,
          padding: 32,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 8,
        }}>
          <View style={{
            backgroundColor: '#fee2e2',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16
          }}>
            <Feather name="briefcase" size={32} color="#dc2626" />
          </View>
          <Text style={{ fontSize: 20, color: '#111827', marginBottom: 8, fontWeight: '700' }}>
            Job Not Found
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 24, textAlign: 'center' }}>
            We couldn't find the job you're looking for.
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#5badec',
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 12,
              shadowColor: '#5badec',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }} 
            onPress={() => router.back()}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
              Go Back to Jobs
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <Header title="Job Details" onBackPress={handleBackPress} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Enhanced Job Header */}
        <View style={{
          paddingVertical: 32,
          paddingHorizontal: 20,
          backgroundColor: 'white',
          marginBottom: 16,
          position: 'relative'
        }}>
          {/* Background Decoration */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            backgroundColor: '#5badec',
            opacity: 0.05,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }} />

          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
              source={{ uri: employer?.avatar || 'https://via.placeholder.com/80' }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                marginBottom: 16,
                borderWidth: 3,
                borderColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }}
            />
            
            <Text style={{
              fontSize: 26,
              fontWeight: '800',
              color: '#111827',
              textAlign: 'center',
              marginBottom: 8
            }}>{job.name}</Text>
            
            {/* Clickable Company Name */}
            <TouchableOpacity 
              onPress={handleEmployerPress}
              style={{
                backgroundColor: '#5badec',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginBottom: 12
              }}
            >
              <Text style={{
                fontSize: 16,
                color: 'white',
                fontWeight: '600'
              }}>{employer?.name}</Text>
            </TouchableOpacity>
            
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginBottom: 20
            }}>
              <Feather name="map-pin" size={16} color="#6b7280" />
              <Text style={{ 
                marginLeft: 8, 
                fontSize: 15, 
                color: '#6b7280',
                fontWeight: '500'
              }}>{job.location}</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
            {job.allowCareer4MeApplications && hasApplied ? (
              <View style={{
                backgroundColor: applicationStatus === 'pending' ? '#F59E0B' : '#10B981',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Feather name={applicationStatus === 'pending' ? "clock" : "check-circle"} size={18} color="white" />
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 14,
                  marginLeft: 8
                }}>
                  {applicationStatus === 'pending' ? 'Application Pending' : 'Application Shortlisted'}
                </Text>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  {job.applylink && (!job.allowCareer4MeApplications || hasApplied) && (
                    <ActionButton
                      onPress={handleApply}
                      icon={<Feather name="external-link" size={18} color="#5badec" />}
                      label="Apply Now"
                      variant="outline"
                    />
                  )}
                  {job.applylink && job.allowCareer4MeApplications && !hasApplied &&(
                    <ActionButton
                      onPress={handleApply}
                      icon={<Feather name="external-link" size={18} color="#5badec" />}
                      label="Apply via link"
                      variant="outline"
                    />
                  )}
                  {!job.applylink && job.allowCareer4MeApplications && !hasApplied && (
                    <ActionButton
                      onPress={() => setQuickApplyModalVisible(true)}
                      icon={<Feather name="send" size={18} color="white" />}
                      label="Quick Apply"
                      variant="filled"
                    />
                  )}
                  <ActionButton
                    onPress={handleSaveJob}
                    icon={
                      savingJob ? (
                        <ActivityIndicator size={18} color="#5badec" />
                      ) : (
                        <AntDesign
                          name={isSaved ? "heart" : "hearto"}
                          size={18}
                          color="#5badec"
                        />
                      )
                    }
                    label={isSaved ? "Saved" : "Save"}
                    variant="outline"
                    disabled={savingJob}
                  />
                </View>
                {job.applylink && job.allowCareer4MeApplications && !hasApplied && (
                  <View style={{ marginTop: 12, alignItems: 'center' }}>
                    <ActionButton
                      onPress={() => setQuickApplyModalVisible(true)}
                      icon={<Feather name="send" size={18} color="white" />}
                      label="Quick Apply"
                      variant="filled"
                    />
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Job Info Highlights */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: 20,
          marginBottom: 16
        }}>
          <InfoPill 
            icon={<Ionicons name="time" size={16} color="white" />} 
            text={job.jobtype} 
            variant="primary"
          />
          <InfoPill 
            icon={<FontAwesome5 name="building" size={16} color="white" />} 
            text={job.workenvironment}
            variant="secondary"
          />
          <InfoPill 
            icon={<MaterialCommunityIcons name="medal" size={16} color="white" />} 
            text={job.seniorityLevel}
            variant="accent"
          />
          {job.industry && (
            <InfoPill 
              icon={<Feather name="briefcase" size={16} color="white" />} 
              text={job.industry}
              variant="primary"
            />
          )}
        </View>

        {/* Description */}
        <SectionCard title="Job Description">
          <Text style={{ 
            fontSize: 16, 
            lineHeight: 26, 
            color: '#4b5563',
            fontWeight: '400'
          }}>{job.description}</Text>
        </SectionCard>

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <SectionCard title="Key Responsibilities">
            {job.responsibilities.map((responsibility, index) => (
              <ListItem key={`resp-${index}`} text={responsibility} />
            ))}
          </SectionCard>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <SectionCard title="Required Skills">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {job.skills.map((skill, index) => (
                <View key={`skill-${index}`} style={{
                  backgroundColor: '#5badec',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginBottom: 8,
                  shadowColor: '#5badec',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                  <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>{skill}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {/* Education */}
        {job.requiredDegrees && job.requiredDegrees.length > 0 && (
          <SectionCard title="Education Requirements">
            {job.requiredDegrees.map((degree, index) => (
              <ListItem key={`degree-${index}`} text={degree} />
            ))}
          </SectionCard>
        )}

        {/* Certifications */}
        {job.suggestedCertifications && job.suggestedCertifications.length > 0 && (
          <SectionCard title="Recommended Certifications">
            {job.suggestedCertifications.map((cert, index) => (
              <ListItem key={`cert-${index}`} text={cert} />
            ))}
          </SectionCard>
        )}

        {/* Job Compatibility Analyzer */}
        {currentUserId && job && currentUser && (
          <JobCompatibilityAnalyzer 
            job={job} 
            currentUser={currentUser}
          />
        )}



        {/* Quick Apply Modal */}
        {job.allowCareer4MeApplications && (
          <QuickApplyModal
            isVisible={isQuickApplyModalVisible}
            onClose={() => setQuickApplyModalVisible(false)}
            job={job}
            currentUser={currentUser}
            onApplicationSubmitted={checkApplicationStatus}
          />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobDetails;