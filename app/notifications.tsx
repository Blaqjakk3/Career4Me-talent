import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTalentNotifications, updateNotificationStatus, getCurrentUser } from '../lib/appwrite';
import Header from '@/components/Header';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserAndNotifications = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
                fetchNotifications(currentUser.talentId);
            }
        };
        fetchUserAndNotifications();
    }, []);

    const fetchNotifications = async (talentId: string) => {
        try {
            setLoading(true);
            const response = await getTalentNotifications(talentId);
            setNotifications(response);
        } catch (error) {
            Alert.alert('Error', 'Could not fetch notifications.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await updateNotificationStatus(notificationId, true);
            if (user?.talentId) {
                fetchNotifications(user.talentId);
            }
        } catch (error) {
            Alert.alert('Error', 'Could not mark notification as read.');
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_application': return 'briefcase';
            case 'application_submitted': return 'check-circle';
            case 'application_status_update': return 'bell';
            case 'job_match': return 'target';
            default: return 'bell';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'new_application': return '#5badec';
            case 'application_submitted': return '#10b981';
            case 'application_status_update': return '#f59e0b';
            case 'job_match': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => handleMarkAsRead(item.$id)}
            style={{
                backgroundColor: item.isRead ? '#f8fafc' : 'white',
                borderRadius: 16,
                padding: 20,
                marginHorizontal: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: item.isRead ? 0.03 : 0.06,
                shadowRadius: 8,
                elevation: item.isRead ? 1 : 3,
                borderLeftWidth: 4,
                borderLeftColor: item.isRead ? '#e2e8f0' : getNotificationColor(item.type),
            }}
        >
            {/* Header with icon and timestamp */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 12
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                        backgroundColor: item.isRead ? '#e2e8f0' : `${getNotificationColor(item.type)}20`,
                        borderRadius: 12,
                        padding: 10,
                        marginRight: 12
                    }}>
                        <MaterialCommunityIcons
                            name={getNotificationIcon(item.type)}
                            size={20}
                            color={item.isRead ? '#94a3b8' : getNotificationColor(item.type)}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: item.isRead ? '#64748b' : '#111827',
                            marginBottom: 2
                        }}>
                            {item.title}
                        </Text>
                        <Text style={{
                            fontSize: 12,
                            color: '#6b7280',
                            fontWeight: '500'
                        }}>
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>

                {!item.isRead && (
                    <View style={{
                        backgroundColor: '#5badec',
                        borderRadius: 6,
                        width: 12,
                        height: 12,
                        marginTop: 4
                    }} />
                )}
            </View>

            {/* Message content */}
            <Text style={{
                fontSize: 14,
                color: item.isRead ? '#64748b' : '#374151',
                lineHeight: 20,
                marginBottom: 12
            }}>
                {item.message}
            </Text>

            {/* Action area */}
            {item.relatedJobId && (
                <TouchableOpacity
                    style={{
                        backgroundColor: item.isRead ? '#f1f5f9' : '#f0f9ff',
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-start'
                    }}
                    onPress={() => {
                        if (item.relatedJobId) {
                            router.push(`/jobs/jobsdetails/${item.relatedJobId}`);
                        }
                    }}
                >
                    <Feather
                        name="external-link"
                        size={14}
                        color={item.isRead ? '#64748b' : '#0ea5e9'}
                    />
                    <Text style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: item.isRead ? '#64748b' : '#0ea5e9',
                        marginLeft: 6
                    }}>
                        View Job
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <Header title="Notifications" onBackPress={() => router.back()} />

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
                        Loading notifications...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
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
                                    name="bell-outline"
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
                                No Notifications
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                color: '#6b7280',
                                textAlign: 'center',
                                lineHeight: 24,
                                marginBottom: 32
                            }}>
                                You're all caught up! We'll notify you when there are updates about your applications or new job matches.
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

export default Notifications;