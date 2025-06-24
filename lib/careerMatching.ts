// careerMatching.ts - Client-side functions

import { databases, functions, getCurrentUser, ID, Query } from './appwrite';
import { config } from './appwrite';

export interface SurveyResponse {
  degrees: string[];
  skills: string[];
  interests: string[];
  interestedFields: string[];
  currentPath?: string; // For Trailblazer and Horizon Changer
  currentSeniorityLevel?: string; // For Trailblazer and Horizon Changer
  additionalContext?: string; // Free text for additional information
}

export interface CareerMatchResult {
  careerPath: any;
  matchScore: number;
  reasoning: string;
  strengths: string[];
  developmentAreas: string[];
  recommendations: string[];
}

export interface SurveyQuestion {
  id: string;
  type: 'multiple-choice' | 'multi-select' | 'text' | 'dropdown';
  question: string;
  options?: string[];
  required: boolean;
  category: 'degrees' | 'skills' | 'interests' | 'fields' | 'current' | 'context';
}

// Available skills list
export const AVAILABLE_SKILLS = [
  "2D/3D Animation", "3D Modeling", "Accounting", "Actor Direction", "Adaptive Teaching", "Administration", "Adobe Creative Suite", "Aerodynamics", "Agile Methodologies", "AI Fine-tuning", "AI Systems Knowledge", "Algorithms", "Anatomy", "Android Development", "Anesthesia Administration", "API Design", "API Development", "Astrophysical Research", "Atmospheric Physics", "Audio Editing", "Audio Mixing", "Auditing", "AutoCAD", "Automation", "Automotive Systems", "Avionics", "AWS", "Azure", "Backend Development", "Backup & Recovery", "Behavioral Management", "Big Data", "Big Data Tools (Spark, Hadoop)", "Bioinformatics", "Biomaterials", "Biomechanics", "Blockchain", "Brand Communication", "Brand Development", "Brand Messaging", "Budgeting", "Bug Tracking", "Building Codes and Standards", "Building Design", "Business Planning", "Business Process Modeling", "C#", "C#/C++ Programming", "CAD Design", "CAD/CAM Systems", "Carbon Footprint Analysis", "Career Guidance", "Cataloging", "Chain of Custody", "Character Design", "Chemical Analysis", "Chemical Reactions", "Child Healthcare", "CI/CD", "Cinematography", "Circuit Design", "Circular Economy Strategies", "Classroom Management", "Client Communication", "Client Management", "Client Relations", "Climate Modeling", "Clinical Evaluation", "Cloud Computing", "Color Theory", "Communication", "Communication and Presentation", "Compliance", "Computational Fluid Dynamics (CFD)", "Computational Modeling", "Computer Vision", "Computer-Aided Design (CAD)", "Conceptual Thinking", "Content Creation", "Content Writing", "Control Systems", "Counseling", "Courtroom Testimony", "Creative Direction", "Creative Strategy", "Creative Writing", "Creativity", "Credit Risk Assessment", "Crime Scene Analysis", "Crisis Management", "Critical Thinking", "CRM Management", "Cross-Browser Compatibility", "Cross-Functional Collaboration", "Cryptography", "Cultural Sensitivity", "Curriculum Design", "Curriculum Development", "Customer Relations", "Data Analysis", "Data Annotation", "Data Interpretation", "Data Modeling", "Data Pipelines", "Data Security", "Data Visualization", "Data-Driven Decision Making", "Database Management", "DAW Proficiency", "Debugging", "Decision Making", "Deep Learning", "Dental Procedures", "Diagnosis", "Dietary Counseling", "Digital Design Tools", "DNA Analysis", "Drilling Techniques", "E-Learning Development", "Editing", "Educational Research", "Electric Vehicle Technology", "Electronics", "Emergency Alert Systems", "Employee Relations", "Energy Production", "Enhanced Oil Recovery", "Environmental Data Analysis", "Environmental Impact Assessment", "Environmental Modeling", "Environmental Policy", "ERP System Proficiency", "Ethical Hacking", "Event Coordination", "Evidence Interpretation", "Excel", "Experimental Design", "Eye Exams", "Failure Analysis", "Fashion Illustration", "Feature Engineering", "Field Research Techniques", "Field Sampling", "Fieldwork", "Financial Analysis", "Financial Management", "Financial Modeling", "Financial Planning", "Financial Reporting", "Firewall Management", "Fluid Dynamics", "Forecasting", "Foundation Design", "Frontend Development", "Game Design", "Garment Construction", "Genetics", "Geological and Site Investigation", "Geological Surveys", "Geology", "Geospatial Analysis", "GIS Mapping", "Health Education", "Healthcare Management", "HR Policies", "HTML/CSS", "Human Factors Engineering", "Human-AI Interaction Design", "Incident Response", "Individualized Education Plans (IEPs)", "Information Management", "Innovation", "Instructional Strategies", "Instructional Technology", "Instrumentation", "Inventory Control", "Investment Management", "Investment Strategies", "iOS Development", "IT Infrastructure", "JavaScript", "Laboratory Techniques", "Laboratory Testing", "Language Instruction", "Leadership", "Lean Manufacturing", "Lesson Planning", "Lighting Design", "Lighting Techniques", "Load Calculations", "Load Testing", "Loan Evaluation", "Logistics Management", "Machine Learning", "Machine Learning Concepts", "Manufacturing Processes", "Marine Systems Integration", "Market Analysis", "Market Research", "Marketing Strategy", "Material Science", "Material Selection", "Materials Science", "Materials Testing", "Mathematical Modeling", "Mechanical Design", "Mechanical Systems", "Media Relations", "Medical Device Design", "Medical Imaging", "Medical Knowledge", "Medication Management", "Mental Health Support", "Mergers & Acquisitions", "Microbial Analysis", "Model Deployment", "Model Evaluation", "Model-Based Systems Engineering (MBSE)", "Molecular Biology", "Music Composition", "Natural Language Processing", "Network Configuration", "Network Security", "Neural Networks", "Node.js", "NoSQL Databases", "Nuclear Physics", "Nuclear Reactor Design", "Nutrition Planning", "Observational Techniques", "Operations Research", "Pain Management", "Pathogen Identification", "Patient Care", "Patient Counseling", "Patient Monitoring", "Pattern Making", "Penetration Testing", "Performance Optimization", "Performance Tuning", "Pharmaceutical Knowledge", "Photo Editing", "Photography", "Policy Analysis", "Policy Evaluation", "Policy Implementation", "Pollution Control", "Post-Production", "Power Systems", "Powertrain Engineering", "Presentation Skills", "Problem Solving", "Process Control", "Process Design", "Process Improvement", "Process Optimization", "Product Development", "Product Roadmapping", "Production Management", "Programming", "Project Management", "Project Planning", "Prompt Engineering", "Propulsion Systems", "Prototyping", "Psychological Assessment", "Public Communication", "Python", "Python/R Programming", "Quality Control", "Radiation Safety", "React", "React Native", "Reactor Design", "Recruitment", "Regression Testing", "Regulatory Compliance", "Rehabilitation", "Remediation Technologies", "Report Writing", "Requirements Engineering", "Requirements Gathering", "Research", "Research Assistance", "Research Methodologies", "Research Methodology", "Research Skills", "Reservoir Engineering", "Responsive Design", "Risk Analysis", "Risk Assessment", "Risk Management", "Roadmapping", "Robotics Design", "Rock Mechanics", "Safety Protocols", "Sales Strategy", "Scientific Computing", "Scientific Writing", "Script Analysis", "Scripting and Automation", "Security", "Security Best Practices", "Security Frameworks", "Seismic Design", "Seismic Risk Assessment", "SEO Knowledge", "Server Administration", "Server Management", "Ship Design", "Signal Processing", "Slope Stability Analysis", "Smart Contracts", "Social Engineering Techniques", "Software Architecture", "Soil and Rock Mechanics", "Sound Design", "Space Planning", "Spatial Computing", "Spinal Adjustment", "SQL", "Stakeholder Communication", "Stakeholder Engagement", "Stakeholder Management", "Statistical Analysis", "Statistical Modeling", "Statistics", "Storyboarding", "Storytelling", "Strategic Planning", "Stress Analysis", "Structural Analysis", "Structural Design", "Supplier Relations", "Supply Chain Coordination", "Supply Chain Management", "Surgical Techniques", "Sustainability", "Sustainability Reporting", "Systems Design", "Systems Integration", "Tax Compliance", "Tax Planning", "Teacher Training", "Teaching", "Team Leadership", "Technical Analysis", "Technical Documentation", "Telescope Operation", "Test Automation Frameworks", "Testing", "Testing and Debugging", "Textile Design", "Theoretical Physics", "Therapeutic Techniques", "Therapy", "Thermodynamics", "Tissue Engineering", "Transportation Management", "Trend Analysis", "Troubleshooting", "Typography", "UI/UX Design Principles", "Unit Testing", "Unity", "Unity/Unreal Engine", "User Experience Design", "User Research", "UX Design for VR/AR", "Vehicle Design", "Vendor Management", "Version Control", "Version Control (Git)", "Video Editing", "Vision Correction", "Visual Communication", "Visual Composition", "Visual Design", "Visual Storytelling", "VPN Setup", "Vulnerability Assessment", "Waste Management", "Water Treatment", "Weather Forecasting", "Well Design", "Wireframing"
];

