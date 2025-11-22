
import { DailyChallenge, Badge, CommunityPost, User, Category, Comment } from '../types';

const BADGES: Badge[] = [
  { id: 'novice', name: 'Novice Observer', description: 'Completed your first challenge', icon: '🌱', color: 'text-green-400' },
  { id: 'seeker', name: 'Truth Seeker', description: '3 day streak', icon: '🔭', color: 'text-blue-400' },
  { id: 'philosopher', name: 'Philosopher', description: '7 day streak', icon: '📜', color: 'text-purple-400' },
  { id: 'enlightened', name: 'Enlightened', description: '30 day streak', icon: '🌟', color: 'text-yellow-400' },
];

const THEMES = [
  { theme: "Texture", prompt: "Find something with an interesting texture and describe how it feels." },
  { theme: "Sound", prompt: "Listen for a distant sound you usually ignore." },
  { theme: "Color Blue", prompt: "Find the most vibrant blue object in your vicinity." },
  { theme: "Shadow", prompt: "Observe a shadow cast by a mundane object." },
  { theme: "Motion", prompt: "Watch something moving (traffic, leaves, water) for 10 seconds." },
  { theme: "Scent", prompt: "Identify a subtle smell in the air right now." },
  { theme: "Light", prompt: "Notice how light reflects off a surface nearby." },
];

export const getDailyChallenge = (): DailyChallenge => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Deterministic selection based on date
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const themeIndex = dayOfYear % THEMES.length;
  
  return {
    id: `challenge-${dateStr}`,
    date: dateStr,
    theme: THEMES[themeIndex].theme,
    prompt: THEMES[themeIndex].prompt
  };
};

export const checkStreak = (user: User): User => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let newStreak = user.streak;
  const newBadges = [...(user.badges || [])];

  // If already done today, do nothing
  if (user.lastChallengeDate === today) {
    return user;
  }

  // If done yesterday, increment. Else reset to 1.
  if (user.lastChallengeDate === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  // Check for new badges
  if (newStreak >= 1 && !newBadges.includes('novice')) newBadges.push('novice');
  if (newStreak >= 3 && !newBadges.includes('seeker')) newBadges.push('seeker');
  if (newStreak >= 7 && !newBadges.includes('philosopher')) newBadges.push('philosopher');
  if (newStreak >= 30 && !newBadges.includes('enlightened')) newBadges.push('enlightened');

  return {
    ...user,
    streak: newStreak,
    lastChallengeDate: today,
    badges: newBadges
  };
};

export const getBadges = (userIds: string[]): Badge[] => {
  return BADGES.filter(b => userIds.includes(b.id));
};

export const getAllBadges = (): Badge[] => BADGES;

