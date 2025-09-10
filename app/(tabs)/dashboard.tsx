import { View, Text, ActivityIndicator, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDailyQuote, getCurrentUser, getCareerPathById } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
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
  const [careerPathName, setCareerPathName] = useState<string | null>(null);

  const hasSelectedPath = user?.selectedPath && user.selectedPath.trim() !== '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Fetch career path name if selectedPath exists
          if (currentUser.selectedPath && currentUser.selectedPath.trim() !== '') {
            const careerPath = await getCareerPathById(currentUser.selectedPath);
            setCareerPathName(careerPath?.title || null);
          } else {
            setCareerPathName(null);
            const welcomeModalShown = await AsyncStorage.getItem(`welcomeModalShown_${currentUser.talentId}`);
            if (!welcomeModalShown) {
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
    if (user?.talentId) {
      await AsyncStorage.setItem(`welcomeModalShown_${user.talentId}`, 'true');
    }
  };

  const handleRestrictedFeatureClick = () => {
    setShowPathRequiredModal(true);
  };

  // Handle navigation with animation for primary actions
  const router = useRouter();
  const handlePrimaryActionPress = (href: string) => {
    // Small delay to allow animation to be visible, then navigate
    setTimeout(() => {
      router.push({
        pathname: href as any
      });
    }, 100);
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const primaryActions = [
    { title: 'Explore Path', icon: 'compass-outline', description: 'Discover career paths that match your skills', key: 'career-path', colors: ['#5badec', '#4a9bd1'], href: '/career-path', isRestricted: false },
    { title: 'Learning Roadmap', icon: 'book-outline', description: 'Curated courses to boost your knowledge', key: 'learning', colors: ['#6c5ce7', '#5a4fcf'], href: '/learning', isRestricted: !hasSelectedPath },
    { title: 'Jobs for You', icon: 'briefcase-outline', description: 'Find your next career opportunity', key: 'jobs', colors: ['#00b894', '#00a085'], href: '/jobs', isRestricted: !hasSelectedPath }
  ];

  const secondaryActions = [
    { title: 'CV Analysis', icon: 'document-text-outline', description: 'Get expert feedback on your resume', key: 'analysis', href: '/analysis', isRestricted: !hasSelectedPath },
    { title: 'CV Generation', icon: 'create-outline', description: 'Create a professional CV in minutes', key: 'cvgeneration', href: '/cvgeneration', isRestricted: !hasSelectedPath },
    { title: 'Interview Prep', icon: 'chatbubble-ellipses-outline', description: 'Practice with AI-powered mock interviews', key: 'interview-prep', href: '/interview-prep', isRestricted: !hasSelectedPath },
  ];

  // Individual animated component for each primary action card
  const AnimatedPrimaryCard = ({ item, index }: { item: any, index: number }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    if (item.isRestricted) {
      return (
        <TouchableOpacity 
          key={item.key} 
          style={[styles.primaryActionCard, index === 2 && styles.fullWidthCard, styles.disabledCard]} 
          activeOpacity={0.8} 
          onPress={handleRestrictedFeatureClick}
        >
          <LinearGradient colors={['#e2e8f0', '#cbd5e1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryActionGradient}>
            <View style={styles.primaryActionContent}>
              <View style={[styles.primaryActionIcon, styles.disabledIcon]}>
                <Ionicons name={item.icon as any} size={32} color="#94a3b8" />
              </View>
              <Text style={[styles.primaryActionTitle, styles.disabledText]}>{item.title}</Text>
              <Text style={[styles.primaryActionDescription, styles.disabledDescription]}>{item.description}</Text>
            </View>
            <View style={styles.primaryActionArrow}>
              <Ionicons name="lock-closed" size={20} color="#94a3b8" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <Animated.View key={item.key} style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => handlePrimaryActionPress(item.href)}
          style={[styles.primaryActionCard, index === 2 && styles.fullWidthCard]}
          activeOpacity={0.9}
        >
          <LinearGradient colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryActionGradient}>
            <View style={styles.primaryActionContent}>
              <View style={styles.primaryActionIcon}>
                <Ionicons name={item.icon as any} size={32} color="#fff" />
              </View>
              <Text style={styles.primaryActionTitle}>{item.title}</Text>
              <Text style={styles.primaryActionDescription}>{item.description}</Text>
            </View>
            <View style={styles.primaryActionArrow}>
              <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSecondaryActionCard = (item: any) => {
    if (item.isRestricted) {
      return (
        <TouchableOpacity key={item.key} style={[styles.secondaryActionCard, styles.disabledCard]} activeOpacity={0.8} onPress={handleRestrictedFeatureClick}>
          <View style={styles.secondaryActionContent}>
            <View style={[styles.secondaryActionIcon, styles.disabledSecondaryIcon]}><Ionicons name={item.icon as any} size={28} color="#94a3b8" /></View>
            <View style={styles.secondaryActionText}>
              <Text style={[styles.secondaryActionTitle, styles.disabledText]}>{item.title}</Text>
              <Text style={[styles.secondaryActionDescription, styles.disabledDescription]}>{item.description}</Text>
            </View>
            <Ionicons name="lock-closed" size={22} color="#94a3b8" />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <Link 
        key={item.key} 
        href={{
          pathname: item.href
        }} 
        asChild
      >
        <TouchableOpacity style={styles.secondaryActionCard} activeOpacity={0.9}>
          <View style={styles.secondaryActionContent}>
            <View style={styles.secondaryActionIcon}><Ionicons name={item.icon as any} size={28} color="#6c5ce7" /></View>
            <View style={styles.secondaryActionText}>
              <Text style={styles.secondaryActionTitle}>{item.title}</Text>
              <Text style={styles.secondaryActionDescription}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#6c5ce7" />
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <LinearGradient colors={['#6c5ce7', '#5badec', '#4a9bd1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.userSection}>
                <View style={styles.avatarContainer}>
                  {user.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} /> : <View style={styles.defaultAvatar}><Ionicons name="person-outline" size={36} color="#fff" /></View>}
                  <View style={styles.statusDot} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.welcomeText}>Hello 👋</Text>
                  <Text style={styles.userName}>{user.fullname || 'Career Explorer'}</Text>
                  <Text style={styles.userRole}>{user.careerStage || 'Ready to grow'}</Text>
                  <View style={styles.pathNameContainer}>
                    <Text style={styles.pathNameText}>
                      {careerPathName ? careerPathName:'No Path Selected'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.floatingElements}>
                <View style={[styles.floatingCircle, styles.circle1]} />
                <View style={[styles.floatingCircle, styles.circle2]} />
                <View style={[styles.floatingCircle, styles.circle3]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.quoteSection}>
          <View style={styles.quoteCard}>
            <View style={styles.quoteHeader}>
              <View style={styles.quoteIconContainer}><Ionicons name="bulb-outline" size={24} color="#6c5ce7" /></View>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Career Journey</Text>
          <View style={styles.primaryActionsGrid}>
            {primaryActions.map((item, index) => (
              <AnimatedPrimaryCard key={item.key} item={item} index={index} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Tools</Text>
          <View style={styles.secondaryActionsContainer}>
            {secondaryActions.map((item) => renderSecondaryActionCard(item))}
          </View>
        </View>
      </ScrollView>

      <SuccessModal visible={showWelcomeModal} onClose={handleWelcomeModalClose} title="Welcome to Career4Me!" message="To get the most out of our platform, we recommend starting by exploring career paths that match your interests and skills." buttonText="Got it!" />
      <PathRequiredModal visible={showPathRequiredModal} onClose={() => setShowPathRequiredModal(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 16, fontSize: 18, color: '#64748b', fontWeight: '500' },
  headerContainer: { marginBottom: 24 },
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerContent: { position: 'relative' },
  userSection: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
  defaultAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
  statusDot: { position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#2ecc71', borderWidth: 3, borderColor: '#6c5ce7' },
  userInfo: { flex: 1 },
  welcomeText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  userName: { fontSize: 26, fontWeight: '700', color: '#fff', marginTop: 4 },
  userRole: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontStyle: 'italic' },
  pathNameContainer: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pathNameLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  pathNameText: { fontSize: 13, color: '#fff', fontWeight: '700', fontStyle: 'italic' },
  floatingElements: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  floatingCircle: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' },
  circle1: { width: 100, height: 100, top: -30, right: -30, transform: [{ rotate: '30deg' }] },
  circle2: { width: 80, height: 80, bottom: -20, right: 50, transform: [{ rotate: '60deg' }] },
  circle3: { width: 50, height: 50, top: 30, right: 90, transform: [{ rotate: '90deg' }] },
  quoteSection: { paddingHorizontal: 24, marginBottom: 32, marginTop: -24 },
  quoteCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 5, shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  quoteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  quoteIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(108, 92, 231, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  quoteLabel: { fontSize: 15, fontWeight: '700', color: '#6c5ce7' },
  quoteContent: { paddingVertical: 8 },
  quoteText: { fontSize: 17, lineHeight: 26, color: '#1e293b', fontStyle: 'italic', marginBottom: 16 },
  authorText: { fontSize: 15, fontWeight: '600', color: '#6c5ce7', textAlign: 'right' },
  errorText: { fontSize: 15, color: '#ef4444', textAlign: 'center', paddingVertical: 16 },
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 24 },
  primaryActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  primaryActionCard: { width: (width - 64) / 2, marginBottom: 16, borderRadius: 24, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 14 },
  fullWidthCard: { width: width - 48 },
  disabledCard: { opacity: 0.7 },
  primaryActionGradient: { padding: 24, minHeight: 160, position: 'relative' },
  primaryActionContent: { flex: 1 },
  primaryActionIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  disabledIcon: { backgroundColor: 'rgba(148, 163, 184, 0.2)' },
  primaryActionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  disabledText: { color: '#94a3b8' },
  primaryActionDescription: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },
  disabledDescription: { color: '#94a3b8' },
  primaryActionArrow: { position: 'absolute', top: 20, right: 20 },
  secondaryActionsContainer: { gap: 16 },
  secondaryActionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#9ca3af', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  secondaryActionContent: { flexDirection: 'row', alignItems: 'center' },
  secondaryActionIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(108, 92, 231, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  disabledSecondaryIcon: { backgroundColor: 'rgba(148, 163, 184, 0.1)' },
  secondaryActionText: { flex: 1 },
  secondaryActionTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  secondaryActionDescription: { fontSize: 14, color: '#64748b', lineHeight: 20 },
});

export default Dashboard;