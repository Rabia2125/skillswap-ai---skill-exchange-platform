import { User, SwapRequest, Conversation, Message, NotificationItem, ExchangeRecord } from '../types';

export const SKILL_CATEGORIES = [
  'Web Development',
  'App Development',
  'Programming',
  'Graphic Designing',
  'UI/UX Designing',
  'Digital Marketing',
  'Freelancing',
  'Content Writing',
  'Video Editing',
  'Data Analysis',
  'Artificial Intelligence',
  'Communication Skills',
  'Database Management',
  'Software Engineering',
] as const;

export const INITIAL_USERS: User[] = [
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    location: 'San Francisco, CA',
    createdAt: '2025-01-15T09:30:00Z',
    profile: {
      id: 'prof_alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      avatar: '/src/assets/images/avatar_developer_male_1794059250716.jpg',
      location: 'San Francisco, CA',
      title: 'Full-Stack Software Engineer',
      bio: 'Senior software developer with 6+ years building scalable cloud applications, React apps, and distributed systems. Passionate about mentoring and eager to master modern product UI/UX design systems.',
      skillsToTeach: [
        { id: 'sk_1', name: 'React.js & Next.js', category: 'Web Development', level: 'Advanced', experienceYears: 5, description: 'Component architecture, state management, performance optimization' },
        { id: 'sk_2', name: 'Python & FastAPI', category: 'Programming', level: 'Advanced', experienceYears: 4, description: 'REST APIs, asynchronous programming, backend architecture' },
        { id: 'sk_3', name: 'Software Architecture', category: 'Software Engineering', level: 'Intermediate', experienceYears: 3, description: 'System design, microservices, clean code practices' }
      ],
      skillsToLearn: ['UI/UX Designing', 'Figma Prototyping', 'Design Systems', 'Graphic Designing'],
      experience: 'Senior Engineer at CloudScale Tech (4 yrs), Software Engineer at DevWave (2 yrs)',
      education: 'B.S. in Computer Science, University of California, Berkeley',
      interests: ['Open Source', 'System Architecture', 'Design Systems', 'Coffee Brewing'],
      availability: 'Weekday evenings (6 PM - 9 PM PST) & Saturday mornings',
      learningGoals: 'Create production-ready design mockups in Figma with high-fidelity interactions before writing frontend code.',
      joinedDate: 'January 2025',
      rating: 4.9,
      exchangesCompleted: 8
    }
  },
  {
    id: 'user_maya',
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    location: 'Brooklyn, NY',
    createdAt: '2025-02-01T14:20:00Z',
    profile: {
      id: 'prof_maya',
      name: 'Maya Lin',
      email: 'maya.lin@example.com',
      avatar: '/src/assets/images/avatar_mentor_female_1794059251546.jpg',
      location: 'Brooklyn, NY',
      title: 'Lead Product & UI/UX Designer',
      bio: 'Design lead specializing in enterprise SaaS user research, micro-interactions, and design tokens. Looking to exchange UI/UX expertise for hands-on modern Web Development and React.',
      skillsToTeach: [
        { id: 'sk_4', name: 'UI/UX Designing', category: 'UI/UX Designing', level: 'Advanced', experienceYears: 7, description: 'User testing, wireframing, high-fidelity prototypes in Figma' },
        { id: 'sk_5', name: 'Design Systems', category: 'UI/UX Designing', level: 'Advanced', experienceYears: 5, description: 'Token architecture, component libraries, typography hierarchy' },
        { id: 'sk_6', name: 'Graphic Designing', category: 'Graphic Designing', level: 'Intermediate', experienceYears: 4, description: 'Brand identity, typography pairing, vector illustration' }
      ],
      skillsToLearn: ['Web Development', 'React.js', 'Tailwind CSS', 'TypeScript'],
      experience: 'Design Lead at StudioForm (3 yrs), Senior UX at PixelGrid (3 yrs)',
      education: 'B.F.A. in Interaction Design, Rhode Island School of Design',
      interests: ['Typography', 'Accessibility', 'Frontend Engineering', 'Ceramics'],
      availability: 'Tuesdays & Thursdays (5 PM - 8 PM EST), Sundays (10 AM - 2 PM EST)',
      learningGoals: 'Implement my own UI mockups into live interactive React and Tailwind components with zero design fidelity loss.',
      joinedDate: 'February 2025',
      rating: 5.0,
      exchangesCompleted: 11
    }
  },
  {
    id: 'user_elena',
    name: 'Dr. Elena Zhang',
    email: 'elena.zhang@example.com',
    location: 'Boston, MA',
    createdAt: '2025-02-10T11:15:00Z',
    profile: {
      id: 'prof_elena',
      name: 'Dr. Elena Zhang',
      email: 'elena.zhang@example.com',
      avatar: '/src/assets/images/avatar_analyst_female_1794059250595.jpg',
      location: 'Boston, MA',
      title: 'AI Researcher & Data Scientist',
      bio: 'Machine learning specialist focused on NLP, large language models, and predictive analytics. Looking to collaborate with developers who want to master AI while helping me build mobile apps.',
      skillsToTeach: [
        { id: 'sk_7', name: 'Artificial Intelligence', category: 'Artificial Intelligence', level: 'Expert', experienceYears: 6, description: 'LLM fine-tuning, prompt engineering, embeddings, PyTorch' },
        { id: 'sk_8', name: 'Data Analysis', category: 'Data Analysis', level: 'Expert', experienceYears: 6, description: 'Pandas, NumPy, data storytelling, statistical modeling' },
        { id: 'sk_9', name: 'Python', category: 'Programming', level: 'Advanced', experienceYears: 7, description: 'Advanced Python idioms, concurrency, scientific computing' }
      ],
      skillsToLearn: ['App Development', 'React Native', 'Mobile UI/UX', 'Cloud Deployment'],
      experience: 'Principal AI Scientist at Cogent Analytics, Postdoctoral Fellow at MIT',
      education: 'Ph.D. in Computational Science, MIT',
      interests: ['AI Ethics', 'Data Visualization', 'Bouldering', 'Classical Piano'],
      availability: 'Monday & Wednesday evenings, flexible weekends',
      learningGoals: 'Develop cross-platform mobile prototypes to deploy machine learning models directly to consumer devices.',
      joinedDate: 'February 2025',
      rating: 4.95,
      exchangesCompleted: 6
    }
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    location: 'Austin, TX',
    createdAt: '2025-02-18T16:45:00Z',
    profile: {
      id: 'prof_marcus',
      name: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      location: 'Austin, TX',
      title: 'Mobile App Engineer (iOS & React Native)',
      bio: 'Shipped 12+ apps to the Apple App Store and Google Play. Seeking an AI expert to guide me through integrating generative AI APIs and vector embeddings into mobile user experiences.',
      skillsToTeach: [
        { id: 'sk_10', name: 'App Development', category: 'App Development', level: 'Advanced', experienceYears: 5, description: 'React Native, Expo, Swift, native mobile navigation' },
        { id: 'sk_11', name: 'Mobile Performance', category: 'App Development', level: 'Intermediate', experienceYears: 4, description: 'Memory optimization, offline caching, push notifications' }
      ],
      skillsToLearn: ['Artificial Intelligence', 'Data Analysis', 'Python Backend'],
      experience: 'Senior Mobile Dev at AppCraft Studio, Mobile Consultant for startups',
      education: 'B.S. in Software Engineering, UT Austin',
      interests: ['Mobile HCI', 'Wearables', 'Cycling', 'Indie Hacking'],
      availability: 'Weekdays after 6:30 PM CST',
      learningGoals: 'Integrate Gemini API and on-device intelligent search into an open-source mobile application.',
      joinedDate: 'February 2025',
      rating: 4.85,
      exchangesCompleted: 5
    }
  },
  {
    id: 'user_sophia',
    name: 'Sophia Patel',
    email: 'sophia.patel@example.com',
    location: 'Toronto, Canada',
    createdAt: '2025-02-25T10:00:00Z',
    profile: {
      id: 'prof_sophia',
      name: 'Sophia Patel',
      email: 'sophia.patel@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
      location: 'Toronto, Canada',
      title: 'Brand Strategist & Visual Designer',
      bio: 'Creative director focused on brand identities, editorial layout, and digital marketing graphics. Looking to learn Database Management and Web Development basics to launch my digital agency portal.',
      skillsToTeach: [
        { id: 'sk_12', name: 'Graphic Designing', category: 'Graphic Designing', level: 'Advanced', experienceYears: 6, description: 'Adobe Illustrator, Photoshop, vector logo design, branding guidelines' },
        { id: 'sk_13', name: 'Digital Marketing', category: 'Digital Marketing', level: 'Intermediate', experienceYears: 4, description: 'Visual social ad campaigns, conversion copywriting visuals' }
      ],
      skillsToLearn: ['Database Management', 'Web Development', 'Freelancing Business'],
      experience: 'Creative Director at Nomad Brands (3 yrs), Freelance Designer (3 yrs)',
      education: 'B.Des. in Graphic Design, OCAD University',
      interests: ['Typography', 'Editorial Art', 'Specialty Coffee', 'Architecture'],
      availability: 'Weekends 11 AM - 4 PM EST, Wednesdays 6 PM - 9 PM EST',
      learningGoals: 'Understand relational and NoSQL databases to structure client portals and content management systems.',
      joinedDate: 'February 2025',
      rating: 4.9,
      exchangesCompleted: 7
    }
  },
  {
    id: 'user_david',
    name: 'David Kim',
    email: 'david.kim@example.com',
    location: 'Seattle, WA',
    createdAt: '2025-03-01T12:00:00Z',
    profile: {
      id: 'prof_david',
      name: 'David Kim',
      email: 'david.kim@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
      location: 'Seattle, WA',
      title: 'Cloud Database Administrator & Backend Dev',
      bio: 'Deep expertise in MongoDB, PostgreSQL indexing, query optimization, and schema migrations. Looking to improve my Video Editing and Content Writing skills to create educational technical videos.',
      skillsToTeach: [
        { id: 'sk_14', name: 'Database Management', category: 'Database Management', level: 'Expert', experienceYears: 8, description: 'MongoDB aggregation pipelines, indexing, sharding, PostgreSQL' },
        { id: 'sk_15', name: 'Software Engineering', category: 'Software Engineering', level: 'Advanced', experienceYears: 7, description: 'Scalable backend design, CI/CD, Docker, Kubernetes' }
      ],
      skillsToLearn: ['Video Editing', 'Content Writing', 'Communication Skills'],
      experience: 'Staff DBA at DataGrid Systems (5 yrs), DevOps Engineer at NetCore',
      education: 'M.S. in Computer Science, University of Washington',
      interests: ['Databases', 'Audiobooks', 'Hiking', 'Home Automation'],
      availability: 'Saturday and Sunday afternoons (PST)',
      learningGoals: 'Produce clean, engaging YouTube tutorials explaining database internals with professional video edits.',
      joinedDate: 'March 2025',
      rating: 4.98,
      exchangesCompleted: 9
    }
  },
  {
    id: 'user_rachel',
    name: 'Rachel Green',
    email: 'rachel.green@example.com',
    location: 'Chicago, IL',
    createdAt: '2025-03-05T08:30:00Z',
    profile: {
      id: 'prof_rachel',
      name: 'Rachel Green',
      email: 'rachel.green@example.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
      location: 'Chicago, IL',
      title: 'B2B Content Strategist & Copywriter',
      bio: 'Published writer and content director helping tech startups clarify their product messaging. Want to trade writing & SEO strategy for learning Python data analysis or Web Development.',
      skillsToTeach: [
        { id: 'sk_16', name: 'Content Writing', category: 'Content Writing', level: 'Advanced', experienceYears: 6, description: 'Editorial strategy, SEO copywriting, thought leadership articles' },
        { id: 'sk_17', name: 'Communication Skills', category: 'Communication Skills', level: 'Advanced', experienceYears: 5, description: 'Executive presentations, pitching, persuasive writing' }
      ],
      skillsToLearn: ['Data Analysis', 'Web Development', 'Digital Marketing'],
      experience: 'Head of Content at SaaSGrow (3 yrs), Tech Journalist (3 yrs)',
      education: 'B.A. in Journalism, Northwestern University',
      interests: ['Longform Journalism', 'Podcasts', 'Urban Gardening', 'Creative Nonfiction'],
      availability: 'Monday and Thursday 12 PM - 3 PM CST',
      learningGoals: 'Use Python and data visualization to analyze SEO search traffic trends and write data-driven whitepapers.',
      joinedDate: 'March 2025',
      rating: 4.9,
      exchangesCompleted: 4
    }
  },
  {
    id: 'user_liam',
    name: 'Liam O’Connor',
    email: 'liam.oconnor@example.com',
    location: 'London, UK',
    createdAt: '2025-03-10T15:10:00Z',
    profile: {
      id: 'prof_liam',
      name: 'Liam O’Connor',
      email: 'liam.oconnor@example.com',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face',
      location: 'London, UK',
      title: 'Motion Designer & Video Editor',
      bio: 'Commercial video editor and motion graphics artist with experience in DaVinci Resolve, Premiere, and After Effects. Looking to learn Freelancing business growth and Digital Marketing.',
      skillsToTeach: [
        { id: 'sk_18', name: 'Video Editing', category: 'Video Editing', level: 'Advanced', experienceYears: 5, description: 'DaVinci Resolve color grading, pacing, sound design, Premiere Pro' },
        { id: 'sk_19', name: 'Freelancing', category: 'Freelancing', level: 'Intermediate', experienceYears: 4, description: 'Client contracts, proposal writing, portfolio presentation' }
      ],
      skillsToLearn: ['Digital Marketing', 'Artificial Intelligence', 'Web Development'],
      experience: 'Senior Video Editor at Apex Media, Freelance Motion Designer',
      education: 'B.A. in Film Production, University of the Arts London',
      interests: ['Cinematography', 'Soundtrack Mixing', 'Photography', 'Travel'],
      availability: 'Evenings (GMT) and weekend mornings',
      learningGoals: 'Learn digital marketing funnels to scale my creative video agency and get inbound client inquiries.',
      joinedDate: 'March 2025',
      rating: 4.88,
      exchangesCompleted: 5
    }
  }
];

