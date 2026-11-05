import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SkillSyncChatbot.css";

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

type QuickAction = {
  label: string;
  question: string;
};

const quickActions: QuickAction[] = [
  { label: "Find teammates", question: "How do I find teammates?" },
  { label: "Create a team", question: "How do I create or join a team?" },
  { label: "Invitations", question: "How do invitations work?" },
  { label: "My profile", question: "How can I update my profile and skills?" },
];

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", keywords: ["dashboard", "home"] },
  { label: "Find Teammates", path: "/teammates", keywords: ["teammate", "find teammate", "search student", "match"] },
  { label: "Invitations", path: "/invitations", keywords: ["invitation", "invite", "request"] },
  { label: "My Team", path: "/my-team", keywords: ["my team", "team members", "joined team"] },
  { label: "Projects", path: "/projects", keywords: ["project", "hackathon"] },
  { label: "Profile", path: "/profile", keywords: ["profile", "edit profile", "personal details"] },
  { label: "Skills Setup", path: "/skills", keywords: ["skill", "skills", "add skill"] },
];

function getBotResponse(input: string): { text: string; link?: { label: string; path: string } } {
  const query = input.toLowerCase().replace(/[^\w\s]/g, " ");

  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(query)) {
    return {
      text: "Hey there! 👋 I'm the SkillSync Help Assistant. I can guide you through finding teammates, managing invitations, projects, profiles, and teams. What would you like help with?",
    };
  }

  if (query.includes("what is skillsync") || query.includes("about skillsync") || query.includes("purpose")) {
    return {
      text: "SkillSync is a skill-based team formation platform for college projects and hackathons. It helps students discover potential teammates based on their skills, interests, experience, and availability.",
    };
  }

  if (query.includes("find") && (query.includes("teammate") || query.includes("team member") || query.includes("student"))) {
    return {
      text: "To find teammates, open Find Teammates from your dashboard. You can search by name, college, or skill, explore student profiles, compare skill-match scores, and send an invitation to a student.",
      link: { label: "Open Find Teammates", path: "/teammates" },
    };
  }

  if (query.includes("match") || query.includes("matching") || query.includes("score")) {
    return {
      text: "SkillSync displays a skill-match percentage on student cards. It helps you identify students whose skills may complement yours. Open Find Teammates to explore the available matches.",
      link: { label: "View teammate matches", path: "/teammates" },
    };
  }

  if (query.includes("invitation") || query.includes("invite") || query.includes("request")) {
    return {
      text: "When you send an invitation to a student, they can review it in their Invitations section. You can also open your Invitations page to see pending requests you have received and accept or reject them.",
      link: { label: "Open Invitations", path: "/invitations" },
    };
  }

  if (query.includes("create a team") || query.includes("join a team") || query.includes("team formation") || query.includes("my team") || query.includes("team member")) {
    return {
      text: "You can form a team through the invitation workflow. Find suitable students, send invitations, and ask them to accept. Once you are part of a team, visit My Team to view its members and details.",
      link: { label: "Go to My Team", path: "/my-team" },
    };
  }

  if (query.includes("profile") || query.includes("bio") || query.includes("college") || query.includes("availability")) {
    return {
      text: "Your profile contains your student information, college, course, year, bio, and availability. Open Profile to review or update your details.",
      link: { label: "Open Profile", path: "/profile" },
    };
  }

  if (query.includes("skill")) {
    return {
      text: "Add the skills you know in Skills Setup and choose the appropriate proficiency level. Keeping your skills updated helps other students understand what you can contribute to a project.",
      link: { label: "Open Skills Setup", path: "/skills" },
    };
  }

  if (query.includes("project") || query.includes("hackathon")) {
    return {
      text: "Visit the Projects page to explore available college projects and hackathons. Open a project to view its details and required skills.",
      link: { label: "Explore Projects", path: "/projects" },
    };
  }

  if (query.includes("login") || query.includes("sign in") || query.includes("signup") || query.includes("register") || query.includes("account")) {
    return {
      text: "If you are new to SkillSync, choose Sign Up and create your account. If you already have an account, use Log In. After authentication, you can access your dashboard and student features.",
      link: { label: "Go to Dashboard", path: "/dashboard" },
    };
  }

  if (query.includes("help") || query.includes("what can you do") || query.includes("faq")) {
    return {
      text: "I can help with: finding teammates, understanding skill-match scores, sending or responding to invitations, viewing your team, exploring projects, and updating your profile or skills. Select one of the suggested questions below.",
    };
  }

  const destination = navigationItems.find((item) =>
    item.keywords.some((keyword) => query.includes(keyword)),
  );

  if (destination) {
    return {
      text: `You can find that section on the ${destination.label} page. Use the button below to open it.`,
      link: { label: `Open ${destination.label}`, path: destination.path },
    };
  }

  return {
    text: "I'm not sure I understood that. Try asking about finding teammates, skill matching, invitations, your team, projects, profile, or skills. You can also choose one of the suggested questions.",
  };
}

function SkillSyncChatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hi! Welcome to SkillSync 👋 I'm your Help Assistant. Ask me anything about using SkillSync, or choose a question below.",
    },
  ]);

  const showQuickActions = useMemo(
    () => messages.length <= 2,
    [messages.length],
  );

  function sendMessage(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const response = getBotResponse(trimmed);
    const nextId = Date.now();

    setMessages((current) => [
      ...current,
      { id: nextId, sender: "user", text: trimmed },
      { id: nextId + 1, sender: "bot", text: response.text },
    ]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  function handleQuickAction(question: string) {
    const trimmed = question.trim();
    const response = getBotResponse(trimmed);
    const id = Date.now();
    setMessages((current) => [
      ...current,
      { id, sender: "user", text: trimmed },
      { id: id + 1, sender: "bot", text: response.text },
    ]);
  }

  const lastBotLink = useMemo(() => {
    const lastUserMessage = [...messages].reverse().find((message) => message.sender === "user");
    return lastUserMessage ? getBotResponse(lastUserMessage.text).link : undefined;
  }, [messages]);

  return (
    <div className="skillsync-chatbot">
      {isOpen && (
        <section className="chatbot-panel" aria-label="SkillSync help chat">
          <header className="chatbot-header">
            <div className="chatbot-brand">
              <div className="chatbot-avatar">S</div>
              <div>
                <strong>SkillSync Assistant</strong>
                <span><i /> Online · Help & guidance</span>
              </div>
            </div>
            <button
              type="button"
              className="chatbot-close"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="chatbot-context">
            <span>Currently viewing</span>
            <strong>{location.pathname === "/" ? "Home" : location.pathname.replace("/", "").replace("-", " ")}</strong>
          </div>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((message) => (
              <div
                className={`chatbot-message ${message.sender === "user" ? "user-message" : "bot-message"}`}
                key={message.id}
              >
                {message.sender === "bot" && <span className="message-avatar">S</span>}
                <p>{message.text}</p>
              </div>
            ))}

            {showQuickActions && (
              <div className="chatbot-quick-actions">
                <span>POPULAR QUESTIONS</span>
                {quickActions.map((action) => (
                  <button
                    type="button"
                    key={action.label}
                    onClick={() => handleQuickAction(action.question)}
                  >
                    {action.label} <span>→</span>
                  </button>
                ))}
              </div>
            )}

            {lastBotLink && (
              <button
                type="button"
                className="chatbot-navigation-link"
                onClick={() => {
                  navigate(lastBotLink.path);
                  setIsOpen(false);
                }}
              >
                {lastBotLink.label} <span>↗</span>
              </button>
            )}
          </div>

          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about SkillSync..."
              aria-label="Type your message"
            />
            <button type="submit" disabled={!input.trim()} aria-label="Send message">
              ↑
            </button>
          </form>
          <div className="chatbot-footer">SkillSync Help Assistant · Rule-based support</div>
        </section>
      )}

      <button
        type="button"
        className={`chatbot-launcher ${isOpen ? "chatbot-launcher-open" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close SkillSync assistant" : "Open SkillSync assistant"}
      >
        {isOpen ? "×" : <><span className="launcher-spark">✦</span><span className="launcher-label">Help</span></>}
      </button>
    </div>
  );
}

export default SkillSyncChatbot;
