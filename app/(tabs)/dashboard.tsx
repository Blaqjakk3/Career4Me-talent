import { View, Text, ActivityIndicator, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDailyQuote, getCurrentUser } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SuccessModal from '@/components/SuccessModal';
import PathRequiredModal from '@/components/PathRequiredModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Dashboard = () => {
  const [quote, setQuote] = useState<{quote: string; author: string} | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPathRequiredModal, setShowPathRequiredModal] = useState(false);
  const { user, setUser } = useGlobalContext();

  // Check if user has selected a career path
  const hasSelectedPath = user?.selectedPath && user.selectedPath.trim() !== '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Always fetch fresh user data when dashboard loads
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Check if this is a new user without a selected path
          if (!currentUser.selectedPath || currentUser.selectedPath.trim() === '') {
            // Check if welcome modal has already been shown for this user
            const welcomeModalShown = await AsyncStorage.getItem(`welcomeModalShown_${currentUser.talentId}`);
            
            if (!welcomeModalShown) {
              // Small delay to let the dashboard render first
              setTimeout(() => {
                setShowWelcomeModal(true);
              }, 1000);
            }
          }
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

  const handleWelcomeModalClose = async () => {
    setShowWelcomeModal(false);
    
    // Mark welcome modal as shown for this user
    if (user?.talentId) {
      await AsyncStorage.setItem(`welcomeModalShown_${user.talentId}`, 'true');
    }
  };

  const handleRestrictedFeatureClick = () => {
    setShowPathRequiredModal(true);
  };

  // Show loading state while fetching user data
  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5badec" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const primaryActions = [
    { 
      title: 'Explore Path', 
      icon: 'compass',
      description: 'Discover career paths that match your skills',
      key: 'career-path',
      colors: ['#5badec', '#4a9bd1'],
      href: '/career-path',
      isRestricted: false
    },
    { 
      title: 'Learning Roadmap', 
      icon: 'book',
      description: 'Curated courses to boost your knowledge',
      key: 'learning',
      colors: ['#6c5ce7', '#5a4fcf'],
      href: '/learning',
      isRestricted: !hasSelectedPath
    },
    { 
      title: 'Jobs for You', 
      icon: 'briefcase',
      description: 'Find your next career opportunity',
      key: 'jobs',
      colors: ['#00b894', '#00a085'],
      href: '/jobs',
      isRestricted: !hasSelectedPath
    }
  ];

  const secondaryActions = [
    { 
      title: 'CV Analysis', 
      icon: 'document-text',
      description: 'Get expert feedback on your resume',
      key: 'analysis',
      href: '/analysis',
      isRestricted: !hasSelectedPath
    },
    { 
      title: 'CV Generation', 
      icon: 'create-outline',
      description: 'Create a professional CV in minutes',
      key: 'cvgeneration',
      href: 'cvgeneration',
      isRestricted: !hasSelectedPath
    },
    { 
      title: 'Interview Prep', 
      icon: 'chatbubble-ellipses',
      description: 'Practice with AI-powered mock interviews',
      key: 'interview-prep',
      href: '/interview-prep',
      isRestricted: !hasSelectedPath
    },
  ];

  const renderPrimaryActionCard = (item: any, index: number) => {
    if (item.isRestricted) {
      return (
        <TouchableOpacity 
          key={item.key}
          style={[
            styles.primaryActionCard,
            index === 2 && styles.fullWidthCard,
            styles.disabledCard
          ]} 
          activeOpacity={0.6}
          onPress={handleRestrictedFeatureClick}
        >
          <LinearGradient
            colors={['#e2e8f0', '#cbd5e1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryActionGradient}
          >
            <View style={styles.primaryActionContent}>
              <View style={[styles.primaryActionIcon, styles.disabledIcon]}>
                <Ionicons name={item.icon as any} size={28} color="#94a3b8" />
              </View>
              <Text style={[styles.primaryActionTitle, styles.disabledText]}>{item.title}</Text>
              <Text style={[styles.primaryActionDescription, styles.disabledDescription]}>
                {item.description}
              </Text>
            </View>
            <View style={styles.primaryActionArrow}>
              <Ionicons name="lock-closed" size={18} color="#94a3b8" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <Link key={item.key} href={item.href} asChild>
        <TouchableOpacity 
          style={[
            styles.primaryActionCard,
            index === 2 && styles.fullWidthCard
          ]} 
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={item.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryActionGradient}
          >
            <View style={styles.primaryActionContent}>
              <View style={styles.primaryActionIcon}>
                <Ionicons name={item.icon as any} size={28} color="#fff" />
              </View>
              <Text style={styles.primaryActionTitle}>{item.title}</Text>
              <Text style={styles.primaryActionDescription}>
                {item.description}
              </Text>
            </View>
            <View style={styles.primaryActionArrow}>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Link>
    );
  };

  const renderSecondaryActionCard = (item: any) => {
    if (item.isRestricted) {
      return (
        <TouchableOpacity 
          key={item.key} 
          style={[styles.secondaryActionCard, styles.disabledCard]} 
          activeOpacity={0.6}
          onPress={handleRestrictedFeatureClick}
        >
          <View style={styles.secondaryActionContent}>
            <View style={[styles.secondaryActionIcon, styles.disabledSecondaryIcon]}>
              <Ionicons name={item.icon as any} size={24} color="#94a3b8" />
            </View>
            <View style={styles.secondaryActionText}>
              <Text style={[styles.secondaryActionTitle, styles.disabledText]}>{item.title}</Text>
              <Text style={[styles.secondaryActionDescription, styles.disabledDescription]}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="lock-closed" size={20} color="#94a3b8" />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <Link key={item.key} href={item.href} asChild>
        <TouchableOpacity style={styles.secondaryActionCard} activeOpacity={0.8}>
          <View style={styles.secondaryActionContent}>
            <View style={styles.secondaryActionIcon}>
              <Ionicons name={item.icon as any} size={24} color="#5badec" />
            </View>
            <View style={styles.secondaryActionText}>
              <Text style={styles.secondaryActionTitle}>{item.title}</Text>
              <Text style={styles.secondaryActionDescription}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#5badec" />
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#5badec', '#4a9bd1', '#6c5ce7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.userSection}>
                <View style={styles.avatarContainer}>
                  {user.avatar ? (
                    <Image 
                      source={{ uri: user.avatar }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.defaultAvatar}>
                      <Ionicons name="person" size={32} color="#5badec" />
                    </View>
                  )}
                  <View style={styles.statusDot} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.welcomeText}>Welcome back!</Text>
                  <Text style={styles.userName}>
                    {user.fullname || 'Career Explorer'}
                  </Text>
                  <Text style={styles.userRole}>
                    {user.careerStage || 'Ready to grow'}
                  </Text>
                </View>
              </View>
              
              {/* Path status indicator */}
              {!hasSelectedPath && (
                <View style={styles.pathStatusContainer}>
                  <View style={styles.pathStatusBadge}>
                    <Ionicons name="compass" size={16} color="#ff6b6b" />
                    <Text style={styles.pathStatusText}>No Path Selected</Text>
                  </View>
                </View>
              )}
              
              {/* Floating elements for visual interest */}
              <View style={styles.floatingElements}>
                <View style={[styles.floatingCircle, styles.circle1]} />
                <View style={[styles.floatingCircle, styles.circle2]} />
                <View style={[styles.floatingCircle, styles.circle3]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Modern Quote Card */}
        <View style={styles.quoteSection}>
          <View style={styles.quoteCard}>
            <View style={styles.quoteHeader}>
              <View style={styles.quoteIconContainer}>
                <Ionicons name="bulb" size={20} color="#5badec" />
              </View>
              <Text style={styles.quoteLabel}>Daily Inspiration</Text>
            </View>
            
            {quote ? (
              <View style={styles.quoteContent}>
                <Text style={styles.quoteText}>"{quote.quote}"</Text>
                <Text style={styles.authorText}>— {quote.author}</Text>
              </View>
            ) : (
              <Text style={styles.errorText}>Unable to load today's inspiration</Text>
            )}
          </View>
        </View>

        {/* Primary Action Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Career Journey</Text>
          <View style={styles.primaryActionsGrid}>
            {primaryActions.map((item, index) => renderPrimaryActionCard(item, index))}
          </View>
        </View>

        {/* Secondary Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Tools</Text>
          <View style={styles.secondaryActionsContainer}>
            {secondaryActions.map((item) => renderSecondaryActionCard(item))}
          </View>
        </View>
      </ScrollView>

      {/* Welcome Modal for new users */}
      <SuccessModal
        visible={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        title="Welcome to Career4Me!"
        message="To get the most out of our platform, we recommend starting by exploring career paths that match your interests and skills."
        buttonText="Got it!"
      />

      {/* Path Required Modal */}
      <PathRequiredModal
        visible={showPathRequiredModal}
        onClose={() => setShowPathRequiredModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerContent: {
    position: 'relative',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  defaultAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00b894',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  pathStatusContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 15,
  },
  pathStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pathStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff6b6b',
    marginLeft: 4,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: 80,
    height: 80,
    top: -20,
    right: -20,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -10,
    right: 40,
  },
  circle3: {
    width: 40,
    height: 40,
    top: 20,
    right: 80,
  },
  quoteSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(91, 173, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quoteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5badec',
  },
  quoteContent: {
    paddingVertical: 8,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1e293b',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  authorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5badec',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    paddingVertical: 16,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  primaryActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  primaryActionCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  fullWidthCard: {
    width: width - 48,
  },
  disabledCard: {
    opacity: 0.6,
  },
  primaryActionGradient: {
    padding: 20,
    minHeight: 140,
    position: 'relative',
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  disabledIcon: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  primaryActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  disabledText: {
    color: '#94a3b8',
  },
  primaryActionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  disabledDescription: {
    color: '#94a3b8',
  },
  primaryActionArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  secondaryActionsContainer: {
    gap: 12,
  },
  secondaryActionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  secondaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(91, 173, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  disabledSecondaryIcon: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  secondaryActionText: {
    flex: 1,
  },
  secondaryActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  secondaryActionDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default Dashboard;