export const INITIAL_SWAP_REQUESTS: SwapRequest[] = [
  {
    id: 'req_1',
    senderId: 'user_maya',
    senderName: 'Maya Lin',
    senderAvatar: '/src/assets/images/avatar_mentor_female_1794059251546.jpg',
    senderLocation: 'Brooklyn, NY',
    receiverId: 'user_alex',
    receiverName: 'Alex Rivera',
    receiverAvatar: '/src/assets/images/avatar_developer_male_1794059250716.jpg',
    receiverLocation: 'San Francisco, CA',
    offeredSkill: 'UI/UX Designing & Figma Systems',
    requestedSkill: 'React.js & Next.js Architecture',
    message: 'Hi Alex! I saw your profile and would love to exchange knowledge. I can teach you Figma design systems, tokens, and UX heuristics in exchange for deep-dive sessions on React component patterns and state management.',
    status: 'Accepted',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-03-01T11:30:00Z'
  },
  {
    id: 'req_2',
    senderId: 'user_elena',
    senderName: 'Dr. Elena Zhang',
    senderAvatar: '/src/assets/images/avatar_analyst_female_1794059250595.jpg',
    senderLocation: 'Boston, MA',
    receiverId: 'user_alex',
    receiverName: 'Alex Rivera',
    receiverAvatar: '/src/assets/images/avatar_developer_male_1794059250716.jpg',
    receiverLocation: 'San Francisco, CA',
    offeredSkill: 'Artificial Intelligence & LLMs',
    requestedSkill: 'Python & FastAPI Backend',
    message: 'Hello Alex! I am looking for someone to help me refine my FastAPI production deployment practices and REST architecture. I can guide you through prompt engineering, embeddings, and generative AI models in return.',
    status: 'Pending',
    createdAt: '2025-03-04T15:20:00Z',
    updatedAt: '2025-03-04T15:20:00Z'
  },
  {
    id: 'req_3',
    senderId: 'user_alex',
    senderName: 'Alex Rivera',
    senderAvatar: '/src/assets/images/avatar_developer_male_1794059250716.jpg',
    senderLocation: 'San Francisco, CA',
    receiverId: 'user_david',
    receiverName: 'David Kim',
    receiverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    receiverLocation: 'Seattle, WA',
    offeredSkill: 'React.js & Next.js',
    requestedSkill: 'Database Management & MongoDB',
    message: 'Hey David, I would love to learn advanced MongoDB aggregation pipelines and indexing strategies from you. Happy to coach you on modern React and frontend tooling!',
    status: 'Pending',
    createdAt: '2025-03-03T18:00:00Z',
    updatedAt: '2025-03-03T18:00:00Z'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_alex_maya',
    swapRequestId: 'req_1',
    participants: ['user_alex', 'user_maya'],
    partner: {
      id: 'user_maya',
      name: 'Maya Lin',
      avatar: '/src/assets/images/avatar_mentor_female_1794059251546.jpg',
      title: 'Lead Product & UI/UX Designer',
      location: 'Brooklyn, NY',
      skillsBeingExchanged: {
        partnerTeaches: 'UI/UX Designing & Figma Systems',
        userTeaches: 'React.js & Next.js Architecture'
      }
    },
    lastMessage: {
      content: 'Here is our Google Meet session link for tomorrow at 6 PM EST!',
      senderId: 'user_maya',
      createdAt: '2025-03-02T19:45:00Z'
    },
    unreadCount: 1,
    updatedAt: '2025-03-02T19:45:00Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_alex_maya',
    senderId: 'user_alex',
    senderName: 'Alex Rivera',
    senderAvatar: '/src/assets/images/avatar_developer_male_1794059250716.jpg',
    content: 'Hi Maya! So excited our skill swap was accepted. Looking forward to learning Figma auto-layout and token systems from you!',
    meeting: null,
    createdAt: '2025-03-01T12:00:00Z',
    read: true
  },
  {
    id: 'msg_2',
    conversationId: 'conv_alex_maya',
    senderId: 'user_maya',
    senderName: 'Maya Lin',
    senderAvatar: '/src/assets/images/avatar_mentor_female_1794059251546.jpg',
    content: 'Awesome to connect, Alex! I prepared a starter Figma file for us with real design tokens. Can we hop on a quick video call to align on our syllabus?',
    meeting: null,
    createdAt: '2025-03-01T12:15:00Z',
    read: true
  },
  {
    id: 'msg_3',
    conversationId: 'conv_alex_maya',
    senderId: 'user_alex',
    senderName: 'Alex Rivera',
    senderAvatar: '/src/assets/images/avatar_developer_male_1794059250716.jpg',
    content: 'Sounds great! Does tomorrow at 6 PM EST work for you? I can set up a Google Meet or Zoom room.',
    meeting: null,
    createdAt: '2025-03-02T14:20:00Z',
    read: true
  },
  {
    id: 'msg_4',
    conversationId: 'conv_alex_maya',
    senderId: 'user_maya',
    senderName: 'Maya Lin',
    senderAvatar: '/src/assets/images/avatar_mentor_female_1794059251546.jpg',
    content: 'Tomorrow at 6 PM EST is perfect! Here is our Google Meet session link. See you then!',
    meeting: {
      provider: 'Google Meet',
      url: 'https://meet.google.com/abc-defg-hij',
      title: 'SkillSwap: Figma Design Systems & React Architecture'
    },
    createdAt: '2025-03-02T19:45:00Z',
    read: false
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'user_alex',
    title: 'Swap Request Accepted!',
    message: 'Maya Lin accepted your skill swap request for UI/UX Designing & React.js.',
    type: 'swap_accepted',
    link: '/requests',
    read: false,
    createdAt: '2025-03-01T11:30:00Z'
  },
  {
    id: 'notif_2',
    userId: 'user_alex',
    title: 'New Skill Swap Request',
    message: 'Dr. Elena Zhang offered to teach Artificial Intelligence & LLMs in exchange for Python & FastAPI.',
    type: 'swap_request',
    link: '/requests',
    read: false,
    createdAt: '2025-03-04T15:20:00Z'
  },
  {
    id: 'notif_3',
    userId: 'user_alex',
    title: 'New Chat Message',
    message: 'Maya Lin sent a Google Meet meeting link for your upcoming session.',
    type: 'message',
    link: '/messages',
    read: true,
    createdAt: '2025-03-02T19:45:00Z'
  }
];

export const INITIAL_EXCHANGES: ExchangeRecord[] = [
  {
    id: 'exch_1',
    swapRequestId: 'req_1',
    partnerId: 'user_maya',
    partnerName: 'Maya Lin',
    partnerAvatar: '/src/assets/images/avatar_mentor_female_1794059251546.jpg',
    skillReceived: 'UI/UX Designing & Figma Systems',
    skillTaught: 'React.js & Next.js Architecture',
    startDate: '2025-03-01',
    status: 'Active'
  },
  {
    id: 'exch_2',
    swapRequestId: 'req_old_1',
    partnerId: 'user_liam',
    partnerName: 'Liam O’Connor',
    partnerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face',
    skillReceived: 'Video Editing & Motion Graphics',
    skillTaught: 'Web Development Basics',
    startDate: '2025-01-20',
    completionDate: '2025-02-18',
    status: 'Completed',
    rating: 5,
    review: 'Alex was an incredible mentor! Patient, structured, and explained complex concepts clearly. Highly recommend swapping skills with him!'
  }
];
