import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTalentApplications, updateApplicationStatus, getCurrentUser, getJobById } from '@/lib/appwrite';
import Header from '@/components/Header';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const PendingApplications = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserAndApplications = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
                fetchApplications(currentUser.talentId);
            }
        };
        fetchUserAndApplications();
    }, []);

    const fetchApplications = async (talentId: string) => {
        try {
            setLoading(true);
            const response = await getTalentApplications(talentId);

            // Fetch job details for each application
            const applicationsWithJobs = await Promise.all(
                response.map(async (application: any) => {
                    try {
                        const job = await getJobById(application.jobId);
                        return {
                            ...application,
                            jobName: job.name,
                            jobDetails: job
                        };
                    } catch (error) {
                        console.error('Error fetching job details:', error);
                        return {
                            ...application,
                            jobName: 'Unknown Job',
                            jobDetails: null
                        };
                    }
                })
            );

            setApplications(applicationsWithJobs);
        } catch (error) {
            Alert.alert('Error', 'Could not fetch applications.');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (applicationId: string) => {
        try {
            await updateApplicationStatus(applicationId, 'withdrawn');
            if (user?.talentId) {
                fetchApplications(user.talentId);
            }
            Alert.alert('Success', 'Application withdrawn.');
        } catch (error) {
            Alert.alert('Error', 'Could not withdraw application.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#f59e0b';
            case 'shortlisted': return '#10b981';
            case 'rejected': return '#ef4444';
            case 'withdrawn': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'clock';
            case 'shortlisted': return 'check-circle';
            case 'rejected': return 'x-circle';
            case 'withdrawn': return 'minus-circle';
            default: return 'help-circle';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginHorizontal: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
            borderLeftWidth: 4,
            borderLeftColor: '#5badec',
        }}>
            {/* Header with job title */}
            <View style={{ marginBottom: 12 }}>
                <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: 4
                }}>
                    Application for {item.jobName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather
                        name={getStatusIcon(item.status)}
                        size={16}
                        color={getStatusColor(item.status)}
                    />
                    <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: getStatusColor(item.status),
                        marginLeft: 6,
                        textTransform: 'capitalize'
                    }}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {/* Application details */}
            <View style={{
                backgroundColor: '#f8fafc',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="calendar" size={16} color="#6b7280" />
                    <Text style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginLeft: 8,
                        fontWeight: '500'
                    }}>
                        Applied on {new Date(item.applicationdate || item.applicationDate).toLocaleDateString()}
                    </Text>
                </View>

                {item.viewedbyEmployer && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="eye" size={16} color="#10b981" />
                        <Text style={{
                            fontSize: 14,
                            color: '#10b981',
                            marginLeft: 8,
                            fontWeight: '500'
                        }}>
                            Viewed by employer
                        </Text>
                    </View>
                )}
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: '#f3f4f6',
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        marginRight: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        if (item.jobDetails) {
                            router.push(`/jobs/jobsdetails/${item.jobId}`);
                        }
                    }}
                >
                    <Feather name="eye" size={16} color="#6b7280" />
                    <Text style={{
                        color: '#6b7280',
                        fontWeight: '600',
                        fontSize: 14,
                        marginLeft: 6
                    }}>
                        View Job
                    </Text>
                </TouchableOpacity>

                {item.status === 'pending' && (
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: '#fef2f2',
                            borderRadius: 12,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            marginLeft: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: '#fecaca'
                        }}
                        onPress={() => handleWithdraw(item.$id)}
                    >
                        <Feather name="x" size={16} color="#ef4444" />
                        <Text style={{
                            color: '#ef4444',
                            fontWeight: '600',
                            fontSize: 14,
                            marginLeft: 6
                        }}>
                            Withdraw
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <Header title="My Applications" onBackPress={() => router.back()} />

            {loading ? (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <ActivityIndicator size="large" color="#5badec" />
                    <Text style={{
                        marginTop: 16,
                        fontSize: 16,
                        color: '#6b7280',
                        fontWeight: '500'
                    }}>
                        Loading your applications...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.$id}
                    contentContainerStyle={{
                        paddingTop: 16,
                        paddingBottom: 32
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 32,
                            paddingTop: 80
                        }}>
                            <View style={{
                                backgroundColor: '#e0f2fe',
                                borderRadius: 50,
                                padding: 20,
                                marginBottom: 24
                            }}>
                                <MaterialCommunityIcons
                                    name="briefcase-outline"
                                    size={48}
                                    color="#5badec"
                                />
                            </View>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: '700',
                                color: '#111827',
                                marginBottom: 8,
                                textAlign: 'center'
                            }}>
                                No Applications Yet
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                color: '#6b7280',
                                textAlign: 'center',
                                lineHeight: 24,
                                marginBottom: 32
                            }}>
                                Start applying to jobs that match your career path and track your progress here.
                            </Text>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#5badec',
                                    borderRadius: 12,
                                    paddingVertical: 14,
                                    paddingHorizontal: 24,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                                onPress={() => router.push('/jobs')}
                            >
                                <Feather name="search" size={18} color="white" />
                                <Text style={{
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: 16,
                                    marginLeft: 8
                                }}>
                                    Browse Jobs
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default PendingApplications;