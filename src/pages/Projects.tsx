import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  project_id: number;
  skill_id: number;
  required_proficiency: number;
  skill: {
    name: string;
    category: string;
  };
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSkills, setProjectSkills] = useState<ProjectSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError("");

    const { data: projectData, error: projectError } =
      await supabase
        .from("projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", {
          ascending: false,
        });

    if (projectError) {
      setError(projectError.message);
      setLoading(false);
      return;
    }

    const { data: skillData, error: skillError } =
      await supabase
        .from("project_skills")
        .select(`
          project_id,
          skill_id,
          required_proficiency,
          skill:skills (
            name,
            category
          )
        `);

    if (skillError) {
      setError(skillError.message);
      setLoading(false);
      return;
    }

    setProjects(projectData || []);
    setProjectSkills(
      (skillData || []) as unknown as ProjectSkill[]
    );

    setLoading(false);
  }

  function getProjectSkills(projectId: number) {
    return projectSkills.filter(
      (item) => item.project_id === projectId
    );
  }

  if (loading) {
    return (
      <div className="projects-page">
        <div className="projects-container">
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <div className="projects-container">
          <p className="profile-error">{error}</p>
        </div>
      </div>
    );
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
          to="/dashboard"
          className="back-link"
        >
          ← Dashboard
        </Link>

      </header>


      <main className="projects-container">

        <section className="projects-header">

          <span className="section-tag">
            PROJECT DISCOVERY
          </span>

          <h1>
            Find your next project.
          </h1>

          <p>
            Explore college projects and hackathons
            looking for students with your skills.
          </p>

        </section>


        {projects.length === 0 ? (

          <div className="no-projects">
            <h2>No open projects yet.</h2>

            <p>
              Check back later for new projects
              and hackathons.
            </p>
          </div>

        ) : (

          <div className="projects-grid">

            {projects.map((project) => {

              const skills =
                getProjectSkills(project.id);

              return (
                <article
                  className="project-card"
                  key={project.id}
                >

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
                      Up to {project.max_members} members
                    </span>

                  </div>


                  <h2>
                    {project.title}
                  </h2>


                  <p className="project-description">
                    {project.description}
                  </p>


                  <div className="project-skills">

                    <span className="skills-label">
                      REQUIRED SKILLS
                    </span>

                    <div className="skill-tags">

                      {skills.map((item) => (

                        <span
                          className="skill-tag"
                          key={item.skill_id}
                        >
                          {item.skill?.name}
                        </span>

                      ))}

                    </div>

                  </div>


                  <div className="project-card-footer">

                    <span>
                      {skills.length} required skills
                    </span>

                    <Link
  to={`/projects/${project.id}`}
  className="secondary-button"
>
  View Project →
</Link>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </main>

    </div>
  );
}

export default Projects;