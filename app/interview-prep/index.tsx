import { View, SafeAreaView, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import InterviewQuestions from '@/components/InterviewQuestions'
import { router } from 'expo-router';
import Header from '@/components/Header';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

const handleBackPress = () => {
  router.back();
};

const Interviewprep = () => {
  const [showAIQuestions, setShowAIQuestions] = useState(false);

  const interviewTips = [
    {
      icon: 'account-tie',
      title: 'Dress Appropriately',
      description: 'Dress one level above the company\'s dress code. When in doubt, business attire is always a safe choice.',
      color: '#3b82f6'
    },
    {
      icon: 'clock-outline',
      title: 'Arrive Early',
      description: 'Plan to arrive 10-15 minutes early. This shows respect for the interviewer\'s time and gives you a buffer.',
      color: '#10b981'
    },
    {
      icon: 'handshake',
      title: 'Body Language',
      description: 'Maintain eye contact, offer a firm handshake, sit up straight, and avoid fidgeting during the interview.',
      color: '#8b5cf6'
    },
    {
      icon: 'brain',
      title: 'Research the Company',
      description: 'Learn about the company\'s mission, values, recent news, and the role you\'re applying for.',
      color: '#f59e0b'
    },
    {
      icon: 'message-question-outline',
      title: 'Prepare Questions',
      description: 'Have thoughtful questions ready about the role, team culture, and company growth opportunities.',
      color: '#ef4444'
    },
    {
      icon: 'phone-off',
      title: 'Silence Your Phone',
      description: 'Turn off your phone or put it on silent mode. Keep it away during the entire interview process.',
      color: '#6b7280'
    },
    {
      icon: 'file-document-outline',
      title: 'Bring Copies',
      description: 'Bring multiple copies of your resume, a notepad, and a pen. Be prepared to take notes.',
      color: '#14b8a6'
    },
    {
      icon: 'heart-outline',
      title: 'Stay Positive',
      description: 'Maintain a positive attitude, smile naturally, and show enthusiasm for the opportunity.',
      color: '#f97316'
    },
    {
      icon: 'account-group',
      title: 'Be Authentic',
      description: 'Be yourself while remaining professional. Authenticity helps build genuine connections.',
      color: '#84cc16'
    },
    {
      icon: 'email-outline',
      title: 'Follow Up',
      description: 'Send a thank-you email within 24 hours, reiterating your interest and key qualifications.',
      color: '#ec4899'
    }
  ];

  if (showAIQuestions) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title="AI Interview Questions" 
          onBackPress={() => setShowAIQuestions(false)} 
        />
        <View style={styles.content}>
          <InterviewQuestions />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Interview Practice" onBackPress={handleBackPress} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="briefcase-check" size={32} color="#5badec" />
            <Text style={styles.title}>Interview Success Guide</Text>
          </View>
          <Text style={styles.subtitle}>
            Master these fundamentals to make a great first impression and increase your chances of success.
          </Text>
        </View>

        <View style={styles.tipsContainer}>
          {interviewTips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={[styles.iconContainer, { backgroundColor: `${tip.color}15` }]}>
                <MaterialCommunityIcons 
                  name={tip.icon as any} 
                  size={24} 
                  color={tip.color} 
                />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.practiceSection}>
          <View style={styles.practiceHeader}>
            <MaterialCommunityIcons name="robot" size={28} color="#5badec" />
            <Text style={styles.practiceTitle}>Ready to Practice?</Text>
          </View>
          <Text style={styles.practiceDescription}>
            Now that you know the basics, let's practice with AI-generated questions tailored to your profile and career goals.
          </Text>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setShowAIQuestions(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="brain" size={20} color="#fff" />
            <Text style={styles.startButtonText}>Start AI Interview Practice</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#f59e0b" />
            <Text style={styles.footerText}>
              Remember: The best preparation combines understanding these fundamentals with practicing specific questions for your target role.
            </Text>
          </View>
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
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  tipsContainer: {
    padding: 16,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  practiceSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  practiceDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#5badec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 8,
  },
  footer: {
    backgroundColor: '#fffbeb',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footerText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});

export default Interviewprep;