// Available degrees/education levels
export const AVAILABLE_DEGREES = [
  "Accounting", "Actuarial Science", "Advertising", "Aerospace Engineering", "Anesthesiology", "Animation", "Applied Mathematics", "Applied Physics", "Architectural Engineering", "Architecture", "Artificial Intelligence", "Astronautical Engineering", "Astronomy", "Astrophysics", "Atmospheric Science", "Atmospheric Sciences", "Audio Technology", "Automotive Engineering", "Avionics Engineering", "Biochemical Engineering", "Biochemistry", "Biology", "Biomechanical Engineering",
    "Biomedical Engineering", "Biomedical Science", "Biotechnology", "Business Administration", "Business Analytics", "Business Technology", "Chemical Engineering", "Chemistry", "Chiropractic Medicine", "Cinematography", "Civil Engineering", "Climate Policy", "Climate Science", "Clinical Psychology", "Cognitive Science", "Communications", "Computational Astrophysics", "Computer Engineering", "Computer Graphics", "Computer Science", "Computer Science with Robotics focus", "Conservation Biology", "Construction Engineering", "Corporate Sustainability", "Counseling",
    "Criminal Justice", "Cryptography", "Curriculum and Instruction", "Cybersecurity", "Data Engineering", "Data Science", "Dentistry", "Dietetics", "Digital Arts", "Digital Media", "Directing", "Earth Science", "Ecological Engineering", "Ecology", "Economics", "Education", "Education Administration", "Education Policy", "Educational Leadership", "Educational Technology", "Electrical Engineering", "Engineering Geology", "Engineering Management", "Engineering Physics", "English", "Entrepreneurship", "Environmental Design", "Environmental Engineering", "Environmental Geology", "Environmental Science", "Event Management", "Fashion Design", "Fashion Merchandising", "Fashion Technology", "Film Production", "Film Studies", "Finance", "Financial Technology",
    "Fine Arts", "Forensic Science", "Game Development", "Geological Engineering", "Geology", "Geophysics",
    "Geosciences", "Geotechnical Engineering", "Graphic Design", "Healthcare Administration", "Hospitality Management", "Human Resources",
    "Human-Computer Interaction", "Immunology", "Industrial Engineering", "Information Assurance", "Information Science", "Information Security",
    "Information Systems", "Information Technology", "Innovation Management", "Instructional Design", "Interactive Media",
    "Interior Architecture", "Interior Design", "Journalism", "Library Science", "Linguistics", "Logistics Management", "Machine Learning", "Management", "Management Information Systems", "Manufacturing Engineering", "Marine Biology", "Marine Engineering", "Marketing", "Materials Engineering", "Materials Science", "Mathematics", "Mechanical Engineering", "Mechanical Engineering with Nuclear focus", "Mechanical Engineering with Petroleum focus", "Mechatronics", "Media Arts", "Media Studies", "Medical Engineering", "Medical Laboratory Science", "Medical Microbiology", "Medicine", "Metallurgical Engineering", "Meteorology", "Microbiology", "Molecular Biology", "Molecular Genetics", "Music Business", "Music Production", "Naval Architecture", "Network Engineering", "Network Security", "Nuclear Engineering", "Nursing", "Nutrition",
    "Occupational Therapy", "Ocean Engineering", "Oceanography", "Operations Management", "Optometry", "Pediatrics", "Petroleum Engineering", "Pharmacy", "Photography", "Physical Therapy", "Physics", "Process Engineering", "Project Management", "Psychology", "Public Health", "Public Policy", "Public Relations", "Radiological Science", "Radiology", "Risk Management",
    "Robotics Engineering", "Software Architecture", "Software Engineering", "Sound Engineering", "Space Science", "Special Education", "Statistics", "Structural Engineering", "Subject-Specific Degree", "Supply Chain Management", "Surgery", "Sustainability Management", "Systems Engineering", "Taxation", "Technical Communication", "Textile Design", "Visual Arts", "Visual Communications", "Web Development"
];

// Available interested fields
export const INTERESTED_FIELDS = [
 "Technology", "Business", "Healthcare", "Finance", "Creative Arts",
    "Engineering", "Science", "Education", "Environment"
];

// Available seniority levels
export const SENIORITY_LEVELS = [
  "Entry Level", 
  "Mid-Level",
  "Senior",
];

/**
 * Generate adaptive survey questions based on career stage
 */
export const generateSurveyQuestions = async (careerStage: string): Promise<SurveyQuestion[]> => {
  const baseQuestions: SurveyQuestion[] = [
    {
      id: 'degrees',
      type: 'multi-select',
      question: 'What is your educational background?',
      options: AVAILABLE_DEGREES,
      required: true,
      category: 'degrees'
    },
    {
      id: 'skills',
      type: 'multi-select', 
      question: 'Which skills do you currently have?',
      options: AVAILABLE_SKILLS,
      required: true,
      category: 'skills'
    },
    {
      id: 'interests',
      type: 'multi-select',
      question: 'What are your main interests?',
      options: [
        "Problem Solving",
        "Creative Expression", 
        "Helping Others",
        "Leadership",
        "Analysis & Research",
        "Innovation",
        "Communication",
        "Technical Work",
        "Teamwork",
        "Independent Work"
      ],
      required: true,
      category: 'interests'
    },
    {
      id: 'interestedFields',
      type: 'multi-select',
      question: 'Which fields interest you the most?',
      options: INTERESTED_FIELDS,
      required: true,
      category: 'fields'
    }
  ];

  // Add career stage specific questions
  if (careerStage === 'Trailblazer' || careerStage === 'Horizon Changer') {
    // Get available career paths for current path selection
    const careerPaths = await databases.listDocuments(
      config.databaseId,
      config.careerPathsCollectionId,
      [Query.limit(100)]
    );

    baseQuestions.push({
      id: 'currentPath',
      type: 'dropdown',
      question: 'What is your current career path?',
      options: careerPaths.documents.map(path => `${path.$id}|${path.title}`),
      required: true,
      category: 'current'
    });

    baseQuestions.push({
      id: 'currentSeniorityLevel',
      type: 'dropdown', 
      question: 'What is your current seniority level?',
      options: SENIORITY_LEVELS,
      required: true,
      category: 'current'
    });
  }

  // Add contextual question for all stages
  const contextQuestions = {
    'Pathfinder': 'Tell us about your career aspirations and what type of work environment you prefer.',
    'Trailblazer': 'What specific areas would you like to grow in your current career?',
    'Horizon Changer': 'What motivates you to change career paths and what are you looking for in a new field?'
  };

  baseQuestions.push({
    id: 'additionalContext',
    type: 'text',
    question: contextQuestions[careerStage as keyof typeof contextQuestions],
    required: false,
    category: 'context'
  });

  return baseQuestions;
};

