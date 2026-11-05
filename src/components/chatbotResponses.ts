export type ChatAction = { label: string; question: string };
export type BotResponse = {
  text: string;
  link?: { label: string; path: string };
  suggestions?: ChatAction[];
  unanswered?: boolean;
  rephrase?: string;
};

export const pageSuggestions: Record<string, ChatAction[]> = {
  "/dashboard": [
    { label: "How does SkillSync work?", question: "How does SkillSync work?" },
    { label: "Find teammates", question: "How can I find teammates?" },
    { label: "Complete my profile", question: "How do I update my profile?" },
  ],
  "/teammates": [
    { label: "Search for students", question: "How do I find students?" },
    { label: "Compare skills", question: "How do I compare teammate skills?" },
    { label: "Send an invitation", question: "How do I send invitations?" },
  ],
  "/invitations": [
    { label: "Accept an invitation", question: "How do I accept an invitation?" },
    { label: "Reject an invitation", question: "How do I reject an invitation?" },
    { label: "Check pending invites", question: "How do I check pending invitations?" },
  ],
  "/my-team": [
    { label: "View team members", question: "How can I view my team members?" },
    { label: "Find another teammate", question: "How do I find teammates?" },
  ],
  "/profile": [
    { label: "Update my profile", question: "How do I update my profile?" },
    { label: "Set up my profile", question: "Guide me through profile setup" },
    { label: "Add my skills", question: "How do I add or update my skills?" },
  ],
  "/skills": [
    { label: "Add or update skills", question: "How do I add or update my skills?" },
    { label: "Find matching teammates", question: "How does skill matching work?" },
  ],
  "/projects": [
    { label: "Browse projects", question: "How do I explore projects?" },
    { label: "Find teammates", question: "How do I find teammates for a project?" },
  ],
  "/": [
    { label: "How does SkillSync work?", question: "How does SkillSync work?" },
    { label: "Get started", question: "How do I get started?" },
  ],
};

const routes = [
  { label: "Dashboard", path: "/dashboard", terms: ["dashboard", "home"] },
  { label: "Find Teammates", path: "/teammates", terms: ["teammate", "find student", "search student", "match"] },
  { label: "Invitations", path: "/invitations", terms: ["invitation", "invite", "request"] },
  { label: "My Team", path: "/my-team", terms: ["my team", "team members"] },
  { label: "Profile", path: "/profile", terms: ["profile", "bio", "college", "availability"] },
  { label: "Skills Setup", path: "/skills", terms: ["skill", "skills"] },
  { label: "Projects", path: "/projects", terms: ["project", "hackathon"] },
];

export function normalizeQuestion(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, " ").replace(/\b(?:teh|hte)\b/g, "the").replace(/\bteammtes?\b/g, "teammates").replace(/\binvitatons?\b/g, "invitations").replace(/\s+/g, " ").trim();
}

const relatedQuestions = {
  teammates: [
    { label: "How does skill matching work?", question: "How does skill matching work?" },
    { label: "Can I filter students by skills?", question: "Can I filter students by skills?" },
    { label: "How do I invite someone to my team?", question: "How do I invite someone to my team?" },
  ],
  invitations: [
    { label: "How can I send an invitation?", question: "How can I send an invitation?" },
    { label: "Where can I see received invitations?", question: "Where can I see received invitations?" },
    { label: "How do I accept an invitation?", question: "How do I accept an invitation?" },
  ],
  profile: [
    { label: "How can I update my skills?", question: "How can I update my skills?" },
    { label: "How do I edit my academic details?", question: "How do I edit my academic details?" },
    { label: "Why should I complete my profile?", question: "Why should I complete my profile?" },
  ],
  team: [
    { label: "How do I find teammates?", question: "How do I find teammates?" },
    { label: "Where can I check invitations?", question: "Where can I check invitations?" },
    { label: "How do I view my team?", question: "How do I view my team?" },
  ],
  projects: [
    { label: "How do I find project partners?", question: "How do I find project partners?" },
    { label: "How does skill matching work?", question: "How does skill matching work?" },
    { label: "How do I create a team?", question: "How do I create a team?" },
  ],
};

