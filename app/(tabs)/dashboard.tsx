import { View, Text, ActivityIndicator, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDailyQuote, getCurrentUser } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { Compass, BookOpen, FileText, Briefcase, ChevronRight, MessagesSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Dashboard = () => {
  const [quote, setQuote] = useState<{quote: string; author: string} | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(null);
  const { user, setUser } = useGlobalContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUserData(currentUser);
          setUser(currentUser);
        }

        const dailyQuote = await getDailyQuote();
        setQuote(dailyQuote);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayUser = userData || user;

  const actionItems = [
    { 
      title: 'Discover Career Path', 
      icon: <Compass size={26} color="#fff" />,
      description: 'Explore career options that match your skills',
      key: 'career-path',
      colors: ['#FF7E5F', '#FD3A69'],
      href: '/career-path'
    },
    { 
      title: 'Learning Resources', 
      icon: <BookOpen size={26} color="#fff" />,
      description: 'Boost your knowledge with curated courses',
      key: 'learning',
      colors: ['#45A2FF', '#004E92'],
      href: '/learning'
    },
    { 
      title: 'Interview Prep', 
      icon: <FileText size={26} color="#fff" />,
      description: 'Ace your interviews with expert advice',
      key: 'interview',
      colors: ['#7D5AFF', '#6A11CB'],
      href: '/interview'
    },
    { 
      title: 'Job Opportunities', 
      icon: <Briefcase size={26} color="#fff" />,
      description: 'Find your next career opportunity',
      key: 'jobs',
      colors: ['#29C17E', '#006400'],
      href: '/jobs'
    },
    { 
      title: 'Interview Prep', 
      icon: <MessagesSquare size={26} color="#fff" />,
      description: 'Prepare for your next Interview',
      key: 'interview-prep',
      colors: ['#29C17E', '#006400'],
      href: '/interview-prep'
    },
    { 
      title: 'Test Information', 
      icon: <FileText size={26} color="#fff" />,
      description: 'View all test related information',
      key: 'test-info',
      colors: ['#FF6B6B', '#EE0979'],
      href: '/test-info'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#5BADEc', '#6C5CE7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.userInfo}>
            {displayUser?.avatar && (
              <Image 
                source={{ uri: displayUser.avatar }} 
                style={styles.avatar}
              />
            )}
            <View style={styles.userText}>
              <Text style={styles.greeting}>
                Hello, {displayUser?.fullname || 'User'}!
              </Text>
              <Text style={styles.careerStage}>
                {displayUser?.careerStage || 'Career enthusiast'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          {loading ? (
            <ActivityIndicator size="large" color="#5badec" />
          ) : quote ? (
            <>
              <Text style={styles.quoteText}>"{quote.quote}"</Text>
              <Text style={styles.authorText}>— {quote.author}</Text>
            </>
          ) : (
            <Text style={styles.errorText}>Failed to load today's inspiration</Text>
          )}
        </View>
        <Pressable
    onPress={() => router.push("/QueryScreen")}
    className="mb-4 py-3 border border-[#5badec] rounded-full"
  >
    <View className="flex-row items-center justify-center">
      <Text className="text-[#5badec] font-semibold text-base mr-1">Run Appwrite Query</Text>
      <Ionicons name="code-slash" size={18} color="#5badec" />
    </View>
  </Pressable>

        {/* Action Items */}
        <Text style={styles.sectionTitle}>Explore Opportunities</Text>
        
        <View style={styles.actionList}>
          {actionItems.map((item) => (
            <Link key={item.key} href={item.href} asChild>
              <TouchableOpacity style={styles.actionItem} activeOpacity={0.8}>
                <LinearGradient
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <View style={styles.actionIcon}>
                    {item.icon}
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <Text style={styles.actionDescription}>{item.description}</Text>
                  </View>
                  <ChevronRight size={22} color="#fff" style={styles.chevron} />
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: -24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  careerStage: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 16,
    elevation: 5,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  authorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5badec',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 16,
    marginLeft: 24,
  },
  actionList: {
    paddingHorizontal: 20,
  },
  actionItem: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  actionDescription: {
    fontSize: 14,
    color: '#eee',
  },
  chevron: {
    opacity: 0.9,
  },
});

export default Dashboard;
