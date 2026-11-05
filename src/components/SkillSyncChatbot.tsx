import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getBotResponse, pageSuggestions, redactSensitiveText } from "./chatbotResponses";
import "./SkillSyncChatbot.css";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  suggestions?: { label: string; question: string }[];
  link?: { label: string; path: string };
  rating?: number;
  feedbackText?: string;
  unanswered?: boolean;
  unansweredQuery?: string;
};

function SkillSyncMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="skillsync-orb" x1="18" y1="7" x2="82" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D946EF" /><stop offset=".52" stopColor="#8B2CF5" /><stop offset="1" stopColor="#4213D8" />
        </linearGradient>
        <linearGradient id="skillsync-face" x1="34" y1="39" x2="69" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#302078" /><stop offset="1" stopColor="#180B58" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#skillsync-orb)" />
      <path d="M49 22V34" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <circle cx="49" cy="17" r="6" fill="white" />
      <path d="m69 26 3-7m7 14 6-5" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <rect x="13" y="45" width="7" height="18" rx="3.5" fill="white" />
      <rect x="80" y="45" width="7" height="18" rx="3.5" fill="white" />
      <path d="M31 36h38a14 14 0 0 1 14 14v6a14 14 0 0 1-14 14H51l-10 9 3-9h-1a14 14 0 0 1-14-14v-6a14 14 0 0 1 14-14Z" fill="white" />
      <rect x="36" y="43" width="29" height="20" rx="10" fill="url(#skillsync-face)" />
      <path d="M43 54a3.5 3.5 0 0 1 7 0m5 0a3.5 3.5 0 0 1 7 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

type Conversation = { id: string; title: string; updated_at: string };
const welcomeMessage = (): Message => ({
  id: crypto.randomUUID(), sender: "bot",
  text: "Welcome to SkillSync! I can guide you through teammates, invitations, profiles, skills, and projects. What would you like to do?",
});

function SkillSyncChatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<string | null>(null);
  const authUserRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const pagePath = location.pathname.startsWith("/projects/") ? "/projects"
    : location.pathname.startsWith("/student/") ? "/profile"
      : location.pathname;
  const pageTitle = pagePath === "/" ? "Home" : pagePath.slice(1).replaceAll("-", " ");

  useEffect(() => {
    if (isOpen) {
      setShowPanel(true);
      return;
    }
    const timer = window.setTimeout(() => setShowPanel(false), 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    let active = true;
    const applyUser = (nextUserId: string | null) => {
      if (authUserRef.current !== nextUserId) {
        authUserRef.current = nextUserId;
        conversationRef.current = null;
        setConversationId(null);
        setMessages([welcomeMessage()]);
        setHistory([]);
        setShowHistory(false);
        setFeedbackDraft({});
      }
      setUserId(nextUserId);
    };
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (active) applyUser(data.user?.id ?? null);
    };
    void loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user.id ?? null);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    conversationRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages((current) => current.length <= 1 ? [welcomeMessage()] : current);
  }, [pagePath]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    let active = true;
    const restoreLatest = async () => {
      setIsLoading(true);
      const { data: conversations, error } = await supabase.from("chatbot_conversations")
        .select("id,title,updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1);
      if (!active) return;
      if (error) {
        setChatError("Chat history is unavailable. Apply the chatbot SQL migration in Supabase to enable it.");
        setIsLoading(false);
        setMessages((current) => current.length ? current : [welcomeMessage()]);
        return;
      }
      const latest = conversations?.[0] as Conversation | undefined;
      if (latest && !conversationRef.current) {
        const { data, error: messageError } = await supabase.from("chatbot_messages")
          .select("id,sender,text,suggestions,unanswered").eq("conversation_id", latest.id).eq("user_id", userId)
          .order("created_at", { ascending: true });
        if (!active) return;
        if (messageError) setChatError("Could not load this conversation.");
        else {
          const restored = (data as Message[]).map((message, index, all) => ({
            ...message,
            unansweredQuery: message.unanswered && all[index - 1]?.sender === "user" ? all[index - 1].text : undefined,
          }));
          setConversationId(latest.id);
          conversationRef.current = latest.id;
          setMessages(restored.length ? restored : [welcomeMessage()]);
        }
      }
      setIsLoading(false);
    };
    void restoreLatest();
    return () => { active = false; };
  }, [isOpen, userId, pagePath]);

  async function ensureConversation(title: string): Promise<string | null> {
    if (!userId) return null;
    if (conversationRef.current) return conversationRef.current;
    const { data, error } = await supabase.from("chatbot_conversations")
      .insert({ user_id: userId, title: redactSensitiveText(title).slice(0, 120) || "New conversation" })
      .select("id").single();
    if (error || !data) {
      setChatError("Could not save chat history. Check that the chatbot SQL migration has been applied.");
      return null;
    }
    conversationRef.current = data.id;
    setConversationId(data.id);
    return data.id;
  }

  async function persistMessages(conversation: string | null, userMessage: Message, botMessage: Message, originalQuery: string, unanswered: boolean) {
    if (!userId) return;
    const id = conversation ?? await ensureConversation(originalQuery);
    if (!id) return;
    const rows = [userMessage, botMessage].map((message) => ({
      id: message.id, conversation_id: id, user_id: userId, sender: message.sender,
      text: redactSensitiveText(message.text), suggestions: message.suggestions ?? [], unanswered: Boolean(message.unanswered),
    }));
    const { error } = await supabase.from("chatbot_messages").insert(rows);
    if (error) setChatError("This message could not be saved to chat history.");
    else {
      setChatError("");
      await supabase.from("chatbot_conversations").update({ title: redactSensitiveText(originalQuery).slice(0, 120), updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
      if (unanswered) {
        await supabase.from("chatbot_unanswered_queries").insert({ user_id: userId, conversation_id: id, query: redactSensitiveText(originalQuery) });
      }
      const { data } = await supabase.from("chatbot_conversations").select("id,title,updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(20);
      if (data) setHistory(data as Conversation[]);
    }
  }

  async function submitQuestion(value: string) {
    const query = value.trim();
    if (!query || sendingRef.current) return;
    setInput("");
    if (query.startsWith("navigate:")) {
      navigate(query.slice("navigate:".length));
      return;
    }
    sendingRef.current = true;
    setIsSending(true);
    const guidedLabels: Record<string, string> = {
      "profile-guide:1": "Continue profile setup",
      "profile-guide:2": "Next: college details",
      "profile-guide:3": "Next: bio and availability",
      "profile-guide:4": "Next: add skills",
      "team-guide:1": "Next: search students",
      "team-guide:2": "Next: compare skills",
      "team-guide:3": "Next: invite someone",
    };
    const userMessage: Message = { id: crypto.randomUUID(), sender: "user", text: guidedLabels[query] ?? query };
    const response = getBotResponse(query);
    const botMessage: Message = {
      id: crypto.randomUUID(), sender: "bot", text: response.text,
      suggestions: response.suggestions, link: response.link, unanswered: response.unanswered,
      unansweredQuery: response.unanswered ? query : undefined,
    };
    const activeConversation = conversationRef.current;
    setMessages((current) => [...current, userMessage]);
    setIsTyping(true);
    await new Promise((resolve) => window.setTimeout(resolve, 420));
    setMessages((current) => [...current, botMessage]);
    setIsTyping(false);
    try {
      await persistMessages(activeConversation, userMessage, botMessage, query, Boolean(response.unanswered));
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(input);
  }

  async function openHistory() {
    if (!userId) { setChatError("Sign in to save and view chat history."); return; }
    setShowHistory(true);
    setIsLoading(true);
    const { data, error } = await supabase.from("chatbot_conversations")
      .select("id,title,updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(20);
    if (error) setChatError("Chat history is unavailable. Apply the chatbot SQL migration in Supabase.");
    else { setHistory((data ?? []) as Conversation[]); setChatError(""); }
    setIsLoading(false);
  }

  async function selectConversation(item: Conversation) {
    if (!userId) return;
    setIsLoading(true);
    const { data, error } = await supabase.from("chatbot_messages")
      .select("id,sender,text,suggestions,unanswered").eq("conversation_id", item.id).eq("user_id", userId).order("created_at", { ascending: true });
    if (error) setChatError("Could not load this conversation.");
    else {
      conversationRef.current = item.id;
      setConversationId(item.id);
      const restored = (data as Message[] | null) ?? [];
      setMessages(restored.length ? restored.map((message, index) => ({
        ...message,
        unansweredQuery: message.unanswered && restored[index - 1]?.sender === "user" ? restored[index - 1].text : undefined,
      })) : [welcomeMessage()]);
      setShowHistory(false);
      setFeedbackDraft({});
      setChatError("");
    }
    setIsLoading(false);
  }

  function startNewConversation() {
    conversationRef.current = null;
    setConversationId(null);
    setMessages([welcomeMessage()]);
    setShowHistory(false);
    setChatError("");
    setFeedbackDraft({});
  }

  async function clearHistory() {
    if (!userId || !window.confirm("Clear all of your saved chatbot conversations? This cannot be undone.")) return;
    const { error } = await supabase.from("chatbot_conversations").delete().eq("user_id", userId);
    if (error) setChatError("Could not clear chat history.");
    else { setHistory([]); startNewConversation(); setChatError(""); }
  }

  async function rateResponse(message: Message, rating: number) {
    if (!userId || !conversationId) {
      setChatError("Sign in and save a conversation before rating responses.");
      return;
    }
    const { error } = await supabase.from("chatbot_feedback").upsert({
      message_id: message.id, conversation_id: conversationId, user_id: userId,
      rating, suggestion: null,
    }, { onConflict: "message_id" });
    if (error) setChatError("Could not save your feedback.");
    else {
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, rating } : item));
      setChatError("");
    }
  }

  async function submitFeedback(message: Message) {
    const suggestion = feedbackDraft[message.id]?.trim().slice(0, 500);
    if (!suggestion || !userId || !conversationId || !message.rating) return;
    const { error } = await supabase.from("chatbot_feedback").upsert({
      message_id: message.id, conversation_id: conversationId, user_id: userId,
      rating: message.rating, suggestion: redactSensitiveText(suggestion),
    }, { onConflict: "message_id" });
    if (error) setChatError("Could not save your suggestion.");
    else {
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, feedbackText: suggestion } : item));
      setChatError("");
    }
  }

  async function submitUnansweredFeedback(message: Message) {
    if (!userId || !conversationId || !message.unansweredQuery) {
      setChatError("Sign in and save a conversation to submit a question as feedback.");
      return;
    }
    const { error } = await supabase.from("chatbot_unanswered_queries").insert({
      user_id: userId, conversation_id: conversationId,
      query: redactSensitiveText(message.unansweredQuery), submitted_as_feedback: true,
    });
    if (error) setChatError("Could not submit this question as feedback.");
    else {
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, feedbackText: "question" } : item));
      setChatError("");
    }
  }

  return (
    <div className="skillsync-chatbot">
      {showPanel && (
        <section className={`chatbot-panel ${isOpen ? "chatbot-panel-open" : "chatbot-panel-closing"}`} aria-label="SkillSync help chat" aria-hidden={!isOpen}>
          <header className="chatbot-header">
            <div className="chatbot-brand">
              <div className="chatbot-avatar"><SkillSyncMark /></div>
              <div><strong>SkillSync Assistant</strong><span><i /> Online · Help & guidance</span></div>
            </div>
            <div className="chatbot-header-actions">
              <button type="button" onClick={startNewConversation} aria-label="Start a new conversation" title="New conversation">＋</button>
              <button type="button" onClick={() => void openHistory()} aria-label="Show chat history" title="Chat history">◷</button>
              <button type="button" className="chatbot-close" aria-label="Close chat" onClick={() => setIsOpen(false)}>×</button>
            </div>
          </header>
          <div className="chatbot-context"><span>Currently viewing</span><strong>{pageTitle}</strong></div>
          {!showHistory && <div className="chatbot-context-suggestions"><span>Suggested for this page</span><div>{(pageSuggestions[pagePath] ?? pageSuggestions["/dashboard"]).map((action) => <button type="button" key={action.question} onClick={() => void submitQuestion(action.question)}>{action.label}</button>)}</div></div>}
          {showHistory ? (
            <div className="chatbot-history">
              <div className="chatbot-history-heading"><strong>Previous conversations</strong><button type="button" onClick={() => void clearHistory()}>Clear history</button></div>
              {isLoading && <p className="chatbot-status">Loading history…</p>}
              {!isLoading && history.length === 0 && <p className="chatbot-status">No saved conversations yet.</p>}
              {history.map((item) => <button className="chatbot-history-item" type="button" key={item.id} onClick={() => void selectConversation(item)}><span>{item.title}</span><small>{new Date(item.updated_at).toLocaleDateString()}</small></button>)}
              <button className="chatbot-history-back" type="button" onClick={() => setShowHistory(false)}>Back to chat</button>
            </div>
          ) : (
            <div className="chatbot-messages" aria-live="polite">
              {isLoading && messages.length === 0 && <p className="chatbot-status">Loading your latest conversation…</p>}
              {messages.map((message) => (
                <div className={`chatbot-message ${message.sender === "user" ? "user-message" : "bot-message"}`} key={message.id}>
                  {message.sender === "bot" && <span className="message-avatar"><SkillSyncMark /></span>}
                  <div className="chatbot-message-content">
                    <p>{message.text}</p>
                    {message.link && <button type="button" className="chatbot-navigation-link" onClick={() => navigate(message.link!.path)}>{message.link.label}<span>↗</span></button>}
                    {message.suggestions && <div className="chatbot-quick-actions">{message.suggestions.map((action) => <button type="button" key={action.question} onClick={() => void submitQuestion(action.question)}>{action.label}<span>→</span></button>)}</div>}
                    {message.unanswered && !message.feedbackText && <button type="button" className="chatbot-submit-unanswered" onClick={() => void submitUnansweredFeedback(message)}>Submit this question as feedback</button>}
                    {message.sender === "bot" && <div className="chatbot-feedback"><span>Was this helpful?</span><button type="button" aria-label="Helpful" className={message.rating === 1 ? "selected" : ""} onClick={() => void rateResponse(message, 1)}>👍</button><button type="button" aria-label="Not helpful" className={message.rating === -1 ? "selected" : ""} onClick={() => void rateResponse(message, -1)}>👎</button></div>}
                    {message.rating && !message.feedbackText && <form className="chatbot-feedback-form" onSubmit={(event) => { event.preventDefault(); void submitFeedback(message); }}><input aria-label="Optional suggestion" maxLength={500} value={feedbackDraft[message.id] ?? ""} onChange={(event) => setFeedbackDraft((draft) => ({ ...draft, [message.id]: event.target.value }))} placeholder="Optional suggestion…"/><button type="submit" disabled={!feedbackDraft[message.id]?.trim()}>Send</button></form>}
                    {message.feedbackText && <small className="chatbot-thanks">{message.feedbackText === "question" ? "Thanks for helping improve SkillSync." : "Thanks for the suggestion."}</small>}
                  </div>
                </div>
              ))}
              {isTyping && <div className="chatbot-typing" aria-label="Assistant is typing"><span /><span /><span /></div>}
              <div ref={messagesEndRef} />
            </div>
          )}
          {chatError && <div className="chatbot-error" role="status">{chatError}</div>}
          {!showHistory && <form className="chatbot-input-area" onSubmit={handleSubmit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about SkillSync…" aria-label="Type your message"/><button type="submit" disabled={!input.trim() || isTyping || isSending} aria-label="Send message">↑</button></form>}
          <div className="chatbot-footer">SkillSync Help Assistant · Rule-based support</div>
        </section>
      )}
      <button type="button" className={`chatbot-launcher ${isOpen ? "chatbot-launcher-open" : ""}`} onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? "Close SkillSync assistant" : "Open SkillSync assistant"}>
        {isOpen ? "\u00D7" : <><SkillSyncMark className="launcher-mark" /><span className="launcher-label">Ask SkillSync</span></>}
      </button>
    </div>
  );
}

export default SkillSyncChatbot;