export function getRelatedQuestions(input: string): ChatAction[] {
  const query = normalizeQuestion(input);
  let related = relatedQuestions.teammates;
  if (/invitation|invite|request/.test(query)) related = relatedQuestions.invitations;
  else if (/profile|academic|bio|college|course|year|personal information|my information/.test(query)) related = relatedQuestions.profile;
  else if (/create|join|group|my team|team members/.test(query)) related = relatedQuestions.team;
  else if (/project|hackathon/.test(query)) related = relatedQuestions.projects;
  return related.filter((item) => normalizeQuestion(item.question) !== query).slice(0, 3);
}

export function getBotResponse(input: string): BotResponse {
  const query = normalizeQuestion(input);

  if (/^profile-guide:\d+$/.test(query)) {
    const step = Number(query.split(":")[1]);
    const steps: BotResponse[] = [
      { text: "Add your personal information and the profile details you want teammates to see.", suggestions: [{ label: "Next: college details", question: "profile-guide:2" }, { label: "Open Profile", question: "navigate:/profile" }] },
      { text: "Add your college, course, and current year so students can find teammates with a similar academic background.", suggestions: [{ label: "Next: bio and availability", question: "profile-guide:3" }, { label: "Open Profile", question: "navigate:/profile" }] },
      { text: "Write a short bio and set your availability for projects and hackathons.", suggestions: [{ label: "Next: add skills", question: "profile-guide:4" }, { label: "Open Profile", question: "navigate:/profile" }] },
      { text: "Great! Add your skills and proficiency levels to finish setting up your profile.", link: { label: "Open Skills Setup", path: "/skills" } },
    ];
    return steps[step - 1] ?? steps[0];
  }
  if (/^team-guide:\d+$/.test(query)) {
    const step = Number(query.split(":")[1]);
    const steps: BotResponse[] = [
      { text: "Search students by name, college, or skill to narrow down your options.", suggestions: [{ label: "Next: compare skills", question: "team-guide:2" }, { label: "Open Find Teammates", question: "navigate:/teammates" }] },
      { text: "Open student profiles and compare their skills, interests, and availability with your project needs.", suggestions: [{ label: "Next: invite someone", question: "team-guide:3" }, { label: "Open Find Teammates", question: "navigate:/teammates" }] },
      { text: "On a student profile, choose the invitation action to send a request. You can track replies on Invitations.", link: { label: "Open Find Teammates", path: "/teammates" }, suggestions: [{ label: "Check invitations", question: "navigate:/invitations" }] },
    ];
    return steps[step - 1] ?? steps[0];
  }
  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(query)) {
    return { text: "Hi! I am the SkillSync Help Assistant. I can walk you through profiles, skills, teammates, invitations, and projects. What would you like to do?" };
  }
  if (/(guide|walk me through).*(profile|setup)|profile setup/.test(query)) {
    return { text: "Let us get your profile ready. First, have you completed your basic profile details?", suggestions: [{ label: "Yes, continue to skills", question: "profile-guide:4" }, { label: "Not yet, guide me", question: "profile-guide:1" }] };
  }
  if (/(guide|step by step).*(find|teammate)|find teammates/.test(query) && query.includes("guide")) {
    return { text: "Let us find the right teammates. Start by opening Find Teammates.", suggestions: [{ label: "Next: search students", question: "team-guide:1" }, { label: "Open Find Teammates", question: "navigate:/teammates" }] };
  }
  if (/match|matching|score|complement/.test(query)) {
    return { text: "SkillSync compares student skills to help you spot complementary strengths for a project. Open Find Teammates to review student profiles and match information.", link: { label: "View teammate matches", path: "/teammates" }, suggestions: getRelatedQuestions("How does skill matching work?") };
  }
  if (/how does skillsync work|what can .*do|features|what is skillsync|about skillsync/.test(query)) {
    return { text: "SkillSync helps college students form project and hackathon teams by discovering people with complementary skills, interests, and availability. You can also explore projects, manage invitations, and build your student profile here.", link: { label: "Open Dashboard", path: "/dashboard" }, suggestions: [{ label: "Find teammates", question: "How can I find teammates?" }, { label: "Explore projects", question: "How do I explore projects?" }] };
  }
  if (/invitation|invite|requests?/.test(query)) {
    return { text: "Open Invitations to review requests you have received. From there you can accept or reject a pending invitation. To invite someone, open their student profile and choose the invite action.", link: { label: "Open Invitations", path: "/invitations" }, suggestions: getRelatedQuestions("invitation") };
  }
  if (/(find|search|filter|looking for|need|want|people for).*(teammate|partner|developer|student|people|hackathon|project)|\b(teammate|teammates|partners|developers)\b|\bpeople for (my )?hackathon\b/.test(query)) {
    return { text: "Open Find Teammates and search by name, college, or skill. Review student profiles to compare skills and availability, then send an invitation to someone who fits your project.", link: { label: "Open Find Teammates", path: "/teammates" }, suggestions: getRelatedQuestions("find teammates") };
  }
  if (/team members|my team|view my team/.test(query)) {
    return { text: "Open My Team to see your current team and its members. If you have not joined a team yet, find students and send invitations.", link: { label: "Open My Team", path: "/my-team" }, suggestions: getRelatedQuestions("my team") };
  }
  if (/(create|join|form|manage).*(team|group)|(team|group).*(create|join|manage)/.test(query)) {
    const path = /join|group/.test(query) && !/create/.test(query) ? "/my-team" : "/teammates";
    const label = path === "/my-team" ? "Open My Team" : "Find Teammates";
    return { text: "To build a team, find students who fit your project, send invitations from their profiles, and review replies on Invitations. Accepted invitations are reflected in your team workflow.", link: { label, path }, suggestions: getRelatedQuestions("create a team") };
  }
  if (/profile|bio|college|availability|academic|course|year|my information|personal details|complete my profile/.test(query)) {
    return { text: "Open Profile to update your personal and academic information, including college, course, year, bio, and availability. Then add your skills on Skills Setup. A complete profile helps teammates understand your background and availability.", link: { label: "Open Profile", path: "/profile" }, suggestions: getRelatedQuestions("profile") };
  }
  if (/skill|abilities|ability/.test(query)) {
    return { text: "Open Skills Setup to add or update your skills and proficiency levels. Current skills help teammates understand what you can contribute and improve matching.", link: { label: "Open Skills Setup", path: "/skills" }, suggestions: getRelatedQuestions("skills") };
  }
  if (/project|hackathon/.test(query)) {
    return { text: "Open Projects to browse opportunities, then select a project to see its details and required skills.", link: { label: "Explore Projects", path: "/projects" }, suggestions: getRelatedQuestions("projects") };
  }
  const route = routes.find(({ terms }) => terms.some((term) => query.includes(term)));
  if (route) return { text: `You can open ${route.label} to continue.`, link: { label: `Open ${route.label}`, path: route.path } };
  return {
    text: "I'm still learning! I can help you with several things. What would you like to do?",
    rephrase: "Could you explain that in another way? Are you trying to find teammates, manage your team, check invitations, or update your profile?",
    unanswered: true,
    suggestions: [
      { label: "Find teammates for my project", question: "Find teammates for my project" },
      { label: "Learn how to create a team", question: "Learn how to create a team" },
      { label: "Check my invitations", question: "Check my invitations" },
      { label: "Set up my student profile", question: "Set up my student profile" },
      { label: "Explore SkillSync features", question: "Explore SkillSync features" },
    ],
  };
}
export function redactSensitiveText(value: string): string {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email removed]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[phone removed]")
    .replace(/\b(?:bearer\s+)?(?:sk|pk|sbp|sb_secret)[_-][A-Za-z0-9_-]{12,}\b/gi, "[token removed]")
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, "[token removed]")
    .replace(/\b(?:api[_ -]?key|access[_ -]?token|refresh[_ -]?token|token|secret|authorization)\s*[:=]\s*\S+/gi, "[token removed]")
    .replace(/\b(?:password|passwd|passcode)\s*[:=]?\s*\S+/gi, "[credential removed]")
    .slice(0, 1000);
}
