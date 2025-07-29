import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  Feather, 
  AntDesign 
} from '@expo/vector-icons';
import { databases, config, Query } from '@/lib/appwrite'; // Adjust the import path as needed

interface JobCompatibilityAnalyzerProps {
  job: {
    skills?: string[];
    requiredDegrees?: string[];
    suggestedCertifications?: string[];
    relatedpaths?: string[]; // Array of path titles
  };
  currentUser: {
    skills?: string[];
    degrees?: string[];
    certifications?: string[];
    selectedPath?: string; // Document ID of selected career path
  };
}

interface MatchResult {
  percentage: number;
  matched: string[];
  missing: string[];
}

interface CompatibilityData {
  overallScore: number;
  skillsMatch: MatchResult;
  degreesMatch: MatchResult;
  certificationsMatch: MatchResult;
}

interface CareerPath {
  $id: string;
  title: string;
}

const JobCompatibilityAnalyzer: React.FC<JobCompatibilityAnalyzerProps> = ({ job, currentUser }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCareerPath, setSelectedCareerPath] = useState<CareerPath | null>(null);
  const [isJobInSelectedPath, setIsJobInSelectedPath] = useState(false);
  const [checkingPath, setCheckingPath] = useState(true);

  // Calculate percentage match for each category
  const calculateSkillsMatch = (userSkills: string[] = [], jobSkills: string[] = []): MatchResult => {
    if (jobSkills.length === 0) {
      return { percentage: 100, matched: [], missing: [] };
    }

    const userSkillsLower = userSkills.map(skill => skill.toLowerCase().trim());
    const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase().trim());
    
    const matched = jobSkillsLower.filter(skill => 
      userSkillsLower.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );
    
    const missing = jobSkillsLower.filter(skill => 
      !userSkillsLower.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    const percentage = Math.round((matched.length / jobSkillsLower.length) * 100);
    
    return {
      percentage,
      matched: matched.map(skill => jobSkills.find(s => s.toLowerCase().trim() === skill) || skill),
      missing: missing.map(skill => jobSkills.find(s => s.toLowerCase().trim() === skill) || skill)
    };
  };

  const calculateDegreesMatch = (userDegrees: string[] = [], jobDegrees: string[] = []): MatchResult => {
    if (jobDegrees.length === 0) {
      return { percentage: 100, matched: [], missing: [] };
    }

    const userDegreesLower = userDegrees.map(degree => degree.toLowerCase().trim());
    const jobDegreesLower = jobDegrees.map(degree => degree.toLowerCase().trim());
    
    const matched = jobDegreesLower.filter(degree => 
      userDegreesLower.some(userDegree => 
        userDegree.includes(degree) || degree.includes(userDegree)
      )
    );
    
    const missing = jobDegreesLower.filter(degree => 
      !userDegreesLower.some(userDegree => 
        userDegree.includes(degree) || degree.includes(userDegree)
      )
    );

    const percentage = Math.round((matched.length / jobDegreesLower.length) * 100);
    
    return {
      percentage,
      matched: matched.map(degree => jobDegrees.find(d => d.toLowerCase().trim() === degree) || degree),
      missing: missing.map(degree => jobDegrees.find(d => d.toLowerCase().trim() === degree) || degree)
    };
  };

  const calculateCertificationsMatch = (userCerts: string[] = [], jobCerts: string[] = []): MatchResult => {
    if (jobCerts.length === 0) {
      return { percentage: 100, matched: [], missing: [] };
    }

    const userCertsLower = userCerts.map(cert => cert.toLowerCase().trim());
    const jobCertsLower = jobCerts.map(cert => cert.toLowerCase().trim());
    
    const matched = jobCertsLower.filter(cert => 
      userCertsLower.some(userCert => 
        userCert.includes(cert) || cert.includes(userCert)
      )
    );
    
    const missing = jobCertsLower.filter(cert => 
      !userCertsLower.some(userCert => 
        userCert.includes(cert) || cert.includes(userCert)
      )
    );

    const percentage = Math.round((matched.length / jobCertsLower.length) * 100);
    
    return {
      percentage,
      matched: matched.map(cert => jobCerts.find(c => c.toLowerCase().trim() === cert) || cert),
      missing: missing.map(cert => jobCerts.find(c => c.toLowerCase().trim() === cert) || cert)
    };
  };

  // Calculate overall compatibility score
  const calculateOverallScore = (skillsMatch: number, degreesMatch: number, certsMatch: number): number => {
    // Weighted average: Skills (50%), Degrees (30%), Certifications (20%)
    return Math.round((skillsMatch * 0.5) + (degreesMatch * 0.3) + (certsMatch * 0.2));
  };

  // Check if job belongs to user's selected career path
  const checkJobPathCompatibility = async () => {
    try {
      setCheckingPath(true);
      
      // If user doesn't have a selected path, skip the check
      if (!currentUser.selectedPath) {
        setCheckingPath(false);
        return;
      }

      // Fetch the selected career path details
      const pathResponse = await databases.getDocument<CareerPath>(
        config.databaseId,
        config.careerPathsCollectionId, // You'll need to add this to your config
        currentUser.selectedPath
      );

      if (pathResponse) {
        setSelectedCareerPath(pathResponse);
        
        // Check if job's related paths include the selected career path title
        if (job.relatedpaths && job.relatedpaths.length > 0) {
          const isJobRelated = job.relatedpaths.some(
            pathTitle => pathTitle.toLowerCase().trim() === pathResponse.title.toLowerCase().trim()
          );
          setIsJobInSelectedPath(isJobRelated);
        } else {
          setIsJobInSelectedPath(false);
        }
      }
    } catch (error) {
      console.error('Error checking job path compatibility:', error);
      setIsJobInSelectedPath(false);
    } finally {
      setCheckingPath(false);
    }
  };

  // Memoized compatibility calculations
  const compatibilityData: CompatibilityData = useMemo(() => {
    const skillsMatch = calculateSkillsMatch(currentUser.skills, job.skills);
    const degreesMatch = calculateDegreesMatch(currentUser.degrees, job.requiredDegrees);
    const certificationsMatch = calculateCertificationsMatch(currentUser.certifications, job.suggestedCertifications);
    
    const overallScore = calculateOverallScore(
      skillsMatch.percentage,
      degreesMatch.percentage,
      certificationsMatch.percentage
    );

    return {
      overallScore,
      skillsMatch,
      degreesMatch,
      certificationsMatch
    };
  }, [job, currentUser]);

  // Get compatibility level and color
  const getCompatibilityLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent Match', color: '#10b981', icon: 'checkmark-circle' };
    if (score >= 70) return { level: 'Good Match', color: '#3b82f6', icon: 'checkmark' };
    if (score >= 50) return { level: 'Fair Match', color: '#f59e0b', icon: 'alert-circle' };
    return { level: 'Needs Improvement', color: '#ef4444', icon: 'close-circle' };
  };

  const handleLearningResourcesPress = () => {
    if (!currentUser.selectedPath) {
      Alert.alert(
        'No Career Path Selected',
        'Please select a career path from your profile to access learning resources.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isJobInSelectedPath) {
      Alert.alert(
        'Learning Resources Not Available',
        `This job is not part of your selected career path (${selectedCareerPath?.title || 'Unknown'}). Learning resources are only available for jobs within your current career path in Career4Me.`,
        [
          { text: 'OK' },
          {
            text: 'View Career Paths',
            onPress: () => router.push('/career-path') // Adjust route as needed
          }
        ]
      );
      return;
    }

    // Navigate to learning resources if job is in selected path
    router.push('/learning');
  };

  useEffect(() => {
    const initializeComponent = async () => {
      await checkJobPathCompatibility();
      
      // Simulate loading time for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    initializeComponent();
  }, [job, currentUser]);

  const compatibilityLevel = getCompatibilityLevel(compatibilityData.overallScore);

  const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => (
    <View style={{
      width: '100%',
      height: 8,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: 8
    }}>
      <View style={{
        width: `${percentage}%`,
        height: '100%',
        backgroundColor: color,
        borderRadius: 4,
      }} />
    </View>
  );

  const MatchSection = ({ 
    title, 
    match, 
    icon, 
    color 
  }: { 
    title: string; 
    match: MatchResult; 
    icon: string; 
    color: string;
  }) => (
    <View style={{
      backgroundColor: '#f9fafb',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={{
          backgroundColor: color,
          borderRadius: 8,
          padding: 6,
          marginRight: 12
        }}>
          <Ionicons name={icon as any} size={16} color="white" />
        </View>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#111827',
          flex: 1
        }}>{title}</Text>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: color
        }}>{match.percentage}%</Text>
      </View>
      
      <ProgressBar percentage={match.percentage} color={color} />
      
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <Text style={{
          fontSize: 14,
          color: '#6b7280',
          marginRight: 16
        }}>
          {match.matched.length} matched
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6b7280'
        }}>
          {match.missing.length} missing
        </Text>
      </View>
    </View>
  );

  const MatchedItems = ({ items, title }: { items: string[]; title: string }) => {
    if (items.length === 0) return null;
    
    const displayItems = items.slice(0, 5);
    const remainingCount = items.length - 5;

    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 8
        }}>{title}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {displayItems.map((item, index) => (
            <View key={index} style={{
              backgroundColor: '#10b981',
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginRight: 8,
              marginBottom: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: 'white',
                fontWeight: '600'
              }}>{item}</Text>
            </View>
          ))}
          {remainingCount > 0 && (
            <View style={{
              backgroundColor: '#6b7280',
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginRight: 8,
              marginBottom: 8
            }}>
              <Text style={{
                fontSize: 12,
                color: 'white',
                fontWeight: '600'
              }}>+{remainingCount} more</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading || checkingPath) {
    return (
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
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <ActivityIndicator size="large" color="#5badec" />
          <Text style={{
            marginTop: 12,
            fontSize: 16,
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {checkingPath ? 'Checking career path compatibility...' : 'Analyzing compatibility...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
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
      {/* Header Section */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{
          backgroundColor: compatibilityLevel.color,
          borderRadius: 50,
          width: 80,
          height: 80,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          shadowColor: compatibilityLevel.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}>
          <Ionicons name={compatibilityLevel.icon as any} size={32} color="white" />
        </View>
        
        <Text style={{
          fontSize: 32,
          fontWeight: '800',
          color: compatibilityLevel.color,
          marginBottom: 8
        }}>{compatibilityData.overallScore}%</Text>
        
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#111827',
          marginBottom: 4
        }}>{compatibilityLevel.level}</Text>
        
        <Text style={{
          fontSize: 14,
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Your profile matches {compatibilityData.overallScore}% of this job's requirements
        </Text>
      </View>

      {/* Career Path Status */}
      {currentUser.selectedPath && (
        <View style={{
          backgroundColor: isJobInSelectedPath ? '#f0fdf4' : '#fef3c7',
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: isJobInSelectedPath ? '#10b981' : '#f59e0b'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons 
              name={isJobInSelectedPath ? 'checkmark-circle' : 'information-circle'} 
              size={16} 
              color={isJobInSelectedPath ? '#10b981' : '#f59e0b'} 
            />
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: isJobInSelectedPath ? '#065f46' : '#92400e',
              marginLeft: 8
            }}>
              Career Path Status
            </Text>
          </View>
          <Text style={{
            fontSize: 13,
            color: isJobInSelectedPath ? '#065f46' : '#92400e',
            lineHeight: 18
          }}>
            {isJobInSelectedPath 
              ? `This job aligns with your selected career path: ${selectedCareerPath?.title}`
              : `This job is not part of your selected career path (${selectedCareerPath?.title})`
            }
          </Text>
        </View>
      )}

      {/* Breakdown Section */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#111827',
          marginBottom: 16
        }}>Breakdown</Text>
        
        <MatchSection
          title="Skills"
          match={compatibilityData.skillsMatch}
          icon="code-slash"
          color="#5badec"
        />
        
        <MatchSection
          title="Education"
          match={compatibilityData.degreesMatch}
          icon="school"
          color="#10b981"
        />
        
        <MatchSection
          title="Certifications"
          match={compatibilityData.certificationsMatch}
          icon="ribbon"
          color="#f59e0b"
        />
      </View>

      {/* Matched Items */}
      <View style={{ marginBottom: 20 }}>
        <MatchedItems 
          items={compatibilityData.skillsMatch.matched} 
          title="Your Matching Skills"
        />
        <MatchedItems 
          items={compatibilityData.degreesMatch.matched} 
          title="Your Matching Education"
        />
        <MatchedItems 
          items={compatibilityData.certificationsMatch.matched} 
          title="Your Matching Certifications"
        />
      </View>

      {/* Suggestions Section */}
      {(compatibilityData.skillsMatch.missing.length > 0 || 
        compatibilityData.degreesMatch.missing.length > 0 || 
        compatibilityData.certificationsMatch.missing.length > 0) && (
        <View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb'
            }}
            onPress={() => setShowSuggestions(!showSuggestions)}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#111827'
            }}>Improvement Suggestions</Text>
            <Ionicons 
              name={showSuggestions ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>

          {showSuggestions && (
            <View style={{ marginTop: 16 }}>
              {compatibilityData.skillsMatch.missing.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8
                  }}>Skills to Develop</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {compatibilityData.skillsMatch.missing.map((skill, index) => (
                      <View key={index} style={{
                        backgroundColor: '#fef3c7',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        marginRight: 8,
                        marginBottom: 8
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: '#92400e',
                          fontWeight: '600'
                        }}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {compatibilityData.degreesMatch.missing.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8
                  }}>Education Requirements</Text>
                  {compatibilityData.degreesMatch.missing.map((degree, index) => (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 6
                    }}>
                      <View style={{
                        backgroundColor: '#fee2e2',
                        borderRadius: 8,
                        padding: 4,
                        marginRight: 8
                      }}>
                        <Ionicons name="school" size={12} color="#dc2626" />
                      </View>
                      <Text style={{
                        fontSize: 14,
                        color: '#6b7280'
                      }}>{degree}</Text>
                    </View>
                  ))}
                </View>
              )}

              {compatibilityData.certificationsMatch.missing.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 8
                  }}>Recommended Certifications</Text>
                  {compatibilityData.certificationsMatch.missing.map((cert, index) => (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 6
                    }}>
                      <View style={{
                        backgroundColor: '#fee2e2',
                        borderRadius: 8,
                        padding: 4,
                        marginRight: 8
                      }}>
                        <Ionicons name="ribbon" size={12} color="#dc2626" />
                      </View>
                      <Text style={{
                        fontSize: 14,
                        color: '#6b7280'
                      }}>{cert}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={handleLearningResourcesPress}
                style={{
                  backgroundColor: isJobInSelectedPath && currentUser.selectedPath ? '#5badec' : '#9ca3af',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  marginTop: 12,
                  flexDirection: 'row',
                  justifyContent: 'center'
                }}>
                <Ionicons 
                  name={isJobInSelectedPath && currentUser.selectedPath ? 'book' : 'lock-closed'} 
                  size={16} 
                  color="white" 
                />
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 14,
                  marginLeft: 8
                }}>
                  {!currentUser.selectedPath 
                    ? 'Select Career Path First'
                    : isJobInSelectedPath 
                      ? 'Find Learning Resources' 
                      : 'Resources Not Available'
                  }
                </Text>
              </TouchableOpacity>
              
              {(!isJobInSelectedPath || !currentUser.selectedPath) && (
                <Text style={{
                  fontSize: 12,
                  color: '#6b7280',
                  textAlign: 'center',
                  marginTop: 8,
                  fontStyle: 'italic'
                }}>
                  {!currentUser.selectedPath 
                    ? 'Learning resources require an active career path'
                    : 'Learning resources are only available for jobs in your selected career path'
                  }
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default JobCompatibilityAnalyzer;