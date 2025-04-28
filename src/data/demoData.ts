
export interface Program {
  id: string;
  name: string;
  highlights: string[];
  sellingPoints: string[];
  targetAudience: string;
  description: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface ScriptVersion {
  length: "20" | "30" | "45";
  script: string;
  hooks: string[];
}

export interface GeneratedScripts {
  versions: ScriptVersion[];
}

export const demoPrograms: Program[] = [
  {
    id: "fs-bootcamp",
    name: "Full-Stack Developer Bootcamp",
    highlights: ["12-week intensive program", "Real-world projects", "Job placement assistance"],
    sellingPoints: [
      "Learn from industry experts",
      "Build a portfolio of 5+ projects",
      "1:1 mentorship throughout the program"
    ],
    targetAudience: "Career changers and aspiring developers",
    description: "An immersive coding experience that transforms beginners into job-ready developers through hands-on projects and personalized mentorship."
  },
  {
    id: "pm-masterclass",
    name: "Product Management Masterclass",
    highlights: ["8-week course", "Product strategy", "Market analysis"],
    sellingPoints: [
      "Taught by FAANG product leaders",
      "Live interactive workshops",
      "Certification recognized by top companies"
    ],
    targetAudience: "Aspiring and junior product managers",
    description: "Learn the strategies and frameworks used by the world's best product managers to build successful digital products."
  },
  {
    id: "ds-bootcamp",
    name: "Data Science Bootcamp",
    highlights: ["10-week program", "Python & ML fundamentals", "Capstone project"],
    sellingPoints: [
      "Cover the entire data science pipeline",
      "Work with real-world datasets",
      "Get hired guarantee or money back"
    ],
    targetAudience: "Analytics professionals seeking to upskill",
    description: "Master the skills needed to become a data scientist, including statistical analysis, machine learning, and data visualization."
  }
];

export const aiModels: AIModel[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Optimized for conversational and creative content generation"
  },
  {
    id: "claude",
    name: "Claude",
    description: "Specialized in nuanced, detailed, and context-aware content"
  }
];

export const demoReferenceScript = `
Are you tired of spending hours debugging your code? 
Introducing CodeMaster Pro - the AI-powered assistant that helps you write clean, 
error-free code in half the time. 
With intelligent suggestions and real-time error detection, 
you'll boost your productivity instantly. 
Try CodeMaster Pro free for 14 days and join thousands of developers 
who've transformed their coding workflow. 
Visit codemaster.io now to get started.
`;

