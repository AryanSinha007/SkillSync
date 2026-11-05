import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  college: string;
  course: string;
  year: number;
  bio: string;
  availability: string;
}

interface StudentSkill {
  skill_id: number;
  proficiency: number;
  skill: {
    name: string;
    category: string;
  };
}

function StudentProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
const projectId = searchParams.get("projectId");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [inviting, setInviting] = useState(false);
const [inviteSent, setInviteSent] = useState(false);
const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id]);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { data: skillData, error: skillError } =
      await supabase
        .from("student_skills")
        .select(`
          skill_id,
          proficiency,
          skill:skills (
            name,
            category
          )
        `)
        .eq("student_id", id);

    if (skillError) {
      setError(skillError.message);
      setLoading(false);
      return;
    }

    setProfile(profileData);
    setSkills((skillData || []) as unknown as StudentSkill[]);

    setLoading(false);
  }

  function getProficiencyLabel(level: number) {
    if (level === 1) return "Beginner";
    if (level === 2) return "Basic";
    if (level === 3) return "Intermediate";
    if (level === 4) return "Advanced";
    return "Expert";
  }
  async function handleInvite() {
  setInviting(true);
  setInviteError("");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setInviteError("Please log in again.");
    setInviting(false);
    return;
  }

  if (!id) {
    setInviteError("Student profile not found.");
    setInviting(false);
    return;
  }

  if (user.id === id) {
    setInviteError("You cannot invite yourself.");
    setInviting(false);
    return;
  }

  // Check whether a pending invitation already exists
  let invitationQuery = supabase
  .from("invitations")
  .select("id, status")
  .eq("sender_id", user.id)
  .eq("receiver_id", id)
  .eq("status", "pending");

if (projectId) {
  invitationQuery = invitationQuery.eq(
    "project_id",
    Number(projectId)
  );
} else {
  invitationQuery = invitationQuery.is("project_id", null);
}

const { data: existingInvitation, error: checkError } =
  await invitationQuery.maybeSingle();

if (checkError) {
  setInviteError(checkError.message);
  setInviting(false);
  return;
}
if (
  projectId !== null &&
  (!/^\d+$/.test(projectId) || Number(projectId) <= 0)
) {
  setInviteError("Invalid project ID.");
  setInviting(false);
  return;
}

  if (existingInvitation) {
    setInviteSent(true);
    setInviting(false);
    return;
  }

  const { error } = await supabase.from("invitations").insert({
  sender_id: user.id,
  receiver_id: id,
  status: "pending",
  project_id: projectId ? Number(projectId) : null,
});

  if (error) {
    console.error("Invitation error:", error);
    setInviteError(error.message);
    setInviting(false);
    return;
  }

  setInviteSent(true);
  setInviting(false);
}

  if (loading) {
    return (
      <div className="auth-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="auth-page">
        <div>
          <p className="profile-error">
            {error || "Profile not found."}
          </p>

          <Link to="/teammates" className="back-link">
            ← Back to teammates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile-page">

      <header className="student-profile-navbar">

        <Link to="/dashboard" className="logo">
          <img className="skillsync-logo-image" src="/skillsync-logo.svg" alt="SkillSync" />
        </Link>

        <Link
          to="/teammates"
          className="back-link"
        >
          ← Find Teammates
        </Link>

      </header>

      <main className="student-profile-container">

        <section className="student-profile-hero">

  <div className="large-student-avatar">
    {profile.full_name
      ?.charAt(0)
      .toUpperCase()}
  </div>

  <div className="student-profile-main">

    <span className="section-tag">
      STUDENT PROFILE
    </span>

    <h1>{profile.full_name}</h1>

    <p className="student-profile-college">
      {profile.college}
    </p>

    <div className="student-profile-meta">
      <span>{profile.course}</span>
      <span>Year {profile.year}</span>

      {profile.availability && (
        <span>{profile.availability}</span>
      )}
    </div>

  </div>

  <div className="invite-area">

    <button
      className="primary-button"
      onClick={handleInvite}
      disabled={inviting || inviteSent}
    >
      {inviting
        ? "Sending..."
        : inviteSent
          ? "Invitation Sent ✓"
          : projectId
  ? "Invite to Project"
  : "Invite to Team"}
    </button>

    {inviteError && (
      <p className="profile-error invite-message">
        {inviteError}
      </p>
    )}

  </div>

</section>

        <div className="student-profile-grid">

          <section className="student-profile-card">

            <span className="section-tag">
              ABOUT
            </span>

            <h2>About {profile.full_name}</h2>

            <p className="student-about">
              {profile.bio ||
                "This student hasn't added a bio yet."}
            </p>

          </section>

          <section className="student-profile-card">

            <span className="section-tag">
              AVAILABILITY
            </span>

            <h2>Project availability</h2>

            <div className="availability-display">
              <span className="availability-dot"></span>

              {profile.availability ||
                "Not specified"}
            </div>

          </section>

        </div>

        <section className="student-profile-card skills-profile-card">

          <div className="profile-card-heading">

            <div>
              <span className="section-tag">
                SKILLS
              </span>

              <h2>Technical & professional skills</h2>
            </div>

            <span className="skill-count">
              {skills.length} skills
            </span>

          </div>

          <div className="profile-skill-list">

            {skills.map((item) => (

              <div
                className="profile-skill-item"
                key={item.skill_id}
              >

                <div className="profile-skill-name">

                  <strong>
                    {item.skill?.name}
                  </strong>

                  <span>
                    {item.skill?.category}
                  </span>

                </div>

                <div className="skill-level">

                  <div className="skill-level-bar">

                    <div
                      className="skill-level-fill"
                      style={{
                        width: `${item.proficiency * 20}%`,
                      }}
                    />

                  </div>

                  <span>
                    {getProficiencyLabel(
                      item.proficiency
                    )}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default StudentProfile;
