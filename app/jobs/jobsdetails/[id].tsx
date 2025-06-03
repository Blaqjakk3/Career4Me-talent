import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  StyleSheet
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  Award,
  FileCheck,
  BookOpen,
  Briefcase,
  ExternalLink,
  GraduationCap,
  CheckCircle2
} from 'lucide-react-native';
import {
  config,
  databases,
  Query
} from '../../../lib/appwrite';

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

  useEffect(() => {
    if (id) {
      fetchJobDetails(id as string);
    }
  }, [id]);

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
      console.error('Error fetching job details:', error);
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      if (!job?.applylink) {
        alert('No application link available for this job.');
        return;
      }

      // Increment clicks
      await databases.updateDocument(
        config.databaseId,
        config.jobsCollectionId,
        job.$id,
        {
          numClicks: (job.numClicks || 0) + 1
        }
      );

      // Open link
      const canOpen = await Linking.canOpenURL(job.applylink);
      if (canOpen) {
        await Linking.openURL(job.applylink);
      } else {
        alert('Cannot open this application link. Please try again later.');
      }
    } catch (error) {
      console.error('Error handling apply:', error);
      alert('Failed to open application link. Please try again later.');
    }
  };

  const InfoPill = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <View style={styles.infoPill}>
      {icon}
      <Text style={styles.infoPillText}>{text}</Text>
    </View>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const ListItem = ({ text }: { text: string }) => (
    <View style={styles.listItem}>
      <CheckCircle2 size={16} color="#5badec" />
      <Text style={styles.listItemText}>{text}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5badec" />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Job not found</Text>
        <TouchableOpacity 
          style={styles.backButtonLarge} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go back to jobs</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>{job.name}-{job.seniorityLevel}</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <Image
            source={{ uri: employer?.avatar || 'https://via.placeholder.com/60' }}
            style={styles.companyLogo}
          />
          <Text style={styles.jobTitle}>{job.name}</Text>
          <Text style={styles.companyName}>{employer?.name}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.locationText}>{job.location}</Text>
          </View>
          
          {/* New Apply button under location */}
          <TouchableOpacity 
            style={styles.topApplyButton}
            onPress={handleApply}
          >
            <Text style={styles.topApplyButtonText}>Apply</Text>
            <ExternalLink size={15} color="white" />
          </TouchableOpacity>
        </View>

        {/* Job Info Highlights */}
        <View style={styles.pillContainer}>
          <InfoPill icon={<Clock size={14} color="white" />} text={job.jobtype} />
          <InfoPill icon={<Building2 size={14} color="white" />} text={job.workenvironment} />
          <InfoPill icon={<Award size={14} color="white" />} text={job.seniorityLevel} />
          {job.industry && (
            <InfoPill icon={<Briefcase size={14} color="white" />} text={job.industry} />
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <SectionTitle title="Description" />
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Responsibilities" />
            {job.responsibilities.map((responsibility, index) => (
              <ListItem key={`resp-${index}`} text={responsibility} />
            ))}
          </View>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Required Skills" />
            <View style={styles.skillsContainer}>
              {job.skills.map((skill, index) => (
                <View key={`skill-${index}`} style={styles.skill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {job.requiredDegrees && job.requiredDegrees.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Education Requirements" />
            {job.requiredDegrees.map((degree, index) => (
              <ListItem key={`degree-${index}`} text={degree} />
            ))}
          </View>
        )}

        {/* Certifications */}
        {job.suggestedCertifications && job.suggestedCertifications.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Recommended Certifications" />
            {job.suggestedCertifications.map((cert, index) => (
              <ListItem key={`cert-${index}`} text={cert} />
            ))}
          </View>
        )}

        {/* About Company */}
        {employer?.about && (
          <View style={styles.section}>
            <SectionTitle title="About the Company" />
            <Text style={styles.descriptionText}>{employer.about}</Text>
            {employer.website && (
              <TouchableOpacity 
                style={styles.websiteLink}
                onPress={() => Linking.openURL(employer.website || '')}
              >
                <Text style={styles.websiteLinkText}>Visit company website</Text>
                <ExternalLink size={14} color="#5badec" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Apply Button - Updated text */}
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
          <ExternalLink size={18} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20
  },
  notFoundText: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 20
  },
  backButtonLarge: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    padding: 6,
    borderRadius: 9999
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center'
  },
  headerText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  scrollView: {
    flex: 1
  },
  jobHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  companyLogo: {
    width: 80, // Increased from 60 to 80
    height: 80, // Increased from 60 to 80
    borderRadius: 12, // Slightly adjusted for the larger size
    marginBottom: 16
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8
  },
  companyName: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16 // Added margin to create space for the apply button below
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6b7280'
  },
  topApplyButton: {
    backgroundColor: '#5badec',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  topApplyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5badec',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8
  },
  infoPillText: {
    marginLeft: 4,
    fontSize: 12,
    color: 'white'
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563'
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  listItemText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    marginLeft: 10,
    flex: 1
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skill: {
    backgroundColor: '#5badec',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8
  },
  skillText: {
    fontSize: 13,
    color: 'white'
  },
  websiteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16
  },
  websiteLinkText: {
    fontSize: 15,
    color: '#5badec',
    marginRight: 6
  },
  applyButton: {
    backgroundColor: '#5badec',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8
  }
});

export default JobDetails;