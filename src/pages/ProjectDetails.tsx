import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Project {
  id: number;
  title: string;
  description: string;
  type: "project" | "hackathon";
  status: "open" | "closed";
  max_members: number;
  created_at: string;
}

interface ProjectSkill {
  skill_id: number;
  required_proficiency: number;
  skill: {
    name: string;
    category: string;
  };
}

interface Member {
  student_id: string;
  role: string;
  profile: {
    full_name: string;
    college: string;
    course: string;
    year: number;
  };
}
interface ProjectMatch {
  student_id: string;
  full_name: string;
  college: string;
  course: string;
  year: number;
  match_score: number;
  matched_skills: string[];
}
function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [skills, setSkills] = useState<ProjectSkill[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
const [matches, setMatches] = useState<ProjectMatch[]>([]);
const [isMember, setIsMember] = useState(false);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  async function loadProject() {
    setLoading(true);
    setError("");

    const projectId = Number(id);

    if (Number.isNaN(projectId)) {
      setError("Invalid project.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    // Get project
    const { data: projectData, error: projectError } =
      await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

    if (projectError) {
      setError(projectError.message);
      setLoading(false);
      return;
    }

    // Get required skills
    const { data: skillData, error: skillError } =
      await supabase
        .from("project_skills")
        .select(`
          skill_id,
          required_proficiency,
          skill:skills (
            name,
            category
          )
        `)
        .eq("project_id", projectId);

    if (skillError) {
      setError(skillError.message);
      setLoading(false);
      return;
    }

    // Get project members
    const { data: memberData, error: memberError } =
      await supabase
        .from("project_members")
        .select(`
          student_id,
          role,
          profile:profiles (
            full_name,
            college,
            course,
            year
          )
        `)
        .eq("project_id", projectId);
        const { data: matchData, error: matchError } =
  await supabase.rpc(
    "get_project_matches",
    {
      target_project_id: projectId,
    }
  );

if (matchError) {
  console.error(
    "Project matching error:",
    matchError
  );
}

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    setProject(projectData);

    setSkills(
      (skillData || []) as unknown as ProjectSkill[]
    );

    setMembers(
      (memberData || []) as unknown as Member[]
    );
    setMatches(
  (matchData || []) as ProjectMatch[]
);

    setIsMember(
      (memberData || []).some(
        (member) => member.student_id === user.id
      )
    );

    setLoading(false);
  }

  async function joinProject() {
    if (!project) return;

    setJoining(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    if (members.length >= project.max_members) {
      setError("This project is already full.");
      setJoining(false);
      return;
    }

    const { error } = await supabase
      .from("project_members")
      .insert({
        project_id: project.id,
        student_id: user.id,
        role: "member",
      });

    if (error) {
      setError(error.message);
      setJoining(false);
      return;
    }

    setIsMember(true);

    await loadProject();

    setJoining(false);
  }

  if (loading) {
    return (
      <div className="projects-page">
        <div className="projects-container">
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="projects-page">
        <div className="projects-container">
          <p className="profile-error">
            {error}
          </p>

          <Link
            to="/projects"
            className="back-link"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="projects-page">

      <header className="projects-navbar">

        <Link
          to="/dashboard"
          className="logo"
        >
          <span className="logo-mark">S</span>
          <span>SkillSync</span>
        </Link>

        <Link
          to="/projects"
          className="back-link"
        >
          ← Projects
        </Link>

      </header>


      <main className="project-details-container">

        <Link
          to="/projects"
          className="project-back"
        >
          ← Back to Projects
        </Link>


        <section className="project-details-hero">

          <div className="project-details-heading">

            <div className="project-card-top">

              <span
                className={
                  project.type === "hackathon"
                    ? "project-type hackathon"
                    : "project-type"
                }
              >
                {project.type === "hackathon"
                  ? "HACKATHON"
                  : "PROJECT"}
              </span>

              <span className="project-members">
                {members.length} / {project.max_members} members
              </span>

            </div>

            <h1>{project.title}</h1>

            <p>
              {project.description}
            </p>

          </div>


          <div className="project-action-box">

            {isMember ? (

              <div className="joined-project">
                ✓ You are part of this project
              </div>

            ) : members.length >= project.max_members ? (

              <button
                className="secondary-button"
                disabled
              >
                Project Full
              </button>

            ) : (

              <button
                className="primary-button"
                onClick={joinProject}
                disabled={joining}
              >
                {joining
                  ? "Joining..."
                  : "Join Project →"}
              </button>

            )}

            {error && (
              <p className="project-error">
                {error}
              </p>
            )}

          </div>

        </section>


        <section className="project-details-grid">


          {/* Required Skills */}

          <div className="project-detail-card">

            <span className="section-tag">
              REQUIRED SKILLS
            </span>

            <h2>
              What this project needs
            </h2>

            <div className="required-skills-list">

              {skills.length === 0 ? (

                <p className="empty-text">
                  No specific skills listed.
                </p>

              ) : (

                skills.map((item) => (

                  <div
                    className="required-skill"
                    key={item.skill_id}
                  >

                    <div>

                      <strong>
                        {item.skill?.name}
                      </strong>

                      <span>
                        {item.skill?.category}
                      </span>

                    </div>

                    <span className="skill-level">
                      Level {item.required_proficiency}/5
                    </span>

                  </div>

                ))

              )}

            </div>

          </div>
          <section className="project-matches-section">

  <div className="project-matches-header">

    <div>

      <span className="section-tag">
        SKILLSYNC MATCHING
      </span>

      <h2>
        Students who fit this project
      </h2>

      <p>
        SkillSync found students whose skills
        match the requirements of this project.
      </p>

    </div>

    <span className="match-count">
      {matches.length} matches
    </span>

  </div>


  {matches.length === 0 ? (

    <div className="no-matches">
      <p>
        No matching students found yet.
      </p>
    </div>

  ) : (

    <div className="project-matches-grid">

      {matches.slice(0, 6).map((match, index) => (

        <article
          className="project-match-card"
          key={match.student_id}
        >

          <div className="project-match-top">

            <div className="project-match-avatar">
              {match.full_name
                ?.charAt(0)
                .toUpperCase() || "S"}
            </div>

            <div>

              <h3>
                {match.full_name}
              </h3>

              <span>
                {match.course}
              </span>

            </div>

            <div className="project-match-score">
              <strong>
                {match.match_score}%
              </strong>

              <span>
                match
              </span>
            </div>

          </div>


          <div className="project-match-info">

            <span>
              {match.college}
            </span>

            <span>
              Year {match.year}
            </span>

          </div>


          <div className="project-match-skills">

            <span className="skills-label">
              MATCHED SKILLS
            </span>

            <div className="skill-tags">

              {match.matched_skills
                ?.filter(Boolean)
                .map((skill) => (

                  <span
                    className="skill-tag"
                    key={skill}
                  >
                    {skill}
                  </span>

                ))}

            </div>

          </div>


          <Link
            to={`/student/${match.student_id}`}
            className="secondary-button"
          >
            View Profile →
          </Link>

        </article>

      ))}

    </div>

  )}

</section>


          {/* Team Members */}

          <div className="project-detail-card">

            <span className="section-tag">
              PROJECT TEAM
            </span>

            <h2>
              Current members
            </h2>

            <div className="project-member-list">

              {members.length === 0 ? (

                <p className="empty-text">
                  No members yet. Be the first to join!
                </p>

              ) : (

                members.map((member) => (

                  <div
                    className="project-member"
                    key={member.student_id}
                  >

                    <div className="project-member-avatar">
                      {member.profile?.full_name
                        ?.charAt(0)
                        .toUpperCase() || "S"}
                    </div>

                    <div>

                      <strong>
                        {member.profile?.full_name}
                      </strong>

                      <span>
                        {member.role}
                      </span>

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ProjectDetails;