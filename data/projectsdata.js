export const projects = [
  {
    "careerPathId": "6815012109030e02620d",
    "title": "Financial Reporting Automation System",
    "description": "Create an automated workflow to extract data from various sources, transform it, and generate standardized financial reports that comply with current accounting standards.",
    "tools": [
      "Microsoft Excel",
      "Power BI",
      "QuickBooks",
      "Python",
      "Tableau"
    ],
    "outcome": "A functional system that reduces financial reporting time by 70% and improves accuracy by eliminating manual data entry errors.",
    "difficulty": "Intermediate",
    "estimatedDuration": "15–20 hours",
    "prerequisites": [
      "Basic Excel functions",
      "Intro to Python",
      "Understanding of financial statements"
    ],
    "steps": [
      "Gather sample financial data from CSV or QuickBooks exports.",
      "Use Python (pandas) to clean and transform the data.",
      "Load the cleaned data into Power BI.",
      "Design a dashboard with visual summaries and KPIs.",
      "Automate monthly report exports in Excel or PDF format."
    ],
    "evaluationCriteria": [
      "Automated process eliminates manual entry steps.",
      "Dashboard reflects accurate, up-to-date financial data.",
      "Reports meet typical financial reporting standards."
    ]
  },
  {
    "careerPathId": "6815012109030e02620d",
    "title": "Expense Management and Audit Trail System",
    "description": "Develop a comprehensive expense tracking system with automated categorization, approval workflows, and detailed audit trails for compliance purposes.",
    "tools": [
      "Xero",
      "Microsoft Access",
      "SQL Server",
      "VBA",
      "Power Automate"
    ],
    "outcome": "A complete expense management system that reduces processing time by 60% and provides real-time visibility into company spending patterns.",
    "difficulty": "Advanced",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "Database design fundamentals",
      "Basic SQL knowledge",
      "Understanding of internal controls"
    ],
    "steps": [
      "Design database schema for expenses, categories, and approvals in SQL Server.",
      "Create user interface forms in Microsoft Access for data entry.",
      "Implement VBA scripts for automated expense categorization rules.",
      "Set up Power Automate workflows for approval notifications.",
      "Generate comprehensive audit reports with Xero integration."
    ],
    "evaluationCriteria": [
      "System accurately categorizes 90% of expenses automatically.",
      "Approval workflow functions without manual intervention.",
      "Audit trail provides complete transaction history with timestamps."
    ]
  },
  {
    "careerPathId": "6815012109030e02620d",
    "title": "Tax Compliance Dashboard",
    "description": "Build an interactive dashboard that monitors tax obligations, deadlines, and compliance status across multiple jurisdictions and tax types.",
    "tools": [
      "Sage 50",
      "Microsoft Power BI",
      "Excel VBA",
      "TaxSlayer Pro",
      "Google Sheets API"
    ],
    "outcome": "A centralized dashboard that prevents missed tax deadlines and provides real-time compliance status across all tax obligations.",
    "difficulty": "Beginner",
    "estimatedDuration": "10–12 hours",
    "prerequisites": [
      "Basic understanding of tax types",
      "Excel proficiency",
      "Familiarity with dashboard design"
    ],
    "steps": [
      "Extract tax data from Sage 50 and TaxSlayer Pro.",
      "Create a master calendar of tax deadlines in Excel.",
      "Use VBA to automate data refresh and status updates.",
      "Design visual dashboard in Power BI with traffic light indicators.",
      "Set up automated alerts for upcoming deadlines via Google Sheets API."
    ],
    "evaluationCriteria": [
      "Dashboard displays current status of all tax obligations.",
      "Alert system notifies users 30, 15, and 7 days before deadlines.",
      "Visual indicators clearly show compliance status at a glance."
    ]
  },
  {
    "careerPathId": "6815011c892719be136b",
    "title": "Computer Vision Object Detection System",
    "description": "Build an end-to-end object detection system using deep learning that can identify and classify multiple objects in real-time video streams with high accuracy.",
    "tools": [
      "Python",
      "TensorFlow",
      "OpenCV",
      "YOLO v8",
      "PyTorch",
      "Roboflow",
      "Google Colab"
    ],
    "outcome": "A deployed object detection model achieving 90%+ mAP (mean Average Precision) that processes video in real-time at 30+ FPS.",
    "difficulty": "Advanced",
    "estimatedDuration": "35–40 hours",
    "prerequisites": [
      "Deep learning fundamentals",
      "Python programming proficiency",
      "Understanding of convolutional neural networks"
    ],
    "steps": [
      "Collect and annotate training dataset using Roboflow platform.",
      "Set up development environment in Google Colab with GPU acceleration.",
      "Implement YOLO v8 architecture using PyTorch framework.",
      "Train model on custom dataset with data augmentation techniques.",
      "Optimize model using TensorFlow Lite for real-time inference.",
      "Deploy system with OpenCV for video processing and visualization."
    ],
    "evaluationCriteria": [
      "Model achieves minimum 85% precision and recall on test dataset.",
      "Real-time processing maintains 25+ FPS on standard hardware.",
      "System correctly identifies objects in various lighting and weather conditions."
    ]
  },
  {
    "careerPathId": "6815011c892719be136b",
    "title": "Natural Language Processing Chatbot",
    "description": "Create an intelligent conversational AI chatbot that understands context, maintains conversation history, and provides relevant responses using transformer-based models.",
    "tools": [
      "Python",
      "Hugging Face Transformers",
      "LangChain",
      "OpenAI GPT-4 API",
      "Streamlit",
      "ChromaDB",
      "FastAPI"
    ],
    "outcome": "A production-ready chatbot that handles complex queries with contextual understanding and maintains conversation coherence across multiple turns.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "NLP fundamentals",
      "API integration experience",
      "Understanding of transformer architectures"
    ],
    "steps": [
      "Set up development environment with Hugging Face Transformers library.",
      "Implement conversation management using LangChain framework.",
      "Integrate OpenAI GPT-4 API for advanced language understanding.",
      "Build vector database with ChromaDB for context retrieval.",
      "Create web interface using Streamlit for user interaction.",
      "Deploy chatbot service using FastAPI with proper error handling."
    ],
    "evaluationCriteria": [
      "Chatbot maintains context across 5+ conversation turns.",
      "Response relevance score exceeds 80% based on user feedback.",
      "System handles edge cases and provides appropriate fallback responses."
    ]
  },
  {
    "careerPathId": "6815011c892719be136b",
    "title": "Predictive Analytics Dashboard",
    "description": "Develop a machine learning pipeline that analyzes time series data, predicts future trends, and presents insights through an interactive dashboard with automated reporting.",
    "tools": [
      "Python",
      "Scikit-learn",
      "Plotly Dash",
      "Apache Airflow",
      "PostgreSQL",
      "Docker",
      "MLflow"
    ],
    "outcome": "An automated ML pipeline that generates accurate forecasts and delivers actionable insights through a user-friendly dashboard with 95% uptime.",
    "difficulty": "Beginner",
    "estimatedDuration": "18–22 hours",
    "prerequisites": [
      "Basic machine learning concepts",
      "SQL database knowledge",
      "Introduction to data visualization"
    ],
    "steps": [
      "Set up PostgreSQL database and import historical time series data.",
      "Create data preprocessing pipeline using Scikit-learn transformers.",
      "Train forecasting models and track experiments with MLflow.",
      "Build interactive dashboard using Plotly Dash with real-time updates.",
      "Containerize application using Docker for consistent deployment.",
      "Schedule automated model retraining with Apache Airflow."
    ],
    "evaluationCriteria": [
      "Forecasting model achieves MAPE (Mean Absolute Percentage Error) below 10%.",
      "Dashboard loads within 3 seconds and updates data automatically.",
      "Pipeline runs without manual intervention for 30+ days."
    ]
  },
  {
    "careerPathId": "681501158030d4f3b9a1",
    "title": "Customer Churn Prediction Model",
    "description": "Develop a predictive model to identify customers likely to churn, enabling proactive retention strategies.",
    "tools": [
      "Python",
      "Pandas",
      "Scikit-learn",
      "Jupyter Notebook"
    ],
    "outcome": "A machine learning model that accurately predicts customer churn with identified key influencing factors.",
    "difficulty": "Intermediate",
    "steps": [
      "Gather and preprocess customer data (e.g., transaction history, demographics).",
      "Perform exploratory data analysis using Pandas and Matplotlib/Seaborn.",
      "Select and train a classification model (e.g., Logistic Regression, Random Forest) using Scikit-learn.",
      "Evaluate the model's performance using metrics like precision, recall, and F1-score.",
      "Document the findings and insights in a Jupyter Notebook."
    ],
    "prerequisites": [
      "Basic Python programming",
      "Understanding of data analysis concepts",
      "Familiarity with machine learning basics"
    ],
    "estimatedDuration": "20–25 hours",
    "evaluationCriteria": [
      "Model achieves a reasonable accuracy in predicting churn.",
      "Key features influencing churn are identified.",
      "The process is well-documented."
    ]
  },
  {
    "careerPathId": "681501158030d4f3b9a1",
    "title": "Sales Performance Dashboard",
    "description": "Create an interactive dashboard to visualize key sales metrics and performance indicators.",
    "tools": [
      "Tableau",
      "Microsoft Excel",
      "SQL"
    ],
    "outcome": "A dynamic dashboard providing insights into sales trends, targets, and team performance.",
    "difficulty": "Beginner",
    "steps": [
      "Extract sales data from a database or spreadsheet using SQL or Excel.",
      "Clean and prepare the data for visualization in Tableau.",
      "Design various charts and graphs to represent sales metrics (e.g., revenue, units sold, growth rate).",
      "Create an interactive dashboard with filters and drill-down capabilities.",
      "Document the data sources and dashboard functionality."
    ],
    "prerequisites": [
      "Basic understanding of data visualization",
      "Familiarity with Excel or SQL"
    ],
    "estimatedDuration": "15–18 hours",
    "evaluationCriteria": [
      "Dashboard effectively visualizes key sales data.",
      "It is user-friendly and interactive.",
      "Insights into sales performance are easily discernible."
    ]
  },
  {
    "careerPathId": "681501158030d4f3b9a1",
    "title": "Market Basket Analysis for Retail",
    "description": "Analyze transaction data to discover associations between different products that are frequently purchased together.",
    "tools": [
      "Python",
      "Pandas",
      "MLxtend"
    ],
    "outcome": "Identification of product associations that can inform marketing strategies and product placement.",
    "difficulty": "Intermediate",
    "steps": [
      "Gather and preprocess retail transaction data.",
      "Use the Apriori algorithm (implemented in MLxtend) to find frequent itemsets.",
      "Generate association rules from the frequent itemsets.",
      "Interpret the results to identify meaningful product associations.",
      "Document the findings and potential business applications."
    ],
    "prerequisites": [
      "Basic Python programming",
      "Understanding of data analysis",
      "Familiarity with the concept of association rules"
    ],
    "estimatedDuration": "18–22 hours",
    "evaluationCriteria": [
      "Frequent itemsets and association rules are correctly identified.",
      "The analysis provides actionable insights into customer purchasing behavior.",
      "The methodology is clearly explained."
    ]
  },
  {
    "careerPathId": "681501176ab5e70d3a95",
    "title": "DNA Sequence Analysis with Python",
    "description": "Analyze genetic sequences to identify mutations and phylogenetic relationships using bioinformatics tools.",
    "tools": [
      "Biopython",
      "BLAST",
      "Geneious Prime",
      "Python (Pandas, Matplotlib)",
      "NCBI Datasets"
    ],
    "outcome": "A script that identifies genetic variations and visualizes evolutionary trees.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "Basic genetics knowledge",
      "Python fundamentals",
      "Understanding of FASTA formats"
    ],
    "steps": [
      "Download DNA sequences from NCBI.",
      "Align sequences using BLAST.",
      "Identify SNPs and indels with Biopython.",
      "Construct a phylogenetic tree.",
      "Visualize results with Matplotlib."
    ],
    "evaluationCriteria": [
      "Accurate mutation detection.",
      "Phylogenetic tree matches known evolutionary data.",
      "Code is reusable for other sequences."
    ]
  },
  {
    "careerPathId": "681501176ab5e70d3a95",
    "title": "Population Dynamics Simulation",
    "description": "Model predator-prey interactions using the Lotka-Volterra equations and analyze stability conditions.",
    "tools": [
      "R (deSolve, ggplot2)",
      "Wolfram Mathematica",
      "Python (SciPy)",
      "Excel (for data validation)"
    ],
    "outcome": "Interactive simulations showing population fluctuations under different parameters.",
    "difficulty": "Beginner",
    "estimatedDuration": "15–20 hours",
    "prerequisites": [
      "Basic calculus",
      "Ecology fundamentals",
      "R/Python basics"
    ],
    "steps": [
      "Implement Lotka-Volterra equations in R/Python.",
      "Simulate different initial conditions.",
      "Plot population trends over time.",
      "Identify equilibrium points.",
      "Compare with real-world case studies."
    ],
    "evaluationCriteria": [
      "Simulations match theoretical expectations.",
      "Visualizations are clear and informative.",
      "Code allows parameter adjustments."
    ]
  },
  {
    "careerPathId": "681501176ab5e70d3a95",
    "title": "CRISPR Gene Editing Feasibility Study",
    "description": "Design guide RNAs for a target gene and predict off-target effects using bioinformatics tools.",
    "tools": [
      "CRISPR-Cas9 Designer (Broad Institute)",
      "UCSC Genome Browser",
      "Bowtie2",
      "Python (Biopython)",
      "Benchling"
    ],
    "outcome": "A report recommending optimal gRNA sequences with minimal off-target risks.",
    "difficulty": "Advanced",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "Molecular biology basics",
      "Understanding of CRISPR-Cas9",
      "Bioinformatics fundamentals"
    ],
    "steps": [
      "Identify target gene sequence.",
      "Design gRNAs using Broad Institute’s tool.",
      "Check for off-target matches with Bowtie2.",
      "Rank gRNAs by specificity and efficiency.",
      "Document findings in Benchling."
    ],
    "evaluationCriteria": [
      "gRNAs have high on-target efficiency.",
      "Off-target hits are minimized.",
      "Report is well-structured and clear."
    ]
  },
  {
    "careerPathId": "68150103f24491a90b42",
    "title": "RESTful API for E-Commerce Inventory",
    "description": "Build a scalable REST API for managing product inventory, orders, and user authentication for an e-commerce platform.",
    "tools": [
      "Node.js (Express)",
      "MongoDB (Mongoose)",
      "Postman",
      "JWT (JSON Web Tokens)",
      "Redis"
    ],
    "outcome": "A fully documented API with CRUD operations, authentication, and caching.",
    "difficulty": "Intermediate",
    "estimatedDuration": "15–20 hours",
    "prerequisites": [
      "JavaScript/Node.js basics",
      "Understanding of REST principles",
      "Basic database knowledge"
    ],
    "steps": [
      "Set up Express server and MongoDB connection.",
      "Implement product and order management endpoints.",
      "Add JWT-based user authentication.",
      "Integrate Redis for caching frequent queries.",
      "Test endpoints using Postman."
    ],
    "evaluationCriteria": [
      "API handles 100+ requests/sec (load test).",
      "Authentication prevents unauthorized access.",
      "Documentation is clear and complete."
    ]
  },
  {
    "careerPathId": "68150103f24491a90b42",
    "title": "Real-Time Chat Application with WebSockets",
    "description": "Develop a real-time chat app where users can join rooms and exchange messages instantly.",
    "tools": [
      "Socket.io",
      "Node.js",
      "React (Frontend)",
      "Firebase (for user auth)",
      "NGINX (Load balancing)"
    ],
    "outcome": "A low-latency chat application supporting multiple concurrent users.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "JavaScript (ES6+)",
      "Basic React knowledge",
      "Understanding of event-driven architecture"
    ],
    "steps": [
      "Set up Socket.io server with Node.js.",
      "Implement room-based messaging.",
      "Integrate Firebase for user authentication.",
      "Build a simple React frontend.",
      "Deploy on a cloud server (AWS/Heroku)."
    ],
    "evaluationCriteria": [
      "Messages deliver in <100ms latency.",
      "Supports 500+ concurrent users.",
      "No message loss during disconnections."
    ]
  },
  {
    "careerPathId": "68150103f24491a90b42",
    "title": "Serverless Microservices for Weather Data",
    "description": "Create a serverless architecture using AWS Lambda to fetch, process, and deliver weather data from APIs.",
    "tools": [
      "AWS Lambda",
      "API Gateway",
      "DynamoDB",
      "Python (Boto3)",
      "OpenWeatherMap API"
    ],
    "outcome": "A cost-efficient microservice that scales automatically with demand.",
    "difficulty": "Advanced",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "AWS basics",
      "Python scripting",
      "Understanding of serverless concepts"
    ],
    "steps": [
      "Set up Lambda functions to fetch weather data.",
      "Store historical data in DynamoDB.",
      "Expose endpoints via API Gateway.",
      "Implement caching for frequent queries.",
      "Monitor performance with AWS CloudWatch."
    ],
    "evaluationCriteria": [
      "Response time <500ms under load.",
      "Cost remains below $5/month for 10K requests.",
      "Data is accurate and up-to-date."
    ]
  },
  {
    "careerPathId": "6815011cd058dae70cd8",
    "title": "Phishing Detection Awareness Simulation",
    "description": "Build a simulation that educates users to detect phishing emails using real-world examples and scoring.",
    "tools": [
      "Canva",
      "Google Forms",
      "HTML",
      "Python (Flask)"
    ],
    "outcome": "An interactive platform that evaluates how well users identify phishing emails.",
    "difficulty": "Intermediate",
    "estimatedDuration": "15–20 hours",
    "prerequisites": [
      "Basic web development",
      "Understanding of phishing techniques",
      "Good writing and UX skills"
    ],
    "steps": [
      "Collect real phishing email samples.",
      "Design look-alike emails in HTML.",
      "Create a quiz interface using Flask.",
      "Record scores and give feedback.",
      "Deploy and test with users."
    ],
    "evaluationCriteria": [
      "Realism of examples.",
      "Scoring accuracy.",
      "User engagement and understanding."
    ]
  },
  {
    "careerPathId": "6815011cd058dae70cd8",
    "title": "Vulnerability Scan & Report",
    "description": "Use open-source tools to scan a sample web app or system for vulnerabilities and generate a remediation report.",
    "tools": [
      "OWASP ZAP",
      "Nmap",
      "Kali Linux",
      "Burp Suite Community Edition"
    ],
    "outcome": "A detailed vulnerability report with prioritized issues and mitigation strategies.",
    "difficulty": "Advanced",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "Linux basics",
      "Web architecture understanding",
      "Knowledge of OWASP Top 10"
    ],
    "steps": [
      "Set up a vulnerable test app (like DVWA).",
      "Run scans using OWASP ZAP and Nmap.",
      "Analyze results and cross-check findings.",
      "Document issues and suggest fixes.",
      "Summarize in a report or slide deck."
    ],
    "evaluationCriteria": [
      "Depth of analysis.",
      "Accuracy of findings.",
      "Clarity of remediation plan."
    ]
  },
  {
    "careerPathId": "6815011cd058dae70cd8",
    "title": "Secure Password Storage Demo",
    "description": "Demonstrate secure password storage using hashing and salting in a small web app.",
    "tools": [
      "Node.js",
      "bcrypt",
      "MongoDB",
      "Postman"
    ],
    "outcome": "A working backend app that securely stores and verifies passwords.",
    "difficulty": "Intermediate",
    "estimatedDuration": "12–15 hours",
    "prerequisites": [
      "Intro to Node.js",
      "Understanding of authentication",
      "JavaScript basics"
    ],
    "steps": [
      "Create a registration/login endpoint.",
      "Hash and salt passwords using bcrypt.",
      "Store credentials in MongoDB.",
      "Test APIs with Postman.",
      "Explain logic in a short video or README."
    ],
    "evaluationCriteria": [
      "Security best practices followed.",
      "Working authentication flow.",
      "Code clarity and documentation."
    ]
  },
  {
    "careerPathId": "68150111e945e1dbfb8b",
    "title": "Integrated Digital Marketing Campaign with Attribution Analysis",
    "description": "Design and execute a comprehensive multi-channel digital marketing campaign with advanced tracking, A/B testing, and attribution modeling to optimize ROI across all touchpoints.",
    "tools": [
      "Google Ads",
      "Facebook Ads Manager",
      "Google Analytics 4",
      "HubSpot",
      "Mailchimp",
      "Hootsuite",
      "Adobe Creative Suite",
      "Canva Pro",
      "Semrush",
      "Hotjar"
    ],
    "outcome": "A data-driven marketing campaign that increases conversion rates by 35% and provides clear attribution analysis showing the ROI contribution of each marketing channel.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20-25 hours",
    "prerequisites": [
      "Understanding of digital marketing fundamentals",
      "Experience with paid advertising platforms",
      "Knowledge of marketing analytics and metrics",
      "Basic graphic design skills",
      "Familiarity with marketing automation concepts"
    ],
    "steps": [
      "Conduct market research and define target audience personas using Semrush.",
      "Create compelling ad copy and visual assets using Adobe Creative Suite and Canva Pro.",
      "Set up Google Ads and Facebook advertising campaigns with proper tracking.",
      "Configure Google Analytics 4 with enhanced ecommerce and conversion tracking.",
      "Develop email marketing sequences using Mailchimp with behavioral triggers.",
      "Create social media content calendar and schedule posts using Hootsuite.",
      "Implement A/B testing for ad creatives, landing pages, and email campaigns.",
      "Set up attribution modeling to track customer journey across all touchpoints.",
      "Monitor campaign performance and optimize based on data insights using Hotjar."
    ],
    "evaluationCriteria": [
      "Campaign achieves target conversion rate improvements.",
      "Attribution analysis provides clear ROI data for each marketing channel.",
      "A/B testing results show statistically significant improvements.",
      "Cost per acquisition decreases through optimization efforts.",
      "Customer lifetime value increases through improved targeting and nurturing."
    ]
  },
  {
    "careerPathId": "68150111e945e1dbfb8b",
    "title": "Brand Identity and Content Strategy Development",
    "description": "Develop a comprehensive brand identity system and content marketing strategy that includes visual design, brand voice, content calendar, and performance measurement framework.",
    "tools": [
      "Adobe Illustrator",
      "Adobe Photoshop",
      "Figma",
      "Sketch",
      "WordPress",
      "Buffer",
      "BuzzSumo",
      "Grammarly Business",
      "CoSchedule",
      "Brand24"
    ],
    "outcome": "A complete brand identity package with style guide, 90-day content strategy, and measurement framework that increases brand recognition by 60% and engagement rates by 45%.",
    "difficulty": "Intermediate",
    "estimatedDuration": "25-30 hours",
    "prerequisites": [
      "Graphic design fundamentals",
      "Understanding of brand strategy principles",
      "Content marketing knowledge",
      "Social media platform expertise",
      "Basic web design skills"
    ],
    "steps": [
      "Conduct brand audit and competitive analysis using BuzzSumo and Brand24.",
      "Develop brand identity including logo, color palette, and typography using Adobe Illustrator.",
      "Create comprehensive brand style guide with usage guidelines in Figma.",
      "Define brand voice, tone, and messaging framework.",
      "Develop content strategy and editorial calendar using CoSchedule.",
      "Create content templates for various formats (blog posts, social media, email) in Adobe Creative Suite.",
      "Set up WordPress site with branded design and content management system.",
      "Implement social media content scheduling using Buffer.",
      "Establish KPIs and tracking systems for brand awareness and engagement metrics."
    ],
    "evaluationCriteria": [
      "Brand identity is cohesive and differentiates from competitors.",
      "Style guide provides clear guidelines for consistent brand application.",
      "Content strategy aligns with brand objectives and target audience needs.",
      "Content calendar demonstrates strategic planning and consistent publishing schedule.",
      "Brand tracking shows measurable improvements in awareness and perception metrics."
    ]
  },
  {
    "careerPathId": "68150111e945e1dbfb8b",
    "title": "Conversion Rate Optimization and User Experience Analysis",
    "description": "Conduct comprehensive CRO analysis of a website or landing page, implement data-driven improvements, and measure the impact on conversion rates and user engagement.",
    "tools": [
      "Google Optimize",
      "Hotjar",
      "Crazy Egg",
      "Google Analytics 4",
      "Unbounce",
      "Figma",
      "UserTesting",
      "Optimizely",
      "Microsoft Clarity",
      "Typeform"
    ],
    "outcome": "A fully optimized website or landing page with documented improvements that increase conversion rates by 40-60% and reduce bounce rates by 30%, supported by statistical evidence.",
    "difficulty": "Advanced",
    "estimatedDuration": "30-35 hours",
    "prerequisites": [
      "Understanding of web analytics and conversion optimization principles",
      "Experience with A/B testing methodologies",
      "Knowledge of user experience design",
      "Familiarity with statistical analysis",
      "Basic web development and design skills"
    ],
    "steps": [
      "Conduct comprehensive analytics audit using Google Analytics 4 to identify conversion bottlenecks.",
      "Set up heatmapping and user session recordings using Hotjar and Crazy Egg.",
      "Perform user research and usability testing using UserTesting platform.",
      "Analyze user behavior data and identify optimization opportunities.",
      "Create wireframes and mockups for improved page designs using Figma.",
      "Implement A/B tests using Google Optimize and Optimizely for major page elements.",
      "Develop new landing page variants using Unbounce with improved conversion elements.",
      "Set up advanced tracking and goal configuration in Google Analytics.",
      "Monitor test results and implement winning variations based on statistical significance."
    ],
    "evaluationCriteria": [
      "Optimization efforts result in statistically significant conversion rate improvements.",
      "User research findings are properly translated into actionable design changes.",
      "A/B testing methodology follows best practices with proper sample sizes.",
      "Improvements maintain or enhance user experience quality.",
      "Results are properly documented with clear before/after performance metrics."
    ]
  },
  {
    "careerPathId": "68150118150c34be25c3",
    "title": "Sales Dashboard for E-commerce",
    "description": "Build an interactive dashboard to track product performance, revenue, and customer behavior for an online store.",
    "tools": [
      "Tableau",
      "Python (pandas)",
      "Google BigQuery",
      "Google Sheets"
    ],
    "outcome": "An insightful dashboard that allows stakeholders to explore sales data and uncover trends.",
    "difficulty": "Intermediate",
    "estimatedDuration": "15–20 hours",
    "prerequisites": [
      "Data cleaning skills",
      "Basic SQL",
      "Intro to Tableau"
    ],
    "steps": [
      "Import sales data from Google Sheets or BigQuery.",
      "Clean and analyze with pandas.",
      "Create calculated metrics and filters in Tableau.",
      "Build interactive charts and summary KPIs.",
      "Present insights in a slide deck."
    ],
    "evaluationCriteria": [
      "Clarity of visualizations.",
      "Relevance of insights.",
      "Dashboard interactivity."
    ]
  },
  {
    "careerPathId": "68150118150c34be25c3",
    "title": "Data Cleaning and Preprocessing Toolkit",
    "description": "Develop a Python script that automates common data cleaning tasks and logs changes.",
    "tools": [
      "Python",
      "pandas",
      "OpenRefine",
      "Jupyter Notebook"
    ],
    "outcome": "A reusable toolkit that accelerates the cleaning of raw datasets and produces a summary log.",
    "difficulty": "Beginner",
    "estimatedDuration": "10–12 hours",
    "prerequisites": [
      "Python basics",
      "Data wrangling knowledge",
      "Jupyter experience"
    ],
    "steps": [
      "List common cleaning needs (missing values, outliers).",
      "Write Python functions for each task.",
      "Apply them to sample datasets in a notebook.",
      "Generate summary logs.",
      "Document usage in Markdown."
    ],
    "evaluationCriteria": [
      "Automation level of tasks.",
      "Code reusability.",
      "Clarity of documentation."
    ]
  },
  {
    "careerPathId": "68150118150c34be25c3",
    "title": "Exploratory Data Analysis on Public Dataset",
    "description": "Perform EDA on a publicly available dataset and uncover hidden patterns or correlations.",
    "tools": [
      "Python (pandas, seaborn, matplotlib)",
      "Kaggle",
      "Jupyter Notebook"
    ],
    "outcome": "A complete EDA notebook with visualizations and key takeaways from the data.",
    "difficulty": "Beginner",
    "estimatedDuration": "8–10 hours",
    "prerequisites": [
      "Data exploration skills",
      "Basic statistics",
      "Python for data analysis"
    ],
    "steps": [
      "Choose a dataset from Kaggle.",
      "Clean and preprocess it.",
      "Explore distributions and correlations.",
      "Visualize key patterns.",
      "Summarize findings and implications."
    ],
    "evaluationCriteria": [
      "Depth of analysis.",
      "Use of appropriate visuals.",
      "Clarity in interpretation of results."
    ]
  },
  {
    "careerPathId": "681501023dfee3eaa660",
    "title": "Customer Churn Prediction Model",
    "description": "Develop a machine learning model that predicts which customers are likely to churn based on their usage patterns and demographic data.",
    "tools": [
      "Python 3.9",
      "Scikit-learn",
      "Pandas",
      "Matplotlib",
      "Jupyter Notebook",
      "XGBoost"
    ],
    "outcome": "A trained model with ≥85% accuracy that identifies high-risk customers with explanations of key factors.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "Basic Python",
      "Intro to machine learning",
      "Understanding of classification"
    ],
    "steps": [
      "Explore and clean customer dataset",
      "Perform feature engineering",
      "Train multiple models (logistic regression, random forest, XGBoost)",
      "Evaluate using precision-recall metrics",
      "Create SHAP value explanations",
      "Build simple Flask API for predictions"
    ],
    "evaluationCriteria": [
      "Model AUC ≥ 0.85 on test set",
      "Key drivers identified make business sense",
      "Prediction latency under 100ms"
    ]
  },
  {
    "careerPathId": "681501023dfee3eaa660",
    "title": "NLP for Product Review Analysis",
    "description": "Create a natural language processing system that analyzes product reviews to extract sentiment and common themes.",
    "tools": [
      "Python 3.9",
      "NLTK",
      "spaCy",
      "Transformers (Hugging Face)",
      "Streamlit",
      "BERT"
    ],
    "outcome": "Interactive dashboard showing sentiment trends and topic clusters across product categories with example reviews.",
    "difficulty": "Advanced",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "Python basics",
      "Understanding of NLP concepts",
      "Familiarity with pandas"
    ],
    "steps": [
      "Scrape or obtain sample review dataset",
      "Preprocess text (tokenization, lemmatization)",
      "Train sentiment classifier",
      "Implement topic modeling with LDA",
      "Build Streamlit dashboard",
      "Deploy as web app"
    ],
    "evaluationCriteria": [
      "Sentiment matches human evaluation ≥80%",
      "Topics are coherent and meaningful",
      "Dashboard updates in real-time"
    ]
  },
  {
    "careerPathId": "681501023dfee3eaa660",
    "title": "Time Series Forecasting for Retail",
    "description": "Build a forecasting model that predicts daily sales for a retail chain using historical data and external factors like holidays.",
    "tools": [
      "Python 3.9",
      "Prophet",
      "ARIMA",
      "Pandas",
      "Plotly",
      "Statsmodels"
    ],
    "outcome": "A model that predicts next 30 days of sales within 10% error margin, with visualization of trends and seasonality.",
    "difficulty": "Intermediate",
    "estimatedDuration": "18–22 hours",
    "prerequisites": [
      "Basic statistics",
      "Python fundamentals",
      "Understanding of time series"
    ],
    "steps": [
      "Clean and prepare historical sales data",
      "Explore seasonality and trends",
      "Implement Prophet model with holiday effects",
      "Compare with SARIMA baseline",
      "Evaluate using walk-forward validation",
      "Create interactive forecast visualization"
    ],
    "evaluationCriteria": [
      "MAPE ≤ 10% on test period",
      "Model captures known seasonal patterns",
      "Uncertainty intervals are well-calibrated"
    ]
  },
  {
    "careerPathId": "681501165b33831687ec",
    "title": "Sustainable Urban Farming Business Plan",
    "description": "Develop a comprehensive business plan for a sustainable urban farming venture, including market analysis, operational plan, financial projections, and a focus on environmental and social impact.",
    "tools": [
      "Microsoft Word",
      "Microsoft Excel",
      "Canva",
      "SurveyMonkey",
      "Statista"
    ],
    "outcome": "A compelling and well-researched business plan that outlines a viable pathway to establishing and growing a profitable and environmentally responsible urban farming enterprise.",
    "difficulty": "Intermediate",
    "estimatedDuration": "40-60 hours",
    "prerequisites": [
      "Basic understanding of business principles and market research.",
      "Familiarity with sustainable agriculture concepts.",
      "Proficiency in financial modeling."
    ],
    "steps": [
      "Conduct thorough market research to identify demand for local produce and competitive landscape.",
      "Define the unique value proposition and target customer segments.",
      "Develop an operational plan, including farming methods, site selection, and logistics.",
      "Create detailed financial projections (startup costs, revenue streams, profit/loss).",
      "Outline a marketing and sales strategy.",
      "Address legal and regulatory considerations.",
      "Articulate the environmental and social impact of the venture.",
      "Prepare a polished business plan document and pitch deck."
    ],
    "evaluationCriteria": [
      "Clarity and completeness of the business plan components.",
      "Realism and rigor of financial projections.",
      "Innovation and sustainability aspects of the urban farming model.",
      "Strength of market analysis and competitive advantage."
    ]
  },
  {
    "careerPathId": "681501165b33831687ec",
    "title": "E-commerce Startup Launch & Marketing Strategy",
    "description": "Launch a small e-commerce store for a niche product or service, developing the website, product sourcing, fulfillment strategy, and executing a digital marketing campaign.",
    "tools": [
      "Shopify",
      "WooCommerce",
      "Canva",
      "Meta Business Suite (Facebook/Instagram Ads)",
      "Google Analytics"
    ],
    "outcome": "A fully operational e-commerce store with initial sales and a data-driven understanding of effective marketing channels for the target audience.",
    "difficulty": "Intermediate",
    "estimatedDuration": "50-70 hours",
    "prerequisites": [
      "Basic understanding of e-commerce platforms.",
      "Familiarity with digital marketing concepts (SEO, social media marketing).",
      "Ability to source products or create unique offerings."
    ],
    "steps": [
      "Identify a niche product or service with market potential.",
      "Source products or develop your own unique offering.",
      "Set up an e-commerce platform (Shopify or WooCommerce) and design the store.",
      "Create compelling product descriptions and visuals.",
      "Develop a fulfillment strategy (dropshipping, local pickup, shipping).",
      "Plan and execute a digital marketing campaign (e.g., social media ads, email marketing).",
      "Monitor website traffic and sales data using Google Analytics.",
      "Analyze campaign performance and iterate on strategies."
    ],
    "evaluationCriteria": [
      "Successful launch and functionality of the e-commerce store.",
      "Achievement of initial sales targets.",
      "Effectiveness of the digital marketing campaigns (e.g., ROI, conversion rate).",
      "Scalability and potential for future growth."
    ]
  },
  {
    "careerPathId": "681501165b33831687ec",
    "title": "Pitch Deck and Financial Model for a Tech Startup",
    "description": "Create a professional investor pitch deck and a detailed financial model for a hypothetical tech startup, showcasing its potential, market opportunity, and financial viability.",
    "tools": [
      "Microsoft PowerPoint",
      "Google Slides",
      "Microsoft Excel",
      "Google Sheets",
      "Crunchbase (for market research)"
    ],
    "outcome": "A compelling investor pitch deck and a robust financial model that effectively communicate the startup's value proposition and investment potential to prospective investors.",
    "difficulty": "Advanced",
    "estimatedDuration": "30-50 hours",
    "prerequisites": [
      "Strong understanding of business models and financial statements.",
      "Proficiency in financial modeling (projections, valuations).",
      "Excellent presentation and storytelling skills."
    ],
    "steps": [
      "Conceive a unique tech startup idea with a clear problem-solution fit.",
      "Conduct comprehensive market research to validate the opportunity and identify target customers.",
      "Develop a detailed financial model including revenue forecasts, expense projections, and funding needs.",
      "Create a compelling investor pitch deck covering key sections (problem, solution, market, team, financials, ask).",
      "Refine the messaging and visuals of the pitch deck.",
      "Practice delivering the pitch effectively.",
      "Seek feedback from mentors or mock investors."
    ],
    "evaluationCriteria": [
      "Clarity and persuasiveness of the pitch deck narrative.",
      "Accuracy and reasonableness of financial projections in the model.",
      "Identified market opportunity and competitive advantage.",
      "Overall viability and attractiveness of the startup concept for investment."
    ]
  },
  {
    "careerPathId": "68150105b30814264ffa",
    "title": "Investment Portfolio Performance Analysis Dashboard",
    "description": "Build a comprehensive dashboard that analyzes portfolio performance, risk metrics, and benchmarking against market indices using real financial data.",
    "tools": [
      "Bloomberg Terminal",
      "Microsoft Excel",
      "R Studio",
      "Tableau",
      "Yahoo Finance API"
    ],
    "outcome": "An interactive dashboard providing real-time portfolio analytics, risk assessment, and performance attribution with automated data updates.",
    "difficulty": "Advanced",
    "estimatedDuration": "30–35 hours",
    "prerequisites": [
      "Advanced Excel and statistical knowledge",
      "Understanding of financial markets and instruments",
      "Basic programming skills in R or Python"
    ],
    "steps": [
      "Set up data connections to Bloomberg Terminal and Yahoo Finance API.",
      "Create portfolio tracking spreadsheet with holdings and weights.",
      "Develop R scripts for calculating risk metrics and performance ratios.",
      "Design dashboard layout and key performance indicators in Tableau.",
      "Implement automated data refresh and alert systems.",
      "Add benchmarking analysis against relevant market indices.",
      "Test dashboard accuracy with historical portfolio data."
    ],
    "evaluationCriteria": [
      "Dashboard accurately calculates standard financial metrics.",
      "Data updates automatically without manual intervention.",
      "Risk analysis provides actionable insights for portfolio management.",
      "Visualizations clearly communicate performance trends and outliers."
    ]
  },
  {
    "careerPathId": "68150105b30814264ffa",
    "title": "Company Valuation Model for M&A Analysis",
    "description": "Develop a comprehensive discounted cash flow (DCF) model to value a public company for potential merger and acquisition analysis.",
    "tools": [
      "Microsoft Excel",
      "FactSet",
      "Capital IQ",
      "MATLAB",
      "Monte Carlo simulation add-ins"
    ],
    "outcome": "A sophisticated valuation model with sensitivity analysis, scenario modeling, and detailed assumptions documentation for investment decision-making.",
    "difficulty": "Intermediate",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "Corporate finance fundamentals",
      "Financial statement analysis skills",
      "Advanced Excel modeling experience"
    ],
    "steps": [
      "Research target company using FactSet and Capital IQ databases.",
      "Build historical financial statement analysis in Excel.",
      "Create detailed revenue and expense forecasting models.",
      "Develop weighted average cost of capital (WACC) calculations.",
      "Build DCF model with terminal value calculations.",
      "Implement sensitivity analysis and scenario testing using MATLAB.",
      "Document all assumptions and create executive summary presentation."
    ],
    "evaluationCriteria": [
      "Model follows established DCF valuation methodology.",
      "Assumptions are well-researched and defensible.",
      "Sensitivity analysis identifies key value drivers.",
      "Final valuation range is reasonable compared to market comparables."
    ]
  },
  {
    "careerPathId": "68150105b30814264ffa",
    "title": "Credit Risk Assessment System",
    "description": "Design and implement a credit risk scoring system that evaluates loan default probability using financial ratios, industry data, and machine learning techniques.",
    "tools": [
      "Python",
      "Pandas",
      "Scikit-learn",
      "SQL Server",
      "Power BI"
    ],
    "outcome": "A functional credit scoring system with predictive models, risk categorization, and reporting dashboard for loan underwriting decisions.",
    "difficulty": "Beginner",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "Basic Python programming",
      "Understanding of credit analysis fundamentals",
      "SQL database query skills"
    ],
    "steps": [
      "Collect and clean historical loan performance data using Pandas.",
      "Analyze key financial ratios and identify risk indicators.",
      "Build machine learning models using Scikit-learn for default prediction.",
      "Create SQL database to store borrower information and risk scores.",
      "Develop automated scoring algorithm with risk tier classifications.",
      "Design Power BI dashboard for loan officers to view risk assessments.",
      "Test model accuracy against historical default data."
    ],
    "evaluationCriteria": [
      "Model demonstrates statistically significant predictive power.",
      "Risk scoring system provides clear, actionable recommendations.",
      "Dashboard interface is user-friendly for non-technical staff.",
      "System properly handles data validation and edge cases."
    ]
  },
  {
    "careerPathId": "68150103bec171063cb3",
    "title": "Responsive E-Commerce Product Page",
    "description": "Build a fully responsive product page for an e-commerce site with interactive elements like image gallery, size selector, and add-to-cart functionality.",
    "tools": [
      "React 18",
      "Tailwind CSS 3.0",
      "Framer Motion",
      "Vite",
      "ESLint"
    ],
    "outcome": "A production-ready product page that works seamlessly across mobile, tablet, and desktop devices with smooth animations.",
    "difficulty": "Intermediate",
    "estimatedDuration": "10–15 hours",
    "prerequisites": [
      "HTML5/CSS3 fundamentals",
      "Basic React knowledge",
      "Understanding of responsive design"
    ],
    "steps": [
      "Set up project with Vite and React",
      "Create mobile-first layout with Tailwind",
      "Implement image gallery with zoom functionality",
      "Add product variant selection logic",
      "Create animated add-to-cart interaction",
      "Optimize for performance and accessibility"
    ],
    "evaluationCriteria": [
      "Layout adapts perfectly to all screen sizes",
      "All interactive elements work flawlessly",
      "Page scores >90 on Lighthouse audit",
      "Animations are smooth and enhance UX"
    ]
  },
  {
    "careerPathId": "68150103bec171063cb3",
    "title": "Accessible Dashboard with Dark Mode",
    "description": "Develop an analytics dashboard with WCAG 2.1 compliant accessibility features and toggleable dark/light mode.",
    "tools": [
      "Next.js 14",
      "TypeScript 5.0",
      "Radix UI",
      "Zustand",
      "Chart.js"
    ],
    "outcome": "An accessible dashboard component that meets AA accessibility standards and provides customizable viewing options.",
    "difficulty": "Advanced",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "Experience with React hooks",
      "Basic TypeScript knowledge",
      "Understanding of WCAG principles"
    ],
    "steps": [
      "Set up Next.js project with TypeScript",
      "Implement theme provider with Zustand",
      "Create accessible UI components with Radix",
      "Build interactive charts with Chart.js",
      "Add keyboard navigation and ARIA labels",
      "Test with screen readers and color contrast checkers"
    ],
    "evaluationCriteria": [
      "Passes axe-core accessibility tests",
      "Theme switching works without flashes",
      "All functionality works via keyboard",
      "Charts adapt to color scheme changes"
    ]
  },
  {
    "careerPathId": "68150103bec171063cb3",
    "title": "Micro-interaction Library",
    "description": "Create a reusable collection of subtle animations and micro-interactions for common UI elements like buttons, form inputs, and notifications.",
    "tools": [
      "CSS Modules",
      "GSAP 3.0",
      "Storybook 7.0",
      "npm",
      "Jest"
    ],
    "outcome": "A published npm package containing 10+ polished micro-interactions that can be easily imported into any project.",
    "difficulty": "Intermediate",
    "estimatedDuration": "12–18 hours",
    "prerequisites": [
      "CSS animation knowledge",
      "Basic JavaScript skills",
      "Understanding of npm packages"
    ],
    "steps": [
      "Design subtle animations for common UI patterns",
      "Implement with GSAP for smooth performance",
      "Create documentation in Storybook",
      "Set up npm package configuration",
      "Write unit tests for animation triggers",
      "Publish to npm registry"
    ],
    "evaluationCriteria": [
      "Animations run at 60fps",
      "Package installs without errors",
      "Storybook documentation is comprehensive",
      "All interactions have reduced motion options"
    ]
  },
  {
    "careerPathId": "68150103773c53a71ff0",
    "title": "AI-Powered Blog Platform",
    "description": "Build a full-stack blog platform with AI-generated content suggestions and automated SEO optimization.",
    "tools": [
      "Node.js 20",
      "Express.js",
      "MongoDB 7.0",
      "OpenAI API",
      "Next.js 14"
    ],
    "outcome": "A complete blogging system where writers get AI assistance for content creation and SEO improvements.",
    "difficulty": "Advanced",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "Full-stack development basics",
      "REST API concepts",
      "Basic AI/ML understanding"
    ],
    "steps": [
      "Set up Next.js frontend with App Router",
      "Create Node.js/Express backend API",
      "Implement MongoDB for content storage",
      "Integrate OpenAI API for content suggestions",
      "Build SEO analysis dashboard",
      "Deploy on Vercel and Render"
    ],
    "evaluationCriteria": [
      "AI generates coherent content suggestions",
      "SEO recommendations are actionable",
      "CRUD operations work flawlessly",
      "Platform scores >90 on performance metrics"
    ]
  },
  {
    "careerPathId": "68150103773c53a71ff0",
    "title": "Real-time Collaborative Whiteboard",
    "description": "Develop a multiplayer whiteboard application where users can draw together in real-time with various tools and colors.",
    "tools": [
      "Socket.io 4.0",
      "Canvas API",
      "Redis 7.0",
      "React Flow",
      "Fabric.js"
    ],
    "outcome": "A working collaborative space with real-time synchronization, undo/redo functionality, and export options.",
    "difficulty": "Advanced",
    "estimatedDuration": "30–35 hours",
    "prerequisites": [
      "WebSockets knowledge",
      "Experience with canvas manipulation",
      "State management understanding"
    ],
    "steps": [
      "Set up Socket.io server for real-time communication",
      "Implement base canvas with Fabric.js",
      "Create drawing tools interface",
      "Add collaboration features with presence indicators",
      "Implement Redis for session management",
      "Add export to PNG/PDF functionality"
    ],
    "evaluationCriteria": [
      "Drawing syncs instantly between users",
      "Multiple users can collaborate simultaneously",
      "Undo/redo works across sessions",
      "Export produces high-quality outputs"
    ]
  },
  {
    "careerPathId": "68150103773c53a71ff0",
    "title": "Serverless E-Commerce Backend",
    "description": "Implement a cloud-native e-commerce backend using serverless technologies with payment processing and inventory management.",
    "tools": [
      "AWS Lambda",
      "DynamoDB",
      "Stripe API",
      "API Gateway",
      "Serverless Framework"
    ],
    "outcome": "A scalable backend system that handles product catalog, orders, and payments without managing servers.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "Basic AWS knowledge",
      "JavaScript/Node.js skills",
      "Understanding of REST APIs"
    ],
    "steps": [
      "Design DynamoDB schema for products/orders",
      "Set up Serverless Framework project",
      "Implement product CRUD Lambda functions",
      "Integrate Stripe checkout",
      "Create order processing workflow",
      "Deploy and test at scale"
    ],
    "evaluationCriteria": [
      "Handles 100+ concurrent requests",
      "Payment processing works securely",
      "Inventory updates are atomic",
      "Cold start time <500ms"
    ]
  },
  {
    "careerPathId": "6815011d0f9542f2d123",
    "title": "Kubernetes Cluster Deployment",
    "description": "Build and configure a production-grade Kubernetes cluster on AWS with proper networking, monitoring, and security.",
    "tools": [
      "AWS EKS",
      "Terraform",
      "Helm",
      "Prometheus",
      "Grafana",
      "Calico"
    ],
    "outcome": "Highly available Kubernetes cluster with 3 worker nodes, proper RBAC, monitoring, and automated scaling.",
    "difficulty": "Advanced",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "AWS fundamentals",
      "Container concepts",
      "Basic YAML"
    ],
    "steps": [
      "Provision EKS cluster with Terraform",
      "Configure worker node autoscaling",
      "Set up Calico network policies",
      "Deploy Prometheus/Grafana monitoring",
      "Implement RBAC with least privilege",
      "Test deployment with sample app"
    ],
    "evaluationCriteria": [
      "Cluster survives node failures",
      "Monitoring shows all key metrics",
      "Unauthorized access attempts blocked"
    ]
  },
  {
    "careerPathId": "6815011d0f9542f2d123",
    "title": "CI/CD Pipeline for Microservices",
    "description": "Create a complete GitOps workflow that automatically builds, tests, and deploys containerized microservices to production.",
    "tools": [
      "GitHub Actions",
      "Docker",
      "ArgoCD",
      "Kustomize",
      "SonarQube",
      "Nexus"
    ],
    "outcome": "Automated pipeline that deploys code changes to production with proper testing and approval gates.",
    "difficulty": "Advanced",
    "estimatedDuration": "30–35 hours",
    "prerequisites": [
      "Git knowledge",
      "Basic Docker",
      "Understanding of CI/CD"
    ],
    "steps": [
      "Configure GitHub Actions workflows",
      "Set up container registry with Nexus",
      "Implement Kustomize for environment differences",
      "Deploy ArgoCD for GitOps",
      "Add security scanning with SonarQube",
      "Test rollback procedures"
    ],
    "evaluationCriteria": [
      "Code to production in ≤15 minutes",
      "100% test coverage required",
      "Rollbacks work within 5 minutes"
    ]
  },
  {
    "careerPathId": "6815011d0f9542f2d123",
    "title": "Infrastructure as Code with Terraform",
    "description": "Convert manual cloud infrastructure into version-controlled Terraform modules for AWS environment.",
    "tools": [
      "Terraform 1.2",
      "AWS",
      "Terragrunt",
      "TFLint",
      "Checkov",
      "Atlantis"
    ],
    "outcome": "Complete Terraform codebase that can recreate entire staging environment from scratch with single command.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "AWS basics",
      "Understanding of VPC",
      "CLI experience"
    ],
    "steps": [
      "Document existing infrastructure",
      "Create Terraform modules for each component",
      "Implement state management with S3 backend",
      "Add security scanning with Checkov",
      "Set up Atlantis for CI/CD",
      "Test full environment recreation"
    ],
    "evaluationCriteria": [
      "Environment can be recreated identically",
      "No manual steps required",
      "Cost estimates shown before apply"
    ]
  },
  {
    "careerPathId": "681501057fae9fb97e5e",
    "title": "Brand Identity Design for a Local Startup",
    "description": "Develop a complete brand identity package for a new local startup, including logo design, color palette, typography, and brand guidelines.",
    "tools": [
      "Adobe Illustrator",
      "Adobe Photoshop",
      "Adobe InDesign",
      "Figma"
    ],
    "outcome": "A cohesive and professional brand identity that effectively represents the startup's values and attracts its target audience.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20-30 hours",
    "prerequisites": [
      "Understanding of design principles (composition, color theory, typography)",
      "Proficiency in Adobe Creative Suite basics",
      "Familiarity with branding concepts"
    ],
    "steps": [
      "Conduct a client brief to understand the startup's vision, values, and target audience.",
      "Research competitors and industry trends.",
      "Develop mood boards and initial concept sketches for the logo.",
      "Refine logo designs and explore variations.",
      "Define color palette, typography, and supporting graphic elements.",
      "Create a comprehensive brand style guide document.",
      "Present the final brand identity to the client for feedback and revisions."
    ],
    "evaluationCriteria": [
      "Logo is unique, memorable, and scalable.",
      "Color palette and typography are harmonious and align with brand personality.",
      "Brand guidelines are clear, comprehensive, and easy to follow.",
      "Client satisfaction with the final brand identity."
    ]
  },
  {
    "careerPathId": "681501057fae9fb97e5e",
    "title": "Social Media Content Creation for a Non-Profit",
    "description": "Design a series of engaging social media graphics and short videos to promote a non-profit organization's upcoming campaign.",
    "tools": [
      "Canva",
      "Adobe Photoshop",
      "Adobe Premiere Pro",
      "DaVinci Resolve",
      "Lightroom"
    ],
    "outcome": "An impactful set of social media assets that increase awareness, engagement, and donations for the non-profit's campaign.",
    "difficulty": "Beginner",
    "estimatedDuration": "10-15 hours",
    "prerequisites": [
      "Basic understanding of social media platforms",
      "Familiarity with graphic design principles",
      "Basic video editing concepts"
    ],
    "steps": [
      "Collaborate with the non-profit to understand campaign goals and messaging.",
      "Research target audience and social media trends.",
      "Develop a content calendar outlining post types and themes.",
      "Design static graphics using Canva or Photoshop.",
      "Create short animated videos or motion graphics using Premiere Pro or DaVinci Resolve.",
      "Optimize content for different social media platforms (e.g., Instagram, Facebook, X).",
      "Obtain feedback and iterate on designs."
    ],
    "evaluationCriteria": [
      "Graphics are visually appealing and on-brand.",
      "Content effectively conveys the campaign message.",
      "Posts are optimized for various social media platforms.",
      "Increased engagement metrics (likes, shares, comments) on campaign posts."
    ]
  },
  {
    "careerPathId": "681501057fae9fb97e5e",
    "title": "Website Redesign for an E-commerce Business",
    "description": "Redesign the user interface (UI) and user experience (UX) of an existing e-commerce website to improve navigability, visual appeal, and conversion rates.",
    "tools": [
      "Figma",
      "Sketch",
      "Adobe XD",
      "Adobe Photoshop",
      "UserTesting.com"
    ],
    "outcome": "A modern, intuitive, and user-friendly e-commerce website design that enhances the shopping experience and drives sales.",
    "difficulty": "Advanced",
    "estimatedDuration": "40-60 hours",
    "prerequisites": [
      "Strong understanding of UX/UI principles and best practices",
      "Proficiency in wireframing and prototyping tools",
      "Knowledge of e-commerce website functionalities"
    ],
    "steps": [
      "Conduct a comprehensive UX audit of the current website to identify pain points.",
      "Perform user research (surveys, interviews, usability testing) to gather insights.",
      "Create user personas and user flows.",
      "Develop low-fidelity wireframes for key pages.",
      "Design high-fidelity mockups in Figma or Sketch.",
      "Create interactive prototypes for testing.",
      "Conduct usability testing and iterate based on feedback.",
      "Prepare design specifications and assets for developers."
    ],
    "evaluationCriteria": [
      "Improved website navigation and information architecture.",
      "Modern and aesthetically pleasing visual design.",
      "Positive user feedback from usability testing.",
      "Increased conversion rates and reduced bounce rate post-implementation."
    ]
  },
  {
    "careerPathId": "6815010639415351d31d",
    "title": "Clinical Trial Data Statistical Analysis",
    "description": "Perform statistical analysis on data from a clinical trial. Clean and preprocess patient data (treatment vs. control groups), then use appropriate statistical tests (t-test, chi-square, survival analysis) to evaluate treatment efficacy. Summarize findings in a research report format.",
    "tools": [
      "R (stats, survival packages)",
      "Python (pandas, lifelines)",
      "SPSS"
    ],
    "outcome": "A research report including tables and figures (e.g., Kaplan-Meier curves, p-values) that interprets the significance of the trial results.",
    "difficulty": "Advanced",
    "estimatedDuration": "20-25 hours",
    "prerequisites": [
      "Knowledge of clinical trial design",
      "Biostatistics understanding (hypothesis testing, p-values)",
      "Experience with R or statistical software"
    ],
    "steps": [
      "Obtain a sample dataset with patient information: treatment assignment, outcomes, and relevant covariates.",
      "Use R or SPSS to clean data: handle missing values and validate randomization.",
      "Choose statistical tests: for continuous outcomes use t-test or ANOVA; for categorical outcomes use chi-square test.",
      "If time-to-event data is present, perform survival analysis (Kaplan-Meier curves, log-rank test).",
      "Calculate effect sizes and confidence intervals for key outcomes.",
      "Generate appropriate charts (e.g., survival curves, bar charts of response rates).",
      "Interpret the statistical results: determine if treatment effect is significant.",
      "Compile all results into a research-style report with an abstract, methods, results, and conclusion sections."
    ],
    "evaluationCriteria": [
      "Statistical methods are correctly applied and justified for each outcome.",
      "Results include correct p-values, confidence intervals, and effect size calculations.",
      "Visualizations (tables, charts) are clear and support the analysis.",
      "Conclusions follow logically from the data analysis and discuss clinical significance."
    ]
  },
  {
    "careerPathId": "6815010639415351d31d",
    "title": "Systematic Review and Meta-Analysis",
    "description": "Conduct a systematic literature review on a medical topic (e.g., impact of a drug). Gather studies from databases (PubMed), extract data (sample sizes, effect sizes), and perform a meta-analysis using statistical software. Assess the overall effect and heterogeneity among studies.",
    "tools": [
      "Python (BeautifulSoup for scraping)",
      "R (metafor package)",
      "Microsoft Excel"
    ],
    "outcome": "A meta-analysis report with a forest plot, funnel plot, and statistical summary of combined effect estimates and heterogeneity measures.",
    "difficulty": "Advanced",
    "estimatedDuration": "25-30 hours",
    "prerequisites": [
      "Understanding of systematic review process",
      "Experience with meta-analytic methods",
      "Familiarity with R or Python for data extraction"
    ],
    "steps": [
      "Define the review question and search keywords for the literature search.",
      "Use academic databases (PubMed) to retrieve relevant study references.",
      "Extract necessary data (effect sizes, sample sizes, variance) from each study into a spreadsheet.",
      "Import the collected data into R and use the metafor package to perform the meta-analysis.",
      "Calculate overall effect size using fixed or random effects models.",
      "Assess heterogeneity (I² statistic) and create a forest plot of study results.",
      "Generate a funnel plot to check for publication bias.",
      "Write up the review findings in a structured report: methods, results (including plots), and discussion of implications."
    ],
    "evaluationCriteria": [
      "Meta-analysis is correctly performed with appropriate model choice (fixed vs random).",
      "Forest plot and funnel plot are clearly labeled and interpreted.",
      "Heterogeneity statistics are reported and discussed.",
      "Search strategy and inclusion criteria are documented transparently."
    ]
  },
  {
    "careerPathId": "6815010639415351d31d",
    "title": "Differential Gene Expression Analysis",
    "description": "Analyze a gene expression dataset (e.g., RNA-seq) to identify genes that are up- or down-regulated between conditions. Preprocess raw counts, normalize the data, and apply statistical tests (e.g., DESeq2 in R) to find significant genes. Create visualizations like heatmaps and volcano plots of differentially expressed genes.",
    "tools": [
      "R (DESeq2)",
      "Python (Pandas, Seaborn)",
      "FastQC (optional)"
    ],
    "outcome": "A list of differentially expressed genes with fold changes and p-values, and visualizations (heatmap, volcano plot) showing key results.",
    "difficulty": "Advanced",
    "estimatedDuration": "20-25 hours",
    "prerequisites": [
      "Knowledge of gene expression analysis pipeline",
      "Familiarity with statistical methods for genomics",
      "Experience using R and Python for bioinformatics"
    ],
    "steps": [
      "Obtain an RNA-seq dataset (raw read counts) for two or more experimental conditions.",
      "Use FastQC to check data quality (optional step).",
      "Import count data into R and create a DESeq2 dataset object.",
      "Perform normalization and run the differential expression analysis.",
      "Extract significant genes (adjusted p-value < 0.05) and sort by fold change.",
      "Generate a volcano plot to visualize significance vs fold change.",
      "Create a heatmap of top differentially expressed genes across all samples.",
      "Interpret biological significance of top genes (lookup gene functions).",
      "Document the workflow and findings in a research note or abstract form."
    ],
    "evaluationCriteria": [
      "Normalization and DESeq2 settings are appropriate for the data.",
      "Volcano plot correctly highlights significant genes.",
      "Heatmap clearly shows expression patterns for selected genes.",
      "Results are interpreted in a biological context (e.g., pathway involvement)."
    ]
  },
  {
    "careerPathId": "6815011b4bf77605c5b5",
    "title": "Clinical Decision Support System for Primary Care",
    "description": "Develop an intelligent clinical decision support system that assists nurse practitioners with diagnosis, treatment recommendations, and patient care protocols.",
    "tools": [
      "Epic MyChart API",
      "HL7 FHIR",
      "Python scikit-learn",
      "React.js",
      "PostgreSQL"
    ],
    "outcome": "A clinical decision support system that improves diagnostic accuracy by 25% and reduces time to treatment decisions by 40%.",
    "difficulty": "Advanced",
    "estimatedDuration": "35-40 hours",
    "prerequisites": [
      "Clinical practice knowledge",
      "Healthcare informatics",
      "Machine learning basics",
      "Database design"
    ],
    "steps": [
      "Integrate Epic MyChart API for patient data access.",
      "Implement HL7 FHIR standards for healthcare data exchange.",
      "Train scikit-learn models on clinical decision datasets.",
      "Build React.js interface for clinician workflow integration.",
      "Set up PostgreSQL for secure patient data management.",
      "Validate system with clinical practice scenarios."
    ],
    "evaluationCriteria": [
      "System integrates seamlessly with existing EMR workflows.",
      "Clinical recommendations align with evidence-based guidelines.",
      "Patient data security meets HIPAA compliance requirements.",
      "Interface enhances rather than disrupts clinical workflow."
    ]
  },
  {
    "careerPathId": "6815011b4bf77605c5b5",
    "title": "Patient Education and Engagement Platform",
    "description": "Create a comprehensive patient education platform that provides personalized health information, medication reminders, and care plan tracking.",
    "tools": [
      "Twilio API",
      "Firebase",
      "React Native",
      "Google Cloud Healthcare API",
      "Tableau"
    ],
    "outcome": "A patient engagement platform that improves medication adherence by 50% and increases patient satisfaction scores by 30%.",
    "difficulty": "Intermediate",
    "estimatedDuration": "28-32 hours",
    "prerequisites": [
      "Patient care principles",
      "Mobile app development",
      "Healthcare communication",
      "Data analytics basics"
    ],
    "steps": [
      "Set up Twilio API for automated patient communication.",
      "Configure Firebase for secure patient data synchronization.",
      "Develop React Native app for cross-platform patient access.",
      "Integrate Google Cloud Healthcare API for health data standards.",
      "Create Tableau dashboards for patient engagement analytics.",
      "Test platform with real patient scenarios and feedback."
    ],
    "evaluationCriteria": [
      "Patient communication system delivers timely, relevant messages.",
      "Mobile app provides user-friendly patient experience.",
      "Data integration maintains patient privacy and security.",
      "Analytics demonstrate measurable improvement in patient outcomes."
    ]
  },
  {
    "careerPathId": "6815011b4bf77605c5b5",
    "title": "Telehealth Quality Monitoring System",
    "description": "Build a quality monitoring system for telehealth consultations that tracks clinical outcomes, patient satisfaction, and care quality metrics.",
    "tools": [
      "Zoom Healthcare API",
      "REDCap",
      "Power BI",
      "SQL Server",
      "Microsoft Forms"
    ],
    "outcome": "A telehealth quality system that improves virtual care quality scores by 35% and ensures consistent care standards across remote consultations.",
    "difficulty": "Beginner",
    "estimatedDuration": "22-28 hours",
    "prerequisites": [
      "Telehealth practice knowledge",
      "Quality improvement concepts",
      "Database fundamentals",
      "Survey design principles"
    ],
    "steps": [
      "Configure Zoom Healthcare API for consultation data collection.",
      "Set up REDCap for patient outcome data capture.",
      "Create Microsoft Forms for patient satisfaction surveys.",
      "Build SQL Server database for quality metrics storage.",
      "Develop Power BI dashboards for quality performance monitoring.",
      "Implement automated quality improvement workflows."
    ],
    "evaluationCriteria": [
      "System captures comprehensive telehealth quality data.",
      "Patient satisfaction surveys provide actionable feedback.",
      "Quality metrics align with healthcare accreditation standards.",
      "Dashboard enables continuous quality improvement initiatives."
    ]
  },
  {
    "careerPathId": "68150101e60c774f6664",
    "title": "Full-Stack E-commerce Web Application",
    "description": "Develop a complete e-commerce platform with user authentication, product catalog, shopping cart, payment processing, and admin dashboard.",
    "tools": [
      "React.js",
      "Node.js",
      "MongoDB",
      "Stripe API",
      "AWS EC2",
      "Redux",
      "Express.js"
    ],
    "outcome": "A fully functional e-commerce application that handles 1000+ concurrent users and processes secure payments.",
    "difficulty": "Advanced",
    "estimatedDuration": "60-80 hours",
    "prerequisites": [
      "Proficiency in JavaScript ES6+",
      "Understanding of RESTful APIs",
      "Basic knowledge of databases",
      "Familiarity with version control (Git)"
    ],
    "steps": [
      "Set up development environment and project structure",
      "Create React frontend with component architecture",
      "Build Node.js/Express.js backend API",
      "Implement MongoDB database with Mongoose ODM",
      "Add user authentication using JWT tokens",
      "Integrate Stripe payment processing",
      "Implement admin dashboard for inventory management",
      "Deploy application to AWS EC2",
      "Add comprehensive testing suite",
      "Optimize performance and implement caching"
    ],
    "evaluationCriteria": [
      "Application handles concurrent users without performance issues",
      "Payment processing is secure and compliant",
      "All CRUD operations function correctly",
      "Responsive design works across all devices",
      "Security vulnerabilities are addressed"
    ]
  },
  {
    "careerPathId": "68150101e60c774f6664",
    "title": "Machine Learning Data Analysis Pipeline",
    "description": "Build an automated data pipeline that collects, processes, and analyzes large datasets using machine learning algorithms to generate predictive insights.",
    "tools": [
      "Python",
      "Pandas",
      "Scikit-learn",
      "TensorFlow",
      "Apache Airflow",
      "PostgreSQL",
      "Docker"
    ],
    "outcome": "An automated ML pipeline that processes 100GB+ datasets and achieves 85%+ prediction accuracy on target metrics.",
    "difficulty": "Advanced",
    "estimatedDuration": "50-65 hours",
    "prerequisites": [
      "Strong Python programming skills",
      "Understanding of machine learning concepts",
      "SQL database knowledge",
      "Basic statistics and data analysis"
    ],
    "steps": [
      "Design data ingestion pipeline using Apache Airflow",
      "Implement data cleaning and preprocessing with Pandas",
      "Create feature engineering pipeline",
      "Build and train ML models using Scikit-learn/TensorFlow",
      "Set up PostgreSQL database for processed data storage",
      "Implement model evaluation and validation processes",
      "Create automated retraining workflows",
      "Containerize application using Docker",
      "Deploy pipeline to cloud infrastructure",
      "Implement monitoring and alerting systems"
    ],
    "evaluationCriteria": [
      "Pipeline processes data automatically without manual intervention",
      "ML models achieve target accuracy metrics",
      "System handles data volume spikes gracefully",
      "Predictions are generated and stored correctly",
      "Performance monitoring shows optimal resource usage"
    ]
  },
  {
    "careerPathId": "68150101e60c774f6664",
    "title": "Mobile App Development with Cross-Platform Framework",
    "description": "Create a feature-rich mobile application using React Native that works on both iOS and Android platforms with offline capabilities and real-time features.",
    "tools": [
      "React Native",
      "Firebase",
      "Redux Toolkit",
      "Expo",
      "React Navigation",
      "AsyncStorage",
      "Socket.io"
    ],
    "outcome": "A cross-platform mobile app with 4.5+ app store rating and 10,000+ downloads within first month.",
    "difficulty": "Intermediate",
    "estimatedDuration": "40-50 hours",
    "prerequisites": [
      "JavaScript and React.js proficiency",
      "Understanding of mobile app design principles",
      "Basic knowledge of mobile development concepts",
      "Familiarity with API integration"
    ],
    "steps": [
      "Set up React Native development environment",
      "Design app architecture and navigation structure",
      "Implement core UI components and screens",
      "Integrate Firebase for authentication and database",
      "Add offline data synchronization capabilities",
      "Implement real-time features using Socket.io",
      "Add push notifications and app state management",
      "Optimize performance and implement error handling",
      "Test on both iOS and Android devices",
      "Prepare and submit to app stores"
    ],
    "evaluationCriteria": [
      "App runs smoothly on both iOS and Android",
      "Offline functionality works without data loss",
      "Real-time features update instantly",
      "App store submission guidelines are met",
      "Performance metrics meet industry standards"
    ]
  },
  {
    "careerPathId": "6815011d4335b07aefcb",
    "title": "Mobile Banking App Redesign",
    "description": "Conduct user research and redesign the onboarding flow for a mobile banking application to improve conversion rates.",
    "tools": [
      "Figma",
      "Miro",
      "Hotjar",
      "Optimal Workshop",
      "UserTesting"
    ],
    "outcome": "A tested prototype showing 25% improved onboarding completion rates with measurable usability improvements.",
    "difficulty": "Advanced",
    "estimatedDuration": "40–50 hours",
    "prerequisites": [
      "UX fundamentals",
      "Prototyping experience",
      "Understanding of banking regulations"
    ],
    "steps": [
      "Conduct user interviews",
      "Analyze current analytics",
      "Create journey maps",
      "Develop wireframes",
      "Build interactive prototype",
      "Conduct usability tests",
      "Iterate based on findings"
    ],
    "evaluationCriteria": [
      "Onboarding completion rate improves",
      "Task success rate increases",
      "Users report higher satisfaction",
      "Meets accessibility standards"
    ]
  },
  {
    "careerPathId": "6815011d4335b07aefcb",
    "title": "E-commerce Checkout Optimization",
    "description": "Identify and eliminate friction points in an e-commerce checkout process through iterative design improvements.",
    "tools": [
      "Adobe XD",
      "Crazy Egg",
      "Google Analytics",
      "UsabilityHub",
      "Sketch"
    ],
    "outcome": "A streamlined checkout flow that reduces cart abandonment by 15% and increases average order value.",
    "difficulty": "Intermediate",
    "estimatedDuration": "30–35 hours",
    "prerequisites": [
      "Conversion rate optimization basics",
      "A/B testing knowledge",
      "E-commerce experience"
    ],
    "steps": [
      "Analyze current funnel metrics",
      "Conduct heuristic evaluation",
      "Create heatmap analysis",
      "Design alternative flows",
      "Implement A/B tests",
      "Measure impact on KPIs"
    ],
    "evaluationCriteria": [
      "Cart abandonment rate decreases",
      "Checkout completion time shortens",
      "Revenue per visitor increases",
      "Error rates decline"
    ]
  },
  {
    "careerPathId": "6815011d4335b07aefcb",
    "title": "Accessibility Audit & Redesign",
    "description": "Perform comprehensive accessibility evaluation of a website and redesign key components to meet WCAG 2.1 AA standards.",
    "tools": [
      "axe DevTools",
      "WAVE",
      "Color Contrast Analyzer",
      "VoiceOver",
      "JAWS"
    ],
    "outcome": "An accessibility report with prioritized recommendations and redesigned components that pass WCAG 2.1 AA criteria.",
    "difficulty": "Intermediate",
    "estimatedDuration": "25–30 hours",
    "prerequisites": [
      "WCAG guidelines knowledge",
      "Screen reader basics",
      "HTML/CSS fundamentals"
    ],
    "steps": [
      "Conduct automated scans",
      "Perform manual keyboard testing",
      "Test with screen readers",
      "Evaluate color contrast",
      "Redesign problematic components",
      "Verify with disabled users"
    ],
    "evaluationCriteria": [
      "Meets WCAG 2.1 AA standards",
      "Keyboard navigation works",
      "Screen reader compatibility",
      "Color contrast passes"
    ]
  },
  {
    "careerPathId": "6815010dae0c06c737f2",
    "title": "Corporate Brand Video Series",
    "description": "Produce a series of branded video content pieces for a corporate client including testimonials, product demos, and culture highlights.",
    "tools": [
      "Adobe Premiere Pro",
      "DaVinci Resolve",
      "After Effects",
      "Audition",
      "Frame.io"
    ],
    "outcome": "5-7 polished video assets that align with brand guidelines and achieve 50,000+ combined views within first month.",
    "difficulty": "Advanced",
    "estimatedDuration": "50–60 hours",
    "prerequisites": [
      "Video editing proficiency",
      "Color grading basics",
      "Audio mixing skills"
    ],
    "steps": [
      "Develop creative brief",
      "Shoot/acquire raw footage",
      "Organize media assets",
      "Edit rough cuts",
      "Add motion graphics",
      "Color grade and mix audio",
      "Deliver final files"
    ],
    "evaluationCriteria": [
      "Meets brand standards",
      "Engagement metrics hit targets",
      "Audio/video quality professional",
      "Client approves with <2 revisions"
    ]
  },
  {
    "careerPathId": "6815010dae0c06c737f2",
    "title": "YouTube Creator Toolkit",
    "description": "Create a package of reusable intro/outro templates, lower thirds, and transition effects for YouTube creators.",
    "tools": [
      "Final Cut Pro",
      "Motion",
      "Photoshop",
      "Element 3D",
      "LUTs"
    ],
    "outcome": "A branded template package that helps creators maintain consistent visual identity while saving 5+ hours per video.",
    "difficulty": "Intermediate",
    "estimatedDuration": "20–25 hours",
    "prerequisites": [
      "Motion graphics experience",
      "Understanding of YouTube trends",
      "Template creation skills"
    ],
    "steps": [
      "Design visual identity elements",
      "Animate intro sequence",
      "Create lower third templates",
      "Develop transition pack",
      "Export with placeholders",
      "Document usage instructions"
    ],
    "evaluationCriteria": [
      "Templates are easily customizable",
      "Renders without errors",
      "Saves measurable editing time",
      "Viewers recognize brand consistently"
    ]
  },
  {
    "careerPathId": "6815010dae0c06c737f2",
    "title": "Social Media Ad Optimization",
    "description": "Edit and optimize video content for maximum performance across Instagram, TikTok, and Facebook ad platforms.",
    "tools": [
      "CapCut",
      "Premiere Rush",
      "InShot",
      "VLLO",
      "Canva Video"
    ],
    "outcome": "Platform-specific video edits that achieve 3%+ CTR and 50% lower cost-per-conversion than generic versions.",
    "difficulty": "Beginner",
    "estimatedDuration": "10–15 hours",
    "prerequisites": [
      "Understanding of social platforms",
      "Basic editing skills",
      "Knowledge of ad specs"
    ],
    "steps": [
      "Analyze platform requirements",
      "Edit for silent autoplay",
      "Add platform-specific captions",
      "Optimize aspect ratios",
      "Test multiple cuts",
      "Analyze performance data"
    ],
    "evaluationCriteria": [
      "Meets platform technical specs",
      "Improves engagement metrics",
      "Reduces cost-per-result",
      "Works without sound"
    ]
  },
  {
    "careerPathId": "681501048fea687e2e70",
    "title": "Customer Feedback Analytics Dashboard",
    "description": "Develop a system to collect, analyze, and visualize customer feedback to inform product decisions and improve user satisfaction.",
    "tools": [
      "Typeform",
      "Google Sheets",
      "Zapier",
      "Looker Studio",
      "Python (NLTK)"
    ],
    "outcome": "A centralized dashboard displaying real-time insights from customer feedback, helping guide product feature prioritization.",
    "difficulty": "Intermediate",
    "estimatedDuration": "10–15 hours",
    "prerequisites": [
      "Basic understanding of customer feedback processes",
      "Familiarity with Google Sheets",
      "Intro to Python and basic NLP concepts"
    ],
    "steps": [
      "Create a feedback survey using Typeform.",
      "Connect Typeform to Google Sheets using Zapier.",
      "Use Python (NLTK) to analyze sentiment in responses.",
      "Visualize sentiment and recurring topics in Looker Studio.",
      "Iterate based on stakeholder feedback."
    ],
    "evaluationCriteria": [
      "Feedback is collected automatically and visualized clearly.",
      "Sentiment analysis reflects general user tone accurately.",
      "Insights inform specific product decisions."
    ]
  },
  {
    "careerPathId": "681501048fea687e2e70",
    "title": "Minimum Viable Product (MVP) Launch Plan",
    "description": "Create a detailed launch plan for an MVP, including roadmap, user stories, KPIs, and go-to-market strategy.",
    "tools": [
      "Jira",
      "Notion",
      "Figma",
      "Trello",
      "Google Analytics"
    ],
    "outcome": "An actionable MVP plan with timelines, mockups, feature lists, and defined success metrics.",
    "difficulty": "Beginner",
    "estimatedDuration": "8–12 hours",
    "prerequisites": [
      "Basic knowledge of product lifecycle",
      "Intro to UX/UI tools like Figma",
      "Familiarity with task boards like Trello"
    ],
    "steps": [
      "Define the problem and MVP scope in Notion.",
      "Design wireframes or mockups in Figma.",
      "Create user stories and backlog items in Jira.",
      "Build a Trello board to organize tasks and timelines.",
      "Define KPIs and plan tracking with Google Analytics."
    ],
    "evaluationCriteria": [
      "Clear and realistic MVP scope with defined metrics.",
      "Launch roadmap includes technical and marketing considerations.",
      "Mockups align with MVP features."
    ]
  },
  {
    "careerPathId": "681501048fea687e2e70",
    "title": "User Behavior Analysis for Feature Prioritization",
    "description": "Leverage user activity data to identify patterns and prioritize new features based on actual usage.",
    "tools": [
      "Mixpanel",
      "Amplitude",
      "Segment",
      "Google Sheets",
      "Python (pandas)"
    ],
    "outcome": "A report showing top user flows, drop-off points, and recommended features for improvement.",
    "difficulty": "Advanced",
    "estimatedDuration": "18–25 hours",
    "prerequisites": [
      "Intermediate Python (pandas, data visualization)",
      "Knowledge of product metrics",
      "Experience with analytics tools"
    ],
    "steps": [
      "Collect event data using Mixpanel or Amplitude.",
      "Export and clean data using Segment and Python.",
      "Analyze user paths, drop-offs, and feature usage.",
      "Summarize insights and feature opportunities in Google Sheets.",
      "Present findings in a product prioritization matrix."
    ],
    "evaluationCriteria": [
      "Findings are based on real user data.",
      "Feature recommendations align with usage trends.",
      "Analysis clearly informs roadmap decisions."
    ]
  },
  {
    "careerPathId": "681501168de1f2dd6431",
    "title": "Agile Sprint Management System",
    "description": "Design and implement an Agile sprint system to improve team velocity and task tracking.",
    "tools": [
      "Jira",
      "Confluence",
      "Slack",
      "Miro",
      "Burndown Chart Templates"
    ],
    "outcome": "A working Agile sprint setup with defined roles, backlogs, sprint planning, and burndown tracking.",
    "difficulty": "Intermediate",
    "estimatedDuration": "10–14 hours",
    "prerequisites": [
      "Understanding of Agile/Scrum principles",
      "Basic Jira setup knowledge",
      "Team collaboration skills"
    ],
    "steps": [
      "Set up project backlog and sprints in Jira.",
      "Document processes and roles in Confluence.",
      "Facilitate sprint planning using Miro.",
      "Use Slack for daily standups and team updates.",
      "Track progress with burndown charts and retrospectives."
    ],
    "evaluationCriteria": [
      "Sprints are executed with clear structure.",
      "Team collaboration improves with the new system.",
      "Burndown charts reflect task completion accurately."
    ]
  },
  {
    "careerPathId": "681501168de1f2dd6431",
    "title": "Risk Management Plan for Software Development",
    "description": "Develop a comprehensive risk assessment and mitigation plan for a software development project.",
    "tools": [
      "Microsoft Excel",
      "Lucidchart",
      "Asana",
      "Google Docs",
      "Slack"
    ],
    "outcome": "A proactive risk plan including identification, probability scoring, and mitigation strategies.",
    "difficulty": "Advanced",
    "estimatedDuration": "12–18 hours",
    "prerequisites": [
      "Familiarity with risk analysis frameworks",
      "Project planning experience",
      "Basic spreadsheet modeling"
    ],
    "steps": [
      "List potential risks using a brainstorming session.",
      "Score risks based on likelihood and impact in Excel.",
      "Create a risk matrix and response plan in Lucidchart.",
      "Integrate risk tracking into Asana project board.",
      "Review and update risk items weekly via Slack syncs."
    ],
    "evaluationCriteria": [
      "Risk matrix clearly prioritizes project threats.",
      "Mitigation plans are actionable and time-bound.",
      "Project team incorporates risk tracking into workflow."
    ]
  },
  {
    "careerPathId": "681501168de1f2dd6431",
    "title": "Stakeholder Communication Tracker",
    "description": "Build a system to track communication frequency, method, and sentiment with all stakeholders involved in a project.",
    "tools": [
      "Airtable",
      "Notion",
      "Zapier",
      "Google Calendar",
      "Grammarly"
    ],
    "outcome": "A regularly updated dashboard that helps ensure timely, positive, and effective stakeholder engagement.",
    "difficulty": "Beginner",
    "estimatedDuration": "6–10 hours",
    "prerequisites": [
      "Basic understanding of stakeholder management",
      "Familiarity with Airtable or Notion",
      "Intro to workflow automation tools"
    ],
    "steps": [
      "List key stakeholders and their communication preferences.",
      "Set up an Airtable tracker with date, method, and status fields.",
      "Use Zapier to automate meeting scheduling from Google Calendar.",
      "Document summaries of conversations in Notion.",
      "Use Grammarly to maintain professionalism in email templates."
    ],
    "evaluationCriteria": [
      "All stakeholders are regularly contacted with tailored updates.",
      "Dashboard is maintained with minimal manual input.",
      "Improved stakeholder satisfaction is observed."
    ]
  }
]