export const demoGeneratedScripts: Record<string, GeneratedScripts> = {
  "fs-bootcamp": {
    versions: [
      {
        length: "20",
        script: "Tired of learning to code alone? GrowthSchool's Full-Stack Developer Bootcamp transforms beginners into job-ready developers in just 12 weeks. With industry expert mentors and real-world projects, you'll build a standout portfolio. Join thousands of successful graduates now. Visit GrowthSchool.com to secure your spot.",
        hooks: [
          "From zero coding skills to hired developer in 12 weeks.",
          "Stop watching coding tutorials. Start building real projects.",
          "What if you could restart your career with just 12 weeks of focused learning?"
        ]
      },
      {
        length: "30",
        script: "Dreaming of a developer career but stuck in tutorial loops? GrowthSchool's Full-Stack Developer Bootcamp transforms complete beginners into job-ready programmers in just 12 weeks. Our unique approach combines hands-on projects with 1:1 mentorship from industry experts. You'll graduate with a portfolio of five real-world applications and our job placement support. Join over 2,000 graduates who've landed roles at top tech companies. Visit GrowthSchool.com today – your new career is waiting.",
        hooks: [
          "The difference between amateur coders and employed developers? Just 12 weeks at GrowthSchool.",
          "Watching another coding tutorial won't get you hired. Our bootcamp will.",
          "Tech companies are hiring developers faster than ever. Are you ready to join them?"
        ]
      },
      {
        length: "45",
        script: "Still jumping between coding tutorials but not seeing results? GrowthSchool's Full-Stack Developer Bootcamp transforms complete beginners into employed developers in just 12 intensive weeks. Unlike other programs, we focus on what employers actually want: real-world experience and problem-solving skills. You'll build five production-grade applications guided by mentors from top tech companies. Our curriculum covers modern JavaScript, React, Node.js, databases, and deployment - the exact stack companies are hiring for right now. With 1:1 weekly mentorship and dedicated career coaching, over 85% of our graduates land developer roles within 3 months of completion. We're so confident in our program that if you don't get hired, you don't pay. Visit GrowthSchool.com today to apply for our next cohort. Spaces are limited, and your new tech career is waiting.",
        hooks: [
          "The tech industry needs 400,000 new developers this year. Will you be one of them?",
          "The average bootcamp graduate spends 8 months job hunting. Our students? Just 6 weeks.",
          "What separates self-taught coders from $100K developers isn't talent - it's structured guidance."
        ]
      }
    ]
  },
  "pm-masterclass": {
    versions: [
      {
        length: "20",
        script: "Want to break into product management? GrowthSchool's 8-week PM Masterclass is taught by FAANG product leaders. Learn product strategy, market analysis, and user-centered design through live workshops. Earn a certification recognized by top companies. Visit GrowthSchool.com to transform your career today.",
        hooks: [
          "Learn product management directly from Google and Amazon PMs.",
          "Product managers earn $120K+ annually. Our 8-week course can get you there.",
          "Every great product has a story. Learn to tell yours."
        ]
      },
      {
        length: "30",
        script: "Dreaming of leading product teams but don't know where to start? GrowthSchool's Product Management Masterclass bridges the gap in just 8 weeks. Learn directly from product leaders at Google, Amazon, and Meta through live interactive workshops. Master essential PM skills like product strategy, user research, and roadmap development. Our certification is recognized by over 200 tech companies worldwide. Whether you're looking to break into product or level up your existing skills, our curriculum is designed for real-world application. Join our next cohort at GrowthSchool.com.",
        hooks: [
          "The difference between good products and great ones? Strategic product management.",
          "Companies are desperate for qualified product managers. Here's your entry ticket.",
          "Product management isn't taught in college. Learn it from those who've mastered it."
        ]
      },
      {
        length: "45",
        script: "Looking to break into product management or accelerate your PM career? GrowthSchool's Product Management Masterclass delivers what no book or tutorial can – real-world expertise from active FAANG product leaders. Over 8 intensive weeks, you'll master the complete product lifecycle through interactive workshops and practical assignments. Learn how to identify market opportunities, conduct effective user research, prioritize features strategically, and communicate with stakeholders. Our curriculum covers both technical and leadership aspects of product management, from working with developers to influencing executive decisions. What sets us apart? Each session is taught live by product leaders from companies like Google, Amazon, and Meta who share their actual frameworks and decision-making processes. Our certification is recognized by over 200 tech companies, and our career support has helped graduates secure PM roles averaging $115K starting salary. Spaces are limited for our next cohort. Visit GrowthSchool.com today to secure your spot.",
        hooks: [
          "The highest-impact role in tech isn't engineering—it's product management.",
          "Great PMs aren't born. They're trained by other great PMs.",
          "The average tech company interviews 32 candidates before hiring one PM. Be the one they choose."
        ]
      }
    ]
  },
  "ds-bootcamp": {
    versions: [
      {
        length: "20",
        script: "Data skills are in demand, but learning alone is ineffective. GrowthSchool's 10-week Data Science Bootcamp covers Python, machine learning, and visualization with real-world datasets. Graduate with a portfolio companies want and our job guarantee. Join thousands of successful data scientists. Visit GrowthSchool.com to transform your career.",
        hooks: [
          "Data scientists command $120K+ salaries. Our bootcamp gets you there in 10 weeks.",
          "Transform from spreadsheet user to data scientist with our guaranteed program.",
          "Data is the new oil. Learn to refine it."
        ]
      },
      {
        length: "30",
        script: "Struggling to break into data science? GrowthSchool's Data Science Bootcamp transforms analytics professionals into sought-after data scientists in just 10 weeks. Our curriculum covers the entire data pipeline – from cleaning and analysis to advanced machine learning models. Work with real-world datasets while being mentored by data scientists from top tech companies. The program culminates in a capstone project that showcases your abilities to future employers. With our unique hiring guarantee, you'll land a data role or get your money back. Join our next cohort at GrowthSchool.com and become part of the data revolution.",
        hooks: [
          "Companies have more data than ever, but not enough people who can interpret it.",
          "What separates data analysts from data scientists? 10 weeks of structured learning.",
          "Master machine learning without a math PhD. Our bootcamp makes it accessible."
        ]
      },
      {
        length: "45",
        script: "Feel stuck in your analytics career while data scientists command top salaries? GrowthSchool's Data Science Bootcamp bridges the skills gap in just 10 intensive weeks. Unlike self-learning, our program follows a carefully designed progression that takes you from data fundamentals to advanced machine learning. You'll master Python programming, statistical analysis, data visualization, and predictive modeling – all through hands-on work with real-world datasets. Our instructors are practicing data scientists who bring current industry problems into the classroom. Each week builds toward your capstone project – a comprehensive data solution that demonstrates your capabilities to employers. The bootcamp includes specialized career preparation, from technical interview coaching to portfolio development. We're so confident in our approach that we offer a job guarantee – land a data role within six months or get your tuition back. With over 1,400 graduates now working at companies like Google, Amazon, and innovative startups, our track record speaks for itself. Visit GrowthSchool.com today to secure your spot in our limited-enrollment next cohort.",
        hooks: [
          "Every business decision can be optimized with data. Learn to be the person who does it.",
          "The gap between collecting data and leveraging it is massive. Bridge it in 10 weeks.",
          "Companies are drowning in data but starving for insights. Become their lifeline."
        ]
      }
    ]
  }
};
