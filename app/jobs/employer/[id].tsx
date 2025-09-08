import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/Header';

import {
  config,
  databases,
  Query,
} from '../../../lib/appwrite';

// Define types
type Employer = {
  $id: string;
  employerId: string;
  name: string;
  field?: string;
  about?: string;
  location?: string;
  website?: string;
  avatar?: string;
  email?: string;
};

type Job = {
  $id: string;
  name: string;
  location: string;
  jobtype: string;
  seniorityLevel: string;
  employer: string;
};

const EmployerDetails = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (id) {
      fetchEmployerDetails(id as string);
    }
  }, [id]);

  const fetchEmployerDetails = async (employerId: string) => {
    try {
      setLoading(true);

      // Fetch employer details
      const employersResponse = await databases.listDocuments<Employer>(
        config.databaseId,
        config.employersCollectionId,
        [Query.equal('employerId', [employerId])]
      );

      if (employersResponse.documents.length > 0) {
        const employerData = employersResponse.documents[0];
        setEmployer(employerData);

        // Fetch jobs from this employer
        const jobsResponse = await databases.listDocuments<Job>(
          config.databaseId,
          config.jobsCollectionId,
          [Query.equal('employer', [employerId])]
        );

        setJobs(jobsResponse.documents);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching employer details:', error);
      setLoading(false);
    }
  };

  const handleWebsitePress = async () => {
    if (!employer?.website) return;
    
    try {
      const canOpen = await Linking.canOpenURL(employer.website);
      if (canOpen) {
        await Linking.openURL(employer.website);
      } else {
        alert('Cannot open website link');
      }
    } catch (error) {
      console.error('Error opening website:', error);
    }
  };

  const handleJobPress = (jobId: string) => {
    router.push(`/jobs/jobsdetails/${jobId}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const InfoCard = ({ 
    icon, 
    title, 
    value, 
    onPress,
    accent = false
  }: { 
    icon: React.ReactNode; 
    title: string; 
    value: string;
    onPress?: () => void;
    accent?: boolean;
  }) => (
    <TouchableOpacity
      style={{
        backgroundColor: accent ? '#5badec' : 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: accent ? 0.15 : 0.08,
        shadowRadius: 8,
        elevation: accent ? 6 : 3,
        borderWidth: accent ? 0 : 1,
        borderColor: '#f3f4f6',
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={{
        backgroundColor: accent ? 'rgba(255,255,255,0.2)' : '#5badec',
        borderRadius: 14,
        padding: 12,
        marginRight: 16
      }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 13,
          color: accent ? 'rgba(255,255,255,0.8)' : '#6b7280',
          marginBottom: 4,
          fontWeight: '500'
        }}>{title}</Text>
        <Text style={{
          fontSize: 16,
          color: accent ? 'white' : '#111827',
          fontWeight: '600'
        }}>{value}</Text>
      </View>
      {onPress && (
        <View style={{
          backgroundColor: accent ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
          borderRadius: 10,
          padding: 8
        }}>
          <Feather name="external-link" size={16} color={accent ? 'white' : '#6b7280'} />
        </View>
      )}
    </TouchableOpacity>
  );

  const JobCard = ({ job, index }: { job: Job; index: number }) => (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: index % 2 === 0 ? '#5badec' : '#10b981',
      }}
      onPress={() => handleJobPress(job.$id)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#111827',
          flex: 1,
          marginRight: 12
        }}>{job.name}</Text>
        <View style={{
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          padding: 6
        }}>
          <Feather name="trending-up" size={16} color="#6b7280" />
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          padding: 6,
          marginRight: 8
        }}>
          <Feather name="map-pin" size={14} color="#6b7280" />
        </View>
        <Text style={{
          fontSize: 15,
          color: '#6b7280',
          fontWeight: '500'
        }}>{job.location}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <View style={{
          backgroundColor: '#5badec',
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 6,
          marginRight: 8,
          marginBottom: 4
        }}>
          <Text style={{ fontSize: 13, color: 'white', fontWeight: '600' }}>{job.jobtype}</Text>
        </View>
        <View style={{
          backgroundColor: '#10b981',
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 6,
          marginRight: 8,
          marginBottom: 4
        }}>
          <Text style={{ fontSize: 13, color: 'white', fontWeight: '600' }}>{job.seniorityLevel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 16,
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#f3f4f6',
    }}>
      <View style={{
        backgroundColor: '#5badec',
        borderRadius: 12,
        padding: 10,
        marginBottom: 8
      }}>
        {icon}
      </View>
      <Text style={{
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2
      }}>{value}</Text>
      <Text style={{
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '500'
      }}>{label}</Text>
    </View>
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
          }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!employer) {
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
            <MaterialCommunityIcons name="office-building" size={32} color="#dc2626" />
          </View>
          <Text style={{ fontSize: 20, color: '#111827', marginBottom: 8, fontWeight: '700' }}>
            Company Not Found
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 24, textAlign: 'center' }}>
            We couldn't find the company you're looking for.
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
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <Header title="Company Profile" onBackPress={handleBackPress} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Enhanced Company Header */}
        <View style={{
          alignItems: 'center',
          paddingVertical: 40,
          paddingHorizontal: 20,
          backgroundColor: 'white',
          marginBottom: 20,
          position: 'relative'
        }}>
          {/* Background Decoration */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            backgroundColor: '#5badec',
            opacity: 0.05,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }} />
          
          <Image
            source={{ uri: employer.avatar || 'https://via.placeholder.com/120' }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              marginBottom: 20,
              borderWidth: 4,
              borderColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
            }}
          />
          <Text style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#111827',
            textAlign: 'center',
            marginBottom: 8
          }}>{employer.name}</Text>
          
          {employer.field && (
            <Text style={{
              fontSize: 18,
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 20,
              fontWeight: '500'
            }}>{employer.field}</Text>
          )}

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', marginBottom: 20, paddingHorizontal: 20 }}>
            <StatCard
              icon={<Feather name="briefcase" size={20} color="white" />}
              value={jobs.length.toString()}
              label="Open Positions"
            />
            {employer.location && (
              <StatCard
                icon={<Feather name="map-pin" size={20} color="white" />}
                value={employer.location.split(',')[0] || employer.location}
                label="Location"
              />
            )}
          </View>
        </View>

        {/* Company Information */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 20
          }}>Company Details</Text>

          {employer.website && (
            <InfoCard
              icon={<Feather name="globe" size={22} color="white" />}
              title="Website"
              value={employer.website}
              onPress={handleWebsitePress}
              accent={true}
            />
          )}

          {employer.email && (
            <InfoCard
              icon={<Feather name="mail" size={22} color="white" />}
              title="Contact Email"
              value={employer.email}
            />
          )}
        </View>

        {/* About Section */}
        {employer.about && (
          <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
            <Text style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 20
            }}>About {employer.name}</Text>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
              borderLeftWidth: 4,
              borderLeftColor: '#5badec',
            }}>
              <Text style={{
                fontSize: 16,
                lineHeight: 24,
                color: '#4b5563',
                fontWeight: '400'
              }}>{employer.about}</Text>
            </View>
          </View>
        )}

        {/* Open Positions */}
        {jobs.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{
                fontSize: 22,
                fontWeight: '700',
                color: '#111827',
              }}>Open Positions</Text>
              <View style={{
                backgroundColor: '#5badec',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6
              }}>
                <Text style={{
                  fontSize: 14,
                  color: 'white',
                  fontWeight: '600'
                }}>{jobs.length} Jobs</Text>
              </View>
            </View>
            {jobs.map((job, index) => (
              <JobCard key={job.$id} job={job} index={index} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployerDetails;