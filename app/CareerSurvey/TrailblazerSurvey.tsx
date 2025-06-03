import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { databases, config, getCurrentUser, saveCareerPath, isCareerPathSaved, Query } from '../../lib/appwrite';
import SurveyCareerCard from '@/components/SurveyCareerCard';
import AutoComplete from '@/components/AutoComplete';
import SelectedItemsList from '@/components/SelectedItemsList';
import ModalSelect from '@/components/ModalSelect';
import ModalSelectorButton from '@/components/ModalSelectorButton';
import { saveSurveyDataForTrailblazer, completeTrailblazerSurvey } from '../../components/careerTrailblazerMatching';
import { findCareerMatchesForTrailblazer } from '../../components/careerTrailblazerMatching';

const TrailblazerSurvey = () => {
  // User selections
  const [currentCareerPath, setCurrentCareerPath] = useState<string>('');
  const [degrees, setDegrees] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  // Modal visibility states
  const [careerPathModalVisible, setCareerPathModalVisible] = useState(false);
  const [skillsModalVisible, setSkillsModalVisible] = useState(false);
  const [interestsModalVisible, setInterestsModalVisible] = useState(false);
  const [industriesModalVisible, setIndustriesModalVisible] = useState(false);

  // Input values for autocomplete
  const [degreeInput, setDegreeInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');

  // Survey data
  const [availableDegrees] = useState([
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
  ]);

  const [availableCertifications] = useState([
    "Ableton Live Certification", "Adobe Certified Expert", "Adobe Certified Expert (ACE)", "Adobe Certified Expert (Premiere Pro)", "Advanced Cinematography Certification", "Advanced Level Test Analyst (ISTQB)", "Advanced Practice Registered Nurse (APRN)", "AI and Automation Certifications", "AI Ethics Certification", "AI Product Management Certification", "Anesthesiology Board Certification", "Animation Mentor Certification", "APICS certification", "Apple iOS Developer", "APR (Accredited in Public Relations)", "AR Development Certification", "ASA (Associate of the Society of Actuaries)", "ASCE Certification (optional)", "Audio Engineering Society (AES) Certification", "Automotive Service Excellence (ASE) Certification", "AWS Certified Data Analytics", "AWS Certified Developer", "AWS Certified DevOps Engineer", "AWS Certified Machine Learning - Specialty", "AWS Certified Machine Learning Specialty", "AWS Certified Solutions Architect", "Azure Solutions Architect Expert", "Backend Developer Certification", "Biomedical Engineering Certification", "Biosafety Certifications", "Blockchain Developer Certification", "Board Certification in Surgery", "Board Certified Environmental Engineer (BCEE)", "Brand Strategy Certification", "Broadcast Meteorology Certification", "CAPM (Certified Associate in Project Management)", "Carbon Accounting Certification", "CBAP (Certified Business Analysis Professional)", "CCNA (Cisco Certified Network Associate)", "CEH (Certified Ethical Hacker)", "Certified Aerospace Technologist (CAT)", "Certified Agile Tester (CAT)", "Certified Art Director (CAD)", "Certified Automotive Engineer (CAE)", "Certified Biologist (CBiol)", "Certified Biotechnologist", "Certified Blockchain Solutions Architect (CBSA)", "Certified Chemist (American Chemical Society)", "Certified Climate Scientist (AMS)", "Certified Environmental Scientist (CES)", "Certified Fashion Designer (CFD)", "Certified Full Stack Web Developer (freeCodeCamp)", "Certified Interior Designer (CID)", "Certified JavaScript Developer", "Certified Kubernetes Application Developer (CKAD)", "Certified Manufacturing Engineer (CMfgE)", "Certified Materials Professional (CMP) - optional", "Certified Meteorologist (AMS or NWA)", "Certified Microbiologist (ASM)", "Certified Nuclear Engineer", "Certified Petroleum Engineer (CPE)", "Certified Process Safety Professional", "Certified Professional Copywriter", "Certified Professional Sales Leader (CPSL)", "Certified Robotics Engineer", "Certified Scrum Product Owner", "Certified Scrum Product Owner (CSPO)", "Certified Supply Chain Professional (CSCP)", "Certified Systems Analyst Professional", "Certified Usability Analyst (CUA)", "CFA (Chartered Financial Analyst)", "CFP (Certified Financial Planner)", "Chiropractic License", "CIA (Certified Internal Auditor)", "CISSP", "CISSP (Certified Information Systems Security Professional)", "Climate Risk Certification", "Clinical Laboratory Certification", "Clinical Research Certification", "CLTD (Certified in Logistics, Transportation, and Distribution)", "CMC (Certified Management Consultant)", "CMM (Certified Meeting Manager)", "CMP (Certified Meeting Professional)", "CompTIA Network+", "CompTIA Security+", "Content Marketing Certification", "CPA (Certified Public Accountant)", "CPCU (Chartered Property Casualty Underwriter)", "CPIM (Certified in Planning and Inventory Management)", "Creative Leadership Certification", "Credit Risk Certification", "Crime Scene Certification", "Crisis Communication Certification", "CSCP (Certified Supply Chain Professional)", "CSEP (Certified Special Events Professional)", "Curriculum Development Certification", "CWM (Chartered Wealth Manager)",
    "Data Analyst Certification", "Data Science Certifications", "Deep Learning Specialization", "Dental License", "Design Thinking Certification", "Digital Creative Direction Certification", "Digital Marketing Certification", "Digital PR certifications", "Directors Guild Membership", "DNA Analyst Certification", "Docker Certified Associate", "Educational Consultant Certification", "Electric Vehicle Certification", "Emergency Management Certifications", "Enrolled Agent (EA)", "Environmental Scientist Certification", "FAA Certification (for specific roles)", "Fashion Institute Certification", "FDA Regulatory Affairs Certification", "Film Production Certification", "Final Cut Pro Certification", "Forensic Scientist Certification (ABC, AAFS)", "FRM (Financial Risk Manager)", "Frontend Developer Certification", "FSA (Fellow of the Society of Actuaries)", "Full-Stack Web Developer Certification", "Geotechnical Engineer Certification (state-dependent)", "GIAC Penetration Tester", "GIS Certification", "GIS Professional Certification", "Google Associate Android Developer", "Google Cloud AI Certification", "Google Cloud Architect", "Google Cloud Engineer", "Google Cloud Professional Data Engineer", "Google Data Analytics Certificate", "Google Data Engineer", "Google Mobile Web Specialist", "Google Professional Cloud Architect", "Google Professional DevOps Engineer", "Google UX Design Certificate", "Graphic Design Association Certification", "Hazardous Materials Certification", "Hazardous Materials Handling", "Hazardous Materials Management Certification", "Hazardous Waste Operations (HAZWOPER) Certification", "Hazardous Waste Operations Certification", "Health, Safety and Environment (HSE) Certification", "Healthcare Management Certification", "IBM AI Engineering Professional Certificate", "IBM Data Science Professional Certificate", "INCOSE Certified Systems Engineering Professional (CSEP)", "Instructional Design Certification", "ISO 13485 Medical Devices Quality Management", "ISTQB Certification", "IStructE Certification", "ITIL Certification", "ITIL Foundation Certification", "Juniper Networks Certified Associate (JNCIA)", "Kubernetes Administrator (CKA)", "Laboratory safety certifications", "Laboratory Safety Certifications", "Lean Six Sigma Certification", "LEED Accreditation", "LEED Accredited Professional", "LEED Green Associate", "Library Science Certification", "Licensed Psychologist", "Logic Pro Certification", "Machine Learning Certification", "Medical Laboratory Scientist Certification", "Medical License", "Microsoft Certified: Azure AI Engineer Associate", "Microsoft Certified: Azure Database Administrator Associate", "Microsoft Certified: Azure Developer Associate", "Microsoft Certified: Azure Web Developer", "Microsoft Certified: Data Analyst Associate", "Microsoft SQL Server Certification", "Natural Language Processing Specialization", "NCIDQ Certification", "Nuclear Quality Assurance Certification", "Occupational Therapy License", "Optometry License", "Oracle Certified Professional", "Oracle Certified Professional, Java SE", "OSCP (Offensive Security Certified Professional)", "PE License (optional based on role)", "PE License (Professional Engineer)", "Pediatrics Board Certification", "Pharmacy License", "PhD in Astronomy/Astrophysics", "PhD in Physics (for research positions)", "PhD in Relevant Field", "Physical Therapy License", "PMI-PBA (Professional in Business Analysis)", "PMP (Project Management Professional)", "PMP (Project Management Professional) – often beneficial", "Policy Analysis Certification", "PRINCE2", "Principal Certification", "Pro Tools Certification", "Product Management Certification", "Professional Engineer (PE) License", "Professional Geologist License (state-specific)", "Professional Photography Certification", "Professional Physicist certification",
    "Prompt Engineering Certification", "Radiation Safety certification (for certain fields)", "Radiation Safety Officer Certification", "Radiology Board Certification", "Reactor Operator License (for certain positions)", "Registered Dietitian Certification", "RN License", "ROS (Robot Operating System) Certification", "SAFe Product Owner/Product Manager Certification", "Sales Management Certification (various providers)", "School Counselor Certification", "SEO Copywriting Certification", "Series 79 License", "SHRM-CP (Society for HR Management)", "Six Sigma Black Belt", "Six Sigma Certification", "Society of Petroleum Engineers (SPE) Certification", "Special Education Certification", "Specialized certifications in microbiology, marine biology, etc.", "STCW Certification (Standards of Training, Certification and Watchkeeping)", "Structural Engineer (SE) License", "Structural Engineering Certification Board (SECB) Certification", "Sustainability Professional Certification", "Sustainable Fashion Certification", "Systems Engineering Certification", "Teaching License", "Technical Writing Certification", "Telescope Operation Certifications", "TensorFlow Developer", "TESOL (Teaching English to Speakers of Other Languages)", "Textile Design Certification", "Toon Boom Certification", "U.S. Coast Guard License (for certain roles)", "Unity Certified Developer", "Unity Certified Programmer", "Unreal Engine Developer Certification", "VR/AR Design Certifications", "WELL AP Certification", "Well Control Certification"
  ]);

  const [availableSkills] = useState([
    "2D/3D Animation", "3D Modeling", "Accounting", "Actor Direction", "Adaptive Teaching", "Administration", "Adobe Creative Suite", "Aerodynamics", "Agile Methodologies", "AI Fine-tuning", "AI Systems Knowledge", "Algorithms", "Anatomy", "Android Development", "Anesthesia Administration", "API Design", "API Development", "Astrophysical Research", "Atmospheric Physics", "Audio Editing", "Audio Mixing", "Auditing", "AutoCAD", "Automation", "Automotive Systems", "Avionics", "AWS", "Azure", "Backend Development", "Backup & Recovery", "Behavioral Management", "Big Data", "Big Data Tools (Spark, Hadoop)", "Bioinformatics", "Biomaterials", "Biomechanics", "Blockchain", "Brand Communication", "Brand Development", "Brand Messaging", "Budgeting", "Bug Tracking", "Building Codes and Standards", "Building Design", "Business Planning", "Business Process Modeling", "C#", "C#/C++ Programming", "CAD Design", "CAD/CAM Systems", "Carbon Footprint Analysis", "Career Guidance", "Cataloging", "Chain of Custody", "Character Design", "Chemical Analysis", "Chemical Reactions", "Child Healthcare", "CI/CD", "Cinematography", "Circuit Design", "Circular Economy Strategies", "Classroom Management", "Client Communication", "Client Management", "Client Relations", "Climate Modeling", "Clinical Evaluation", "Cloud Computing", "Color Theory", "Communication", "Communication and Presentation", "Compliance", "Computational Fluid Dynamics (CFD)", "Computational Modeling", "Computer Vision", "Computer-Aided Design (CAD)", "Conceptual Thinking", "Content Creation", "Content Writing", "Control Systems", "Counseling", "Courtroom Testimony", "Creative Direction", "Creative Strategy", "Creative Writing", "Creativity", "Credit Risk Assessment", "Crime Scene Analysis", "Crisis Management", "Critical Thinking", "CRM Management", "Cross-Browser Compatibility", "Cross-Functional Collaboration", "Cryptography", "Cultural Sensitivity", "Curriculum Design", "Curriculum Development", "Customer Relations", "Data Analysis", "Data Annotation", "Data Interpretation", "Data Modeling", "Data Pipelines", "Data Security", "Data Visualization", "Data-Driven Decision Making", "Database Management", "DAW Proficiency", "Debugging", "Decision Making", "Deep Learning", "Dental Procedures", "Diagnosis", "Dietary Counseling", "Digital Design Tools", "DNA Analysis", "Drilling Techniques", "E-Learning Development", "Editing", "Educational Research", "Electric Vehicle Technology", "Electronics", "Emergency Alert Systems", "Employee Relations", "Energy Production", "Enhanced Oil Recovery", "Environmental Data Analysis", "Environmental Impact Assessment", "Environmental Modeling", "Environmental Policy", "ERP System Proficiency", "Ethical Hacking", "Event Coordination", "Evidence Interpretation", "Excel", "Experimental Design", "Eye Exams", "Failure Analysis", "Fashion Illustration", "Feature Engineering", "Field Research Techniques", "Field Sampling", "Fieldwork", "Financial Analysis", "Financial Management", "Financial Modeling", "Financial Planning", "Financial Reporting", "Firewall Management", "Fluid Dynamics", "Forecasting", "Foundation Design", "Frontend Development", "Game Design", "Garment Construction", "Genetics", "Geological and Site Investigation", "Geological Surveys", "Geology", "Geospatial Analysis", "GIS Mapping", "Health Education", "Healthcare Management", "HR Policies", "HTML/CSS", "Human Factors Engineering", "Human-AI Interaction Design", "Incident Response", "Individualized Education Plans (IEPs)", "Information Management", "Innovation", "Instructional Strategies", "Instructional Technology", "Instrumentation", "Inventory Control", "Investment Management", "Investment Strategies", "iOS Development", "IT Infrastructure", "JavaScript", "Laboratory Techniques", "Laboratory Testing", "Language Instruction", "Leadership", "Lean Manufacturing", "Lesson Planning", "Lighting Design", "Lighting Techniques", "Load Calculations", "Load Testing", "Loan Evaluation", "Logistics Management", "Machine Learning", "Machine Learning Concepts", "Manufacturing Processes", "Marine Systems Integration", "Market Analysis", "Market Research", "Marketing Strategy", "Material Science", "Material Selection", "Materials Science", "Materials Testing", "Mathematical Modeling", "Mechanical Design", "Mechanical Systems", "Media Relations", "Medical Device Design", "Medical Imaging", "Medical Knowledge", "Medication Management", "Mental Health Support", "Mergers & Acquisitions", "Microbial Analysis", "Model Deployment", "Model Evaluation", "Model-Based Systems Engineering (MBSE)", "Molecular Biology", "Music Composition", "Natural Language Processing", "Network Configuration", "Network Security", "Neural Networks", "Node.js", "NoSQL Databases", "Nuclear Physics", "Nuclear Reactor Design", "Nutrition Planning", "Observational Techniques", "Operations Research", "Pain Management", "Pathogen Identification", "Patient Care", "Patient Counseling", "Patient Monitoring", "Pattern Making", "Penetration Testing", "Performance Optimization", "Performance Tuning", "Pharmaceutical Knowledge", "Photo Editing", "Photography", "Policy Analysis", "Policy Evaluation", "Policy Implementation", "Pollution Control", "Post-Production", "Power Systems", "Powertrain Engineering", "Presentation Skills", "Problem Solving", "Process Control", "Process Design", "Process Improvement", "Process Optimization", "Product Development", "Product Roadmapping", "Production Management", "Programming", "Project Management", "Project Planning", "Prompt Engineering", "Propulsion Systems", "Prototyping", "Psychological Assessment", "Public Communication", "Python", "Python/R Programming", "Quality Control", "Radiation Safety", "React", "React Native", "Reactor Design", "Recruitment", "Regression Testing", "Regulatory Compliance", "Rehabilitation", "Remediation Technologies", "Report Writing", "Requirements Engineering", "Requirements Gathering", "Research", "Research Assistance", "Research Methodologies", "Research Methodology", "Research Skills", "Reservoir Engineering", "Responsive Design", "Risk Analysis", "Risk Assessment", "Risk Management", "Roadmapping", "Robotics Design", "Rock Mechanics", "Safety Protocols", "Sales Strategy", "Scientific Computing", "Scientific Writing", "Script Analysis", "Scripting and Automation", "Security", "Security Best Practices", "Security Frameworks", "Seismic Design", "Seismic Risk Assessment", "SEO Knowledge", "Server Administration", "Server Management", "Ship Design", "Signal Processing", "Slope Stability Analysis", "Smart Contracts", "Social Engineering Techniques", "Software Architecture", "Soil and Rock Mechanics", "Sound Design", "Space Planning", "Spatial Computing", "Spinal Adjustment", "SQL", "Stakeholder Communication", "Stakeholder Engagement", "Stakeholder Management", "Statistical Analysis", "Statistical Modeling", "Statistics", "Storyboarding", "Storytelling", "Strategic Planning", "Stress Analysis", "Structural Analysis", "Structural Design", "Supplier Relations", "Supply Chain Coordination", "Supply Chain Management", "Surgical Techniques", "Sustainability", "Sustainability Reporting", "Systems Design", "Systems Integration", "Tax Compliance", "Tax Planning", "Teacher Training", "Teaching", "Team Leadership", "Technical Analysis", "Technical Documentation", "Telescope Operation", "Test Automation Frameworks", "Testing", "Testing and Debugging", "Textile Design", "Theoretical Physics", "Therapeutic Techniques", "Therapy", "Thermodynamics", "Tissue Engineering", "Transportation Management", "Trend Analysis", "Troubleshooting", "Typography", "UI/UX Design Principles", "Unit Testing", "Unity", "Unity/Unreal Engine", "User Experience Design", "User Research", "UX Design for VR/AR", "Vehicle Design", "Vendor Management", "Version Control", "Version Control (Git)", "Video Editing", "Vision Correction", "Visual Communication", "Visual Composition", "Visual Design", "Visual Storytelling", "VPN Setup", "Vulnerability Assessment", "Waste Management", "Water Treatment", "Weather Forecasting", "Well Design", "Wireframing"
  ]);

  const [availableInterests] = useState([
  "3D Graphics", "Accounting", "AI", "Animation", "App Development", "Architecture", "Art", "Artificial Intelligence", "Astronomy", "Attention to Detail", "Augmented Reality", "Automated Systems", "Automotive", "Aviation", "Banking", "Biology", "Biotechnology", "Blockchain", "Brand Development", "Building Scalable Systems", "Business", "Business Analysis", "Business Development", "Business Innovation", "Business Intelligence", "Business Operations", "Business Strategy", "Chemistry", "Civil Engineering", "Climate", "Climate Action", "Climate Change", "Cloud Databases", "Cloud Infrastructure", "Coding", "Cognitive Science", "Collaboration", "Collaborative Work", "Communication", "Conservation", "Construction", "Consumer Behavior", "Consumer Trends", "Content Creation", "Continuous Learning", "Corporate Responsibility", "Cosmology", "Creative Writing", "Creativity", "Criminal Justice", "Cross-Functional Leadership", "Cultural Exchange", "Cultural Movements", "Cultural Trends", "Current Events", "Cybersecurity", "Data", "Data Analysis", "Data Analytics", "Data Architecture", "Data Visualization", "Data-Driven Decision Making", "Dentistry", "Design", "Digital Art", "Digital Forensics", "Earth Science", "Earth Systems", "Economics", "Education", "Efficiency", "Electricity", "Emerging Technologies", "Energy", "Engineering", "Enterprise Systems", "Entrepreneurship", "Environmental Conservation", "Environmental Impact", "Environmental Issues", "Environmental Protection", "Environmental Science", "Environmental Sustainability", "Ethical Hacking", "Event Management", "Experimentation", "Fashion", "Field Operations", "Film", "Finance", "Forensics", "Game Development", "Gaming", "Geology", "Global Trade", "Green Technology", "Healthcare", "Home Furnishings", "Hospitality", "Human Behavior", "Human Physiology", "Human-Computer Interaction", "Immersive Technology", "Industry Trends", "Infectious Diseases", "Information Technology", "Infrastructure", "Infrastructure Design", "Innovation", "Innovation in AI", "Insurance", "Investments", "IT Consultancy", "Laboratory Work", "Language", "Language Models", "Leadership", "Legal Processes", "Management", "Manufacturing", "Maritime Technology", "Marketing", "Marketing Strategy", "Material Science", "Materials Science", "Mathematics", "Mechanical Systems", "Mechatronics", "Medical Research", "Medicine", "Mental Health", "Mentorship", "Meteorology", "Microbiology", "Mobile Apps", "Music", "Natural Resources", "Nature", "Naval Innovation", "Negotiation", "Networking", "New Materials", "Nuclear Science", "Numbers", "Nutrition", "Operations", "Organization", "Organizational Behavior", "Organizational Development", "Outdoor Work", "Pediatrics", "People Skills", "Physical Therapy", "Physics", "Policy", "Popular Culture", "Power Generation", "Predictive Analytics", "Privacy Protection", "Problem Solving", "Process Improvement", "Product Innovation", "Psychology", "Public Health", "Public Policy", "Public Relations", "Public Safety", "Quality Assurance", "Rehabilitation", "Renewable Energy", "Research", "Research and Development", "Risk Management", "Robotics", "Safety Systems", "Sales", "Science", "Software Development", "Software Quality Advocacy", "Sound Engineering", "Space", "Space Exploration", "Special Needs", "Startups", "Statistics", "Storytelling", "Surgery", "Sustainability", "Sustainable Building", "Sustainable Extraction", "Systems Optimization", "Systems Thinking", "Taxation", "Teaching", "Team Collaboration", "Technology", "Technology Implementation", "Technology Management", "Textiles", "Transportation", "User Experience", "User-Centered Testing", "User-Centric Design", "User-Centric Innovation", "Virtual Reality", "Vision Care", "Visual Arts", "Visual Culture", "Visual Storytelling", "Wealth Management", "Wellness", "Writing"
  ]);

  const industries = [
    "Technology", "Business", "Healthcare", "Finance", "Creative Arts",
    "Engineering", "Science", "Education", "Environment"
  ];

  const [availableCareerPaths] = useState([
    "Accountant", "Actuary", "Aerospace Engineer", "AI Engineer", "AI Product Manager", "Anesthesiologist", "Animator", "Art Director", "Astronomer", "Auditor", "Automotive Engineer", "Backend Developer", "Biologist", "Biomedical Engineer", "Biotechnologist", "Blockchain Developer", "Business Analyst", "Chemical Engineer", "Chemist", "Chiropractor", "Civil Engineer", "Climate Scientist", 
    "Cloud Architect", "College Professor", "Copywriter", "Creative Director", "Credit Analyst", "Curriculum Developer", "Cybersecurity Analyst", "Data Analyst", "Data Engineer", "Data Scientist", "Database Administrator", "Dentist", "DevOps Engineer", "Dietitian", "Education Policy Analyst", "Educational Consultant", "Electrical Engineer", "Entrepreneur", "Environmental Engineer", "Environmental Scientist", "ESL Teacher", "Ethical Hacker", "Event Planner", "Fashion Designer", "Film Director", "Financial Analyst", "Financial Planner", "Forensic Scientist", "Frontend Developer", "Full-Stack Developer", "Game Developer", "Geologist", "Geotechnical Engineer", "Graphic Designer", "Healthcare Administrator", "Human Resources Manager", "Industrial Engineer", "Instructional Designer", "Insurance Underwriter", "Interior Designer", "Investment Banker", "IT Manager", "Librarian", "Logistics Manager", "Machine Learning Engineer", "Management Consultant", "Marine Engineer", "Materials Engineer", "Mechanical Engineer", "Medical Laboratory Scientist", "Medical Researcher", "Meteorologist", "Microbiologist", "Mobile App Developer", "Music Producer", "Network Administrator", "Nuclear Engineer", "Nurse Practitioner", "Occupational Therapist", "Operations Manager", "Optometrist", "Pediatrician", "Petroleum Engineer", "Pharmacist", "Photographer", "Physical Therapist", "Physicist", "Product Manager", "Project Manager", "Prompt Engineer", "Psychologist", "Public Relations Manager", "QA Engineer", "Radiologist", "Risk Manager", 
    "Robotics Engineer", "Sales Manager", "School Counselor", "School Principal", "Software Engineer", "Special Education Teacher", "Structural Engineer", "Supply Chain Manager", "Surgeon", "Sustainability Specialist", "Systems Analyst", "Systems Engineer", "Tax Consultant", "Teacher", "Technical Writer", "UX Designer", "Video Editor", "VR/AR Developer", "Wealth Manager"
  ]);

  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matchedPaths, setMatchedPaths] = useState<any[]>([]);
  const [currentPathData, setCurrentPathData] = useState<any>(null);
  const [savedPaths, setSavedPaths] = useState<Record<string, boolean>>({});

  // Load user's data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Pre-fill the form with user's existing data
          if (user.currentPath) setCurrentCareerPath(user.currentPath);
          if (user.degrees) setDegrees(user.degrees);
          if (user.certifications) setCertifications(user.certifications);
          if (user.skills) setSelectedSkills(user.skills);
          if (user.interests) setSelectedInterests(user.interests);
          if (user.interestedFields) setSelectedIndustries(user.interestedFields);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Functions to handle selections
  const addDegree = (degree: string) => {
    if (!degrees.includes(degree)) {
      setDegrees([...degrees, degree]);
    }
  };

  const addCertification = (certification: string) => {
    if (!certifications.includes(certification)) {
      setCertifications([...certifications, certification]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleIndustry = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  const selectCareerPath = (path: string) => {
    setCurrentCareerPath(path);
    setCareerPathModalVisible(false);
  };

  const removeDegree = (degree: string) => {
    setDegrees(degrees.filter(d => d !== degree));
  };

  const removeCertification = (certification: string) => {
    setCertifications(certifications.filter(c => c !== certification));
  };

  // Handle survey submission
  const handleSurveySubmit = async () => {
    if (!currentCareerPath) {
      alert("Please select your current career path");
      return;
    }

    try {
      setLoading(true);

      // Save survey data to user profile
      await saveSurveyDataForTrailblazer({
        currentPath: currentCareerPath,
        degrees,
        certifications,
        skills: selectedSkills,
        interests: selectedInterests,
        interestedFields: selectedIndustries
      });

      // Find current career path data
      const currentPathResult = await databases.listDocuments(
        config.databaseId,
        config.careerPathsCollectionId,
        [Query.equal('title', currentCareerPath)]
      );

      if (currentPathResult.documents.length > 0) {
        setCurrentPathData(currentPathResult.documents[0]);
      }

      // Find related career matches based on selections
      const matches = await findCareerMatchesForTrailblazer({
        currentPath: currentCareerPath,
        skills: selectedSkills,
        interests: selectedInterests,
        degrees,
        certifications,
        industries: selectedIndustries
      });

      // Check which paths are saved
      const pathSavedStatus: Record<string, boolean> = {};
      for (const path of matches) {
        pathSavedStatus[path.$id] = await isCareerPathSaved(path.$id);
      }

      setSavedPaths(pathSavedStatus);
      setMatchedPaths(matches);
      setShowResults(true);
      setLoading(false);
    } catch (error) {
      console.error("Error processing survey:", error);
      setLoading(false);
      alert("Error processing survey. Please try again.");
    }
  };

  // Handle path selection (for current path)
  const handleSelectPath = async (pathId: string) => {
    try {
      setLoading(true);
      const success = await completeTrailblazerSurvey(pathId);

      if (success) {
        // Navigate to dashboard
        router.replace('/dashboard');
      } else {
        throw new Error("Failed to select path");
      }
    } catch (error) {
      console.error("Error selecting path:", error);
      setLoading(false);
      alert("Error selecting career path. Please try again.");
    }
  };

  // Handle save/bookmark path
  const handleToggleSave = async (pathId: string) => {
    try {
      const result = await saveCareerPath(pathId);

      if (result.success) {
        setSavedPaths(prev => ({
          ...prev,
          [pathId]: result.isSaved
        }));
      }
    } catch (error) {
      console.error("Error saving path:", error);
      alert("Error saving career path. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity
          className="p-2 rounded-full bg-gray-50"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-800">Grow Your Career</Text>
        </View>
        <View style={{ width: 40 }}>{/* Spacer */}</View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Processing your information...</Text>
        </View>
      ) : showResults ? (
        <FlatList
          data={matchedPaths}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-xl font-bold text-gray-800">Your Career Path</Text>
              <Text className="text-gray-600 mt-1 mb-4">
                Here's your current career path and related paths you might want to explore.
              </Text>
              
              {currentPathData && (
                <View className="mb-6">
                  <Text className="text-lg font-bold text-blue-600 mb-2">Your Selected Path</Text>
                  <SurveyCareerCard
                    careerPath={currentPathData}
                    onSelectPath={handleSelectPath}
                    isSaved={true}
                    onToggleSave={() => {}}
                  />
                  
                  <Text className="text-lg font-bold text-gray-800 mt-4 mb-2">Related Paths You May Like</Text>
                  <Text className="text-gray-600 mb-2">
                    These paths are related to your current career. Save them to explore later.
                  </Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <SurveyCareerCard
              careerPath={item}
              onSelectPath={() => {}}
              isSaved={savedPaths[item.$id] || false}
              onToggleSave={handleToggleSave}
            />
          )}
        />
      ) : (
        <ScrollView className="flex-1 px-4">
          <Text className="text-base text-gray-600 mb-4">
            Want to grow in your career? Tell us about your current role, skills, and interests to get personalized guidance.
          </Text>

          {/* Current Career Path Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-2">Current Career</Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3 flex-row items-center justify-between"
              onPress={() => setCareerPathModalVisible(true)}
            >
              <Text className={currentCareerPath ? "text-gray-800" : "text-gray-400"}>
                {currentCareerPath || "Select your current career path"}
              </Text>
              <Text className="text-blue-500">Select</Text>
            </TouchableOpacity>
          </View>

          {/* Education Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-2">Education</Text>

            <Text className="font-semibold text-gray-700 mb-2">Degrees:</Text>
            <AutoComplete
              items={availableDegrees}
              onAdd={addDegree}
              placeholder="Enter your degree"
              inputValue={degreeInput}
              setInputValue={setDegreeInput}
            />
            <SelectedItemsList
              title="Your Degrees"
              items={degrees}
              onRemove={removeDegree}
            />

            <Text className="font-semibold text-gray-700 mb-2 mt-4">Certifications:</Text>
            <AutoComplete
              items={availableCertifications}
              onAdd={addCertification}
              placeholder="Enter your certification"
              inputValue={certificationInput}
              setInputValue={setCertificationInput}
            />
            <SelectedItemsList
              title="Your Certifications"
              items={certifications}
              onRemove={removeCertification}
            />
          </View>

          {/* Skills & Interests Section with Modal Selectors */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-2">Skills & Interests</Text>

            <ModalSelectorButton
              title="Skills"
              selectedItems={selectedSkills}
              onPress={() => setSkillsModalVisible(true)}
            />

            <ModalSelectorButton
              title="Interests"
              selectedItems={selectedInterests}
              onPress={() => setInterestsModalVisible(true)}
            />
          </View>

          {/* Industries Section with Modal Selector */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-2">Industries</Text>

            <ModalSelectorButton
              title="Industries you're interested in"
              selectedItems={selectedIndustries}
              onPress={() => setIndustriesModalVisible(true)}
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className="bg-blue-500 rounded-lg py-3 items-center mb-8"
            onPress={handleSurveySubmit}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-lg">View Your Career Path</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Modal Components */}
      <ModalSelect
        title="Select Your Current Career Path"
        items={availableCareerPaths}
        selectedItems={currentCareerPath ? [currentCareerPath] : []}
        onToggleItem={selectCareerPath}
        onClose={() => setCareerPathModalVisible(false)}
        visible={careerPathModalVisible}
        singleSelect={true}
      />

      <ModalSelect
        title="Select Skills"
        items={availableSkills}
        selectedItems={selectedSkills}
        onToggleItem={toggleSkill}
        onClose={() => setSkillsModalVisible(false)}
        visible={skillsModalVisible}
      />

      <ModalSelect
        title="Select Interests"
        items={availableInterests}
        selectedItems={selectedInterests}
        onToggleItem={toggleInterest}
        onClose={() => setInterestsModalVisible(false)}
        visible={interestsModalVisible}
      />

      <ModalSelect
        title="Select Industries"
        items={industries}
        selectedItems={selectedIndustries}
        onToggleItem={toggleIndustry}
        onClose={() => setIndustriesModalVisible(false)}
        visible={industriesModalVisible}
      />
    </View>
  );
};

export default TrailblazerSurvey;