/**
 * Submit survey responses and get AI-powered career matches
 */
export const submitCareerSurvey = async (responses: SurveyResponse): Promise<CareerMatchResult[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Update user attributes with survey responses
    await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        degrees: responses.degrees,
        skills: responses.skills,
        interests: responses.interests, 
        interestedFields: responses.interestedFields,
        currentPath: responses.currentPath || null,
        currentSeniorityLevel: responses.currentSeniorityLevel || null,
        testTaken: true
      }
    );

    // Call the AI matching function
    const result = await functions.createExecution(
      'ai-career-matching', // Function ID
      JSON.stringify({
        talentId: currentUser.talentId,
        careerStage: currentUser.careerStage,
        responses: responses
      })
    );

    const responseData = JSON.parse(result.responseBody);
    
    if (!responseData.success) {
      throw new Error(responseData.error || 'Career matching failed');
    }

    return responseData.matches;
  } catch (error) {
    console.error('Error submitting career survey:', error);
    throw error;
  }
};

/**
 * Get user's current survey status
 */
export const getSurveyStatus = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { testTaken: false, hasSelectedPath: false };
    }

    return {
      testTaken: currentUser.testTaken || false,
      hasSelectedPath: !!currentUser.selectedPath,
      careerStage: currentUser.careerStage
    };
  } catch (error) {
    console.error('Error getting survey status:', error);
    return { testTaken: false, hasSelectedPath: false };
  }
};

/**
 * Save selected career path from survey results
 */
export const selectCareerPathFromSurvey = async (careerPathId: string): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    await databases.updateDocument(
      config.databaseId,
      config.talentsCollectionId,
      currentUser.$id,
      {
        selectedPath: careerPathId
      }
    );

    return true;
  } catch (error) {
    console.error('Error selecting career path:', error);
    return false;
  }
};
