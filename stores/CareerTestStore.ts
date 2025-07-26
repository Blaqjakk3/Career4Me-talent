export interface Question {
    id: string;
    question: string;
    options: string[];
    conditional?: (answers: Record<string, any>) => boolean;
    allowCustom?: boolean;
  }
  
  // Questions based on career stage
  export const questions = {
    "Pathfinder": [
      {
        id: 'educationLevel',
        question: 'What level of education are you at?',
        options: ['High School', 'Some College', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD']
      },
      {
        id: 'program',
        question: 'What program was/is offered?',
        options: ['Computer Science', 'Business Administration', 'Engineering', 'Healthcare', 'Liberal Arts', 'Education', 'Other'],
        conditional: (answers: Record<string, any>) => {
          const educationLevel = answers.educationLevel;
          return educationLevel && !['High School', 'Some College'].includes(educationLevel);
        }
      },
      {
        id: 'currentSkills',
        question: 'What skills do you have?',
        options: ['Programming', 'Communication', 'Leadership', 'Analysis', 'Creative Design', 'Problem Solving', 'Research', 'Other']
      },
      {
        id: 'interestedSkills',
        question: 'What skills intrigue you and you are interested in learning?',
        options: ['Data Analysis', 'Digital Marketing', 'Software Development', 'Project Management', 'Graphic Design', 'Public Speaking', 'Financial Analysis', 'Other']
      },
      {
        id: 'mainInterests',
        question: 'What are your main interests?',
        options: ['Technology', 'Arts & Creativity', 'Science', 'Business', 'Social Impact', 'Education', 'Health & Wellness', 'Other']
      },
      {
        id: 'interestedFields',
        question: 'What fields are you interested in?',
        options: ['Information Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Non-profit', 'Government', 'Other']
      },
      {
        id: 'workEnvironment',
        question: 'What kind of work environment would you be interested in?',
        options: ['Remote', 'Office-based', 'Hybrid', 'Outdoor', 'Laboratory', 'Hospital/Clinical', 'Startup', 'Large Corporation']
      }
    ],
    "Trailblazer": [
      {
        id: 'currentPath',
        question: 'What path or field are you in?',
        options: ['Technology', 'Business', 'Healthcare', 'Education', 'Arts', 'Finance', 'Engineering', 'Other']
      },
      {
        id: 'yearsExperience',
        question: 'How many years of experience do you have in that path?',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-10 years', '10+ years']
      },
      {
        id: 'seniorityLevel',
        question: 'What is your seniority level?',
        options: ['Entry Level', 'Junior', 'Mid-level', 'Senior', 'Lead/Manager', 'Director', 'Executive']
      },
      {
        id: 'educationLevel',
        question: 'What level of education have you attained?',
        options: ['High School', 'Some College', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD']
      },
      {
        id: 'program',
        question: 'What program?',
        options: ['Computer Science', 'Business Administration', 'Engineering', 'Healthcare', 'Liberal Arts', 'Education', 'Other'],
        conditional: (answers: Record<string, any>) => {
          const educationLevel = answers.educationLevel;
          return educationLevel && !['High School', 'Some College'].includes(educationLevel);
        }
      },
      {
        id: 'currentSkills',
        question: 'What skills do you possess at the moment?',
        options: ['Technical Skills', 'Leadership', 'Communication', 'Project Management', 'Analysis', 'Creative Skills', 'Sales', 'Other']
      },
      {
        id: 'interestedSkills',
        question: 'What skills intrigue and are you willing to learn?',
        options: ['Advanced Analytics', 'AI/Machine Learning', 'Digital Transformation', 'Strategic Planning', 'Team Management', 'Innovation', 'Other']
      },
      {
        id: 'mainInterests',
        question: 'What are your main interests?',
        options: ['Technology Innovation', 'Business Strategy', 'People Development', 'Creative Problem Solving', 'Social Impact', 'Research', 'Other']
      },
      {
        id: 'interestedFields',
        question: 'What fields are you interested in?',
        options: ['Tech Startups', 'Consulting', 'Healthcare Tech', 'Financial Services', 'E-commerce', 'Education Tech', 'Other']
      },
      {
        id: 'careerGoals',
        question: 'What are your goals for your career growth?',
        options: ['Move to Management', 'Become Subject Matter Expert', 'Start Own Business', 'Switch Industries', 'Work Internationally', 'Achieve Work-Life Balance', 'Other']
      }
    ],
    "Horizon Changer": [
      {
        id: 'currentPath',
        question: 'What path or field are you currently in?',
        options: ['Technology', 'Business', 'Healthcare', 'Education', 'Arts', 'Finance', 'Engineering', 'Government', 'Other']
      },
      {
        id: 'yearsExperience',
        question: 'How many years of experience do you have in that path?',
        options: ['2-5 years', '6-10 years', '11-15 years', '16-20 years', '20+ years']
      },
      {
        id: 'seniorityLevel',
        question: 'What is your seniority level?',
        options: ['Mid-level', 'Senior', 'Lead/Manager', 'Director', 'VP/Executive', 'C-Suite']
      },
      {
        id: 'educationLevel',
        question: 'What level of education have you attained?',
        options: ['High School', 'Some College', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD']
      },
      {
        id: 'program',
        question: 'What program?',
        options: ['Computer Science', 'Business Administration', 'Engineering', 'Healthcare', 'Liberal Arts', 'Education', 'Other'],
        conditional: (answers: Record<string, any>) => {
          const educationLevel = answers.educationLevel;
          return educationLevel && !['High School', 'Some College'].includes(educationLevel);
        }
      },
      {
        id: 'mainInterests',
        question: 'What are your main interests?',
        options: ['Innovation & Technology', 'Strategic Leadership', 'Social Impact', 'Creative Industries', 'Entrepreneurship', 'Consulting', 'Other']
      },
      {
        id: 'interestedFields',
        question: 'What fields are you interested in?',
        options: ['Tech Industry', 'Consulting', 'Non-profit', 'Startup Ecosystem', 'Healthcare', 'Education', 'Sustainable Business', 'Other']
      },
      {
        id: 'currentSkills',
        question: 'What skills do you possess?',
        options: ['Executive Leadership', 'Strategic Planning', 'Team Building', 'Industry Expertise', 'Change Management', 'Innovation', 'Other']
      },
      {
        id: 'interestedSkills',
        question: 'What skills intrigue and are you willing to learn?',
        options: ['Digital Leadership', 'Sustainable Business Practices', 'Global Market Strategy', 'Emerging Technologies', 'Cross-functional Management', 'Other']
      },
      {
        id: 'currentWorkEnvironment',
        question: 'What work environment are you in now?',
        options: ['Large Corporation', 'Mid-size Company', 'Startup', 'Government', 'Non-profit', 'Consulting Firm', 'Self-employed', 'Other']
      },
      {
        id: 'preferredWorkEnvironment',
        question: 'What work environment are you interested in in your next path?',
        options: ['Startup', 'Scale-up Company', 'Large Corporation', 'Consulting', 'Non-profit', 'Government', 'Entrepreneurship', 'Other']
      },
      {
        id: 'reasonForChange',
        question: 'Why do you want to change your path?',
        options: ['Seeking new challenges', 'Better work-life balance', 'Higher compensation', 'More meaningful work', 'Career growth opportunities', 'Industry changes', 'Personal fulfillment', 'Other'],
        allowCustom: true
      },
      {
        id: 'changeUrgency',
        question: 'How urgent is this change for you?',
        options: ['Immediately (0-3 months)', 'Soon (3-6 months)', 'Within a year', 'In 1-2 years', 'Exploring options (2+ years)']
      }
    ]
  };
  
  // Configuration arrays for question behavior
  export const multiSelectIds = [
    'currentSkills',
    'interestedSkills',
    'mainInterests',
    'interestedFields',
  ];
  
  export const searchEnabledIds = [
    'program',
    'currentSkills',
    'interestedSkills',
    'mainInterests',
    'interestedFields',
  ];