// Helper to get random items
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Shuffle array to ensure uniqueness when slicing
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Mock Community Data Generator
export const getCommunityFeed = (limit: number = 10): CommunityPost[] => {
  const names = ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George", "Hannah", "Iris", "Jack", "Kara", "Leo"];
  
  const templates = [
    {
      input: "The crack in the sidewalk",
      title: "Geological Scars",
      concept: "Plate Tectonics",
      explanation: "Just as the earth's crust shifts and breaks under pressure, this concrete mimics the grand geological scars of our planet.",
      category: 'Urban'
    },
    {
      input: "My coffee cooling down",
      title: "Universal Entropy",
      concept: "Thermodynamics",
      explanation: "The heat leaving your cup is part of the universe's inexorable march towards equilibrium, a tiny echo of the heat death of the cosmos.",
      category: 'Objects'
    },
    {
      input: "A stranger smiling",
      title: "Biological Resonance",
      concept: "Mirror Neurons",
      explanation: "A fleeting muscle contraction in one face triggers a mirror response in yours, a wireless emotional connection hardwired by evolution.",
      category: 'People'
    },
    {
      input: "Leaves changing color",
      title: "Chemical Twilight",
      concept: "Chlorophyll Breakdown",
      explanation: "The tree withdraws its life force, revealing the hidden pigments that were there all along, much like how adversity reveals character.",
      category: 'Nature'
    },
    {
      input: "Feeling anxious about tomorrow",
      title: "Quantum Uncertainty",
      concept: "Heisenberg Principle",
      explanation: "The future exists in a superposition of states. Your anxiety is the observer trying to collapse the wave function before it happens.",
      category: 'Feelings'
    },
    {
      input: "Staring at the night sky",
      title: "Temporal Archaeology",
      concept: "Speed of Light",
      explanation: "You aren't looking at the sky as it is, but as it was. Every glance upward is a journey back in time to the birth of photons.",
      category: 'Nature'
    },
    {
      input: "A spider spinning a web",
      title: "Architectural Instinct",
      concept: "Fibonacci Sequence",
      explanation: "Without a blueprint, the spider weaves perfect geometry. It is nature manifesting mathematics through biological imperative.",
      category: 'Nature'
    },
    {
      input: "Hearing an echo",
      title: "Acoustic Reflection",
      concept: "Wave Particle Duality",
      explanation: "Your voice traveled, touched a surface, and returned. For a moment, sound became a tangible object bouncing off a wall.",
      category: 'Objects'
    },
    {
      input: "Dust motes in a sunbeam",
      title: "Brownian Motion",
      concept: "Particle Physics",
      explanation: "The chaotic dance of dust reveals the invisible bombardment of air molecules, a microscopic storm happening right in your living room.",
      category: 'Objects'
    },
    {
      input: "Deja vu",
      title: "Memory glitch",
      concept: "Neural Pathways",
      explanation: "A mismatch in your brain's timing circuits creates the illusion of repetition, a hiccup in your perception of linear time.",
      category: 'Memories'
    },
    {
      input: "Rust on a gate",
      title: "Slow Combustion",
      concept: "Oxidation",
      explanation: "Rust is simply fire burning in very slow motion. The metal is returning to its natural ore state, surrendering to oxygen.",
      category: 'Urban'
    },
    {
      input: "Waking up from a dream",
      title: "Reality Integration",
      concept: "Consciousness",
      explanation: "That moment of confusion is your brain rebooting its operating system, loading the 'Self' program back into active memory.",
      category: 'Dreams'
    },
    {
      input: "Traffic jam",
      title: "Fluid Dynamics",
      concept: "Flow State",
      explanation: "Cars behave like particles in a fluid. A single brake light can cause a shockwave that ripples backward for miles.",
      category: 'Urban'
    },
    {
      input: "Old photo found in a book",
      title: "Frozen Photons",
      concept: "Preservation",
      explanation: "Light that bounced off a face decades ago was trapped chemically on paper, waiting for your eyes to release it again.",
      category: 'Memories'
    },
    {
      input: "Static shock",
      title: "Electron Transfer",
      concept: "Electric Potential",
      explanation: "You became a capacitor, storing charge until the universe demanded balance. A miniature lightning bolt leaped from your finger.",
      category: 'Feelings'
    },
    {
      input: "Watching a clock tick",
      title: "Arbitrary Segments",
      concept: "Time Perception",
      explanation: "We chop eternity into digestible seconds to feel control over the unstoppable river of time.",
      category: 'Objects'
    },
    {
      input: "A flower blooming",
      title: "Silent Explosion",
      concept: "Growth Kinetics",
      explanation: "A slow-motion explosion of biological energy, unfolding according to a genetic script written eons ago.",
      category: 'Nature'
    },
    {
      input: "Forgetting a name",
      title: "Data Retrieval Failure",
      concept: "Cognitive Psychology",
      explanation: "The file exists in your neural network, but the index card to find it has momentarily slipped behind a desk in your mind.",
      category: 'Memories'
    }
  ];

  // Shuffle templates to ensure unique content for the requested limit
  const shuffledTemplates = shuffleArray(templates);

  return Array.from({ length: limit }).map((_, i) => {
    // Cycle through shuffled templates if limit > templates.length (though unlikely with high limit)
    const template = shuffledTemplates[i % shuffledTemplates.length];
    const name = getRandom(names);
    
    // Mock Comments
    const comments: Comment[] = [];
    if (Math.random() > 0.5) {
        comments.push({
            id: `cmt-${i}-1`,
            authorName: getRandom(names),
            authorAvatar: `https://ui-avatars.com/api/?name=${getRandom(names)}&background=random`,
            text: "This changed how I see the world!",
            timestamp: new Date(Date.now() - Math.random() * 10000000).toISOString()
        });
    }

    return {
      id: `post-${i}-${Date.now()}`, // Ensure truly unique ID with timestamp
      author: {
        name: name,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
      },
      originalInput: template.input,
      epiphany: {
        title: template.title,
        concept: template.concept,
        explanation: template.explanation,
        fact: "Did you know?",
        visualPrompt: ""
      },
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      likes: Math.floor(Math.random() * 50) + 1,
      isLiked: false,
      comments: comments,
      category: template.category as Category
    };
  });
};

export const getTrendingObservations = (): string[] => [
    "Morning Rain", "Subway Noise", "Empty Chair", "Birds Chirping", "Rust"
];

export const getPopularPosts = (): CommunityPost[] => {
    return getCommunityFeed(3).map(p => ({...p, likes: p.likes + 100}));
};
