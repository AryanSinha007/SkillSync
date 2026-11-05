export type ChatAction = { label: string; question: string };
export type BotResponse = {
  text: string;
  link?: { label: string; path: string };
  suggestions?: ChatAction[];
  unanswered?: boolean;
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

export function getBotResponse(input: string): BotResponse {
  const query = normalizeQuestion(input);
  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(query)) {
    return { text: "Hi! I’m the SkillSync Help Assistant. I can walk you through profiles, skills, teammates, invitations, and projects. What would you like to do?" };
  }
  if (/(guide|walk me through).*(profile|setup)|profile setup/.test(query)) {
    return { text: "Let’s get your profile ready. First, have you completed your basic profile details?", suggestions: [{ label: "Yes, continue to skills", question: "profile-guide:4" }, { label: "Not yet, guide me", question: "profile-guide:1" }] };
  }
  if (query.startsWith("profile-guide:")) {
    const step = Number(query.split(":")[1]);
    const steps = [
      { text: "Add your personal information, including the name and contact details you want to use on SkillSync.", suggestions: [{ label: "Next: college details", question: "profile-guide:2" }, { label: "Open Profile", question: "navigate:/profile" }] },
      { text: "Add your college, course, and current year so students can find teammates from a similar academic background.", suggestions: [{ label: "Next: bio and availability", question: "profile-guide:3" }, { label: "Open Profile", question: "navigate:/profile" }] },
      { text: "Write a short bio and set your availability for projects and hackathons.", suggestions: [{ label: "Next: add skills", question: "profile-guide:4" }, { label: "Open Profile", question: "navigate:/profile" }] },
      { text: "Great! Add your skills and proficiency levels to finish setting up your profile.", link: { label: "Open Skills Setup", path: "/skills" } },
    ];
    return steps[step - 1] ?? steps[0];
  }
  if (/(guide|step by step).*(find|teammate)|find teammates/.test(query) && query.includes("guide")) {
    return { text: "Let’s find the right teammates. Start by opening Find Teammates.", suggestions: [{ label: "Next: search students", question: "team-guide:1" }, { label: "Open Find Teammates", question: "navigate:/teammates" }] };
  }
  if (query.startsWith("team-guide:")) {
    const step = Number(query.split(":")[1]);
    const steps = [
      { text: "Search students by name, college, or skill to narrow down your options.", suggestions: [{ label: "Next: compare skills", question: "team-guide:2" }, { label: "Open Find Teammates", question: "navigate:/teammates" }] },
      { text: "Open student profiles and compare their skills, interests, and availability with your project needs.", suggestions: [{ label: "Next: invite someone", question: "team-guide:3" }, { label: "Open Find Teammates", question: "navigate:/teammates" }] },
      { text: "On a student’s profile, choose the invitation action to send a request. You can track replies on Invitations.", link: { label: "Open Find Teammates", path: "/teammates" }, suggestions: [{ label: "Check invitations", question: "navigate:/invitations" }] },
    ];
    return steps[step - 1] ?? steps[0];
  }
  if (/skillsync|how does .*work|what is skillsync/.test(query)) return { text: "SkillSync helps college students form project and hackathon teams by discovering people with complementary skills, interests, and availability.", link: { label: "Open Dashboard", path: "/dashboard" } };
  if (/match|matching|score|complement/.test(query)) return { text: "SkillSync compares student skills to help you spot complementary strengths for a project. Open Find Teammates to review student profiles and match information.", link: { label: "View teammate matches", path: "/teammates" } };
  if (/accept|reject|pending|received/.test(query) && /(invitation|invite)/.test(query) || /invitation|invite/.test(query)) {
    return { text: "You can review received invitations on the Invitations page. Open a pending request there to accept or reject it. Invitations you send are also part of the existing invitation workflow.", link: { label: "Open Invitations", path: "/invitations" }, suggestions: [{ label: "Find teammates", question: "How do I find teammates?" }, { label: "View my team", question: "How can I view my team members?" }] };
  }
  if (/(find|search).*(teammate|student)|teammate/.test(query)) return { text: "Open Find Teammates, search by name, college, or skill, then review profiles and compare skills and availability. From a student profile, you can send an invitation.", link: { label: "Open Find Teammates", path: "/teammates" }, suggestions: [{ label: "Step-by-step guide", question: "Guide me step by step to find teammates" }, { label: "Check invitations", question: "How do I check pending invitations?" }] };
  if (/team members|my team/.test(query)) return { text: "Open My Team to see your current team and its members. If you have not joined a team yet, find students and send invitations.", link: { label: "Open My Team", path: "/my-team" } };
  if (/create|join|form/.test(query) && /team/.test(query)) return { text: "Find students who fit your project, send invitations from their profiles, and review their replies on Invitations. Accepted invitations appear in your team workflow.", link: { label: "Find Teammates", path: "/teammates" }, suggestions: [{ label: "Check invitations", question: "How do I check pending invitations?" }, { label: "View my team", question: "How can I view my team members?" }] };
  if (/profile|bio|college|availability/.test(query)) return { text: "Open Profile to update your personal information, college, course, year, bio, and availability. Then add your skills on Skills Setup.", link: { label: "Open Profile", path: "/profile" }, suggestions: [{ label: "Set up profile step by step", question: "Guide me through profile setup" }, { label: "Open Skills Setup", question: "navigate:/skills" }] };
  if (/skill/.test(query)) return { text: "Open Skills Setup to add or update skills and proficiency levels. Keeping your skills current helps teammates understand what you can contribute.", link: { label: "Open Skills Setup", path: "/skills" } };
  if (/project|hackathon/.test(query)) return { text: "Open Projects to browse opportunities, then select a project to see its details and required skills.", link: { label: "Explore Projects", path: "/projects" } };
  const route = routes.find(({ terms }) => terms.some((term) => query.includes(term)));
  if (route) return { text: `You can open ${route.label} to continue.`, link: { label: `Open ${route.label}`, path: route.path } };
  return { text: "I’m not sure I understood. I can help with profiles, skills, teammates, invitations, teams, and projects. Try one of these topics:", unanswered: true, suggestions: [{ label: "Find teammates", question: "How do I find teammates?" }, { label: "Invitations", question: "How do I accept an invitation?" }, { label: "Profile help", question: "How do I update my profile?" }] };
}

export function redactSensitiveText(value: string): string {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email removed]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[phone removed]")
    .replace(/\b(?:password|passwd|passcode)\s*[:=]?\s*\S+/gi, "[credential removed]")
    .slice(0, 1000);
}
