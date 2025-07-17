import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';

const CVWelcome: React.FC = () => {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const handleGetStarted = () => {
    router.push('/cvgeneration/generator');
  };

  const benefits = [
    {
      title: "Professional Templates",
      description: "AI-powered formatting that follows industry standards and best practices"
    },
    {
      title: "ATS-Optimized",
      description: "Designed to pass through Applicant Tracking Systems successfully"
    },
    {
      title: "Instant Generation",
      description: "Create a polished CV in minutes, not hours"
    },
    {
      title: "Customizable Content",
      description: "Add your skills, experience, projects, and certifications easily"
    },
    {
      title: "PDF Export",
      description: "Download your CV as a professional PDF ready for submission"
    },
    {
      title: "Always Updated",
      description: "Keep your CV current with the latest information and formatting trends"
    }
  ];

  const instructions = [
    {
      step: "1",
      title: "Fill Your Information",
      description: "Add your contact details, additional skills, and personal information"
    },
    {
      step: "2",
      title: "Add Your Education",
      description: "Include your degrees, institutions, and graduation dates"
    },
    {
      step: "3",
      title: "List Work Experience",
      description: "Detail your job positions, companies, and key achievements"
    },
    {
      step: "4",
      title: "Showcase Projects",
      description: "Highlight your best projects with technologies and accomplishments"
    },
    {
      step: "5",
      title: "Add Certifications",
      description: "Include relevant certifications to boost your credibility"
    },
    {
      step: "6",
      title: "Generate & Download",
      description: "Create your professional CV and download it as a PDF"
    }
  ];

  return (
    <View style={styles.container}>
      <Header title="CV Generator" onBackPress={handleBackPress} />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Create Your Professional CV</Text>
          <Text style={styles.heroSubtitle}>
            Generate a stunning, ATS-optimized CV in minutes with our AI-powered tool
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Use Our CV Generator?</Text>
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.instructionsContainer}>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{instruction.step}</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>{instruction.title}</Text>
                  <Text style={styles.instructionDescription}>{instruction.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Smart formatting and layout optimization</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Multiple sections for comprehensive CV</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Real-time preview and editing</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Professional PDF export</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>Mobile-friendly interface</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Create Your CV?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of professionals who have successfully created their CVs with our tool
          </Text>
          
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedButtonText}>Get Started Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  heroSection: {
    backgroundColor: '#5badec',
    padding: 30,
    borderRadius: 15,
    marginBottom: 25,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsGrid: {
    gap: 15,
  },
  benefitCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#5badec',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructionsContainer: {
    gap: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  stepNumber: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#5badec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  instructionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureBullet: {
    fontSize: 16,
    color: '#5badec',
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  ctaSection: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: '#5badec',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#5badec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CVWelcome;