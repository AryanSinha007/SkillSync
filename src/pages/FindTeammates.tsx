import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Student {
  id: string;
  full_name: string;
  college: string;
  course: string;
  year: number;
  bio: string;
  availability: string;
}

interface StudentSkill {
  student_id: string;
  skill_id: number;
  proficiency: number;
  skill: {
    name: string;
    category: string;
  };
}

function FindTeammates() {
  const [students, setStudents] = useState<Student[]>([]);
const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [error, setError] = useState("");

  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in to find teammates.");
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);

    const { data: profiles, error: profileError } =
      await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { data: skills, error: skillsError } =
      await supabase
        .from("student_skills")
        .select(`
          student_id,
          skill_id,
          proficiency,
          skill:skills (
            name,
            category
          )
        `);

    if (skillsError) {
      setError(skillsError.message);
      setLoading(false);
      return;
    }

    setStudents(profiles || []);
    setStudentSkills((skills || []) as unknown as StudentSkill[]);

    setLoading(false);
  }

  async function handleInvite(studentId: string) {
  setError("");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setError("Please log in to send an invitation.");
    return;
  }

  if (user.id === studentId) {
    setError("You cannot invite yourself.");
    return;
  }

  setInvitingId(studentId);

  const { error: inviteError } = await supabase
    .from("invitations")
    .insert({
      sender_id: user.id,
      receiver_id: studentId,
      status: "pending",
    });

  if (inviteError) {
    console.error(inviteError);

    if (inviteError.code === "23505") {
      setError("You have already invited this student.");
    } else {
      setError(inviteError.message);
    }

    setInvitingId(null);
    return;
  }

  setInvitedIds((prev) => [...prev, studentId]);
  setInvitingId(null);
}
  function getStudentSkills(studentId: string) {
    return studentSkills.filter(
      (skill) => skill.student_id === studentId
    );
  }

  function getMatchScore(studentId: string) {
  const mySkills = getStudentSkills(currentUserId);
  const candidateSkills = getStudentSkills(studentId);

  if (mySkills.length === 0 || candidateSkills.length === 0) {
    return 0;
  }

  const mySkillMap = new Map(
    mySkills.map((item) => [
      item.skill?.name?.toLowerCase(),
      item.proficiency,
    ])
  );

  const sharedSkills = candidateSkills.filter((item) =>
    mySkillMap.has(item.skill?.name?.toLowerCase())
  );

  const complementarySkills = candidateSkills.filter(
    (item) =>
      !mySkillMap.has(item.skill?.name?.toLowerCase())
  );

  // -----------------------------------------
  // 1. Shared skill compatibility
  // -----------------------------------------

  let sharedScore = 0;

  if (sharedSkills.length > 0) {
    const totalSharedScore = sharedSkills.reduce(
      (total, skill) => {
        const myLevel =
          mySkillMap.get(
            skill.skill?.name?.toLowerCase()
          ) || 0;

        const candidateLevel =
          skill.proficiency;

        const compatibility =
          (Math.min(myLevel, candidateLevel) / 5) * 100;

        return total + compatibility;
      },
      0
    );

    sharedScore =
      totalSharedScore / sharedSkills.length;
  }

  // -----------------------------------------
  // 2. Complementary skill score
  // -----------------------------------------

  const complementaryScore =
    (complementarySkills.length /
      candidateSkills.length) *
    100;

  // -----------------------------------------
  // 3. Final SkillSync score
  // -----------------------------------------

  let finalScore =
    sharedScore * 0.45 +
    complementaryScore * 0.55;

  // Small bonus for having both shared
  // and complementary skills
  if (
    sharedSkills.length > 0 &&
    complementarySkills.length > 0
  ) {
    finalScore += 10;
  }

  return Math.min(
    99,
    Math.max(1, Math.round(finalScore))
  );
}

  const categories = [
    "All",
    ...Array.from(
      new Set(
        studentSkills
          .map((item) => item.skill?.category)
          .filter(Boolean)
      )
    ),
  ];

  const filteredStudents = students.filter((student) => {
    const skills = getStudentSkills(student.id);

    const matchesSearch =
      student.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      student.college
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      skills.some((skill) =>
        skill.skill?.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );

    const matchesCategory =
      activeCategory === "All" ||
      skills.some(
        (skill) =>
          skill.skill?.category === activeCategory
      );

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="auth-page">
        <p>Finding students...</p>
      </div>
    );
  }

  return (
    <div className="teammates-page">

      <header className="teammates-navbar">

        <Link to="/dashboard" className="logo">
          <img className="skillsync-logo-image" src="/skillsync-logo.svg" alt="SkillSync" />
        </Link>

        <Link
          to="/dashboard"
          className="back-link"
        >
          ← Dashboard
        </Link>

      </header>

      <main className="teammates-container">

        <section className="teammates-hero">

          <span className="section-tag">
            FIND YOUR TEAM
          </span>

          <h1>
            Find teammates who
            <br />
            complement your skills.
          </h1>

          <p>
            Discover students with the skills and
            interests you need for your next project.
          </p>

        </section>

        <section className="teammates-controls">

          <div className="search-wrapper">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by name, college, or skill..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

          <div className="category-tabs">

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category
                    ? "category-tab active"
                    : "category-tab"
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}
              </button>
            ))}

          </div>

        </section>

        {error && (
          <p className="profile-error">
            {error}
          </p>
        )}

        <div className="teammates-result-header">

          <div>
            <span className="section-tag">
              RECOMMENDED
            </span>

            <h2>
              {filteredStudents.length} students found
            </h2>
          </div>

          <span className="result-info">
            Based on your profile
          </span>

        </div>

        {filteredStudents.length === 0 ? (

          <div className="empty-teammates">

            <div className="empty-icon">
              ◌
            </div>

            <h2>No teammates found</h2>

            <p>
              Try another search or category.
            </p>

          </div>

        ) : (

          <div className="teammates-grid">

            {filteredStudents.map((student) => {

              const skills =
                getStudentSkills(student.id);

              const score =
                getMatchScore(student.id);

              return (

                <article
                  className="teammate-card"
                  key={student.id}
                >

                  <div className="teammate-card-header">

                    <div className="student-avatar">
                      {student.full_name
                        ?.charAt(0)
                        .toUpperCase() || "S"}
                    </div>

                    <div className="student-basic">

                      <h3>
                        {student.full_name}
                      </h3>

                      <p>
                        {student.college}
                      </p>

                    </div>

                    <div className="match-score">
                          <strong>
                            {score}%
                          </strong>

                          <span>
                            skill match
                          </span>
                        </div>

                  </div>

                  <div className="student-details">

                    <span>
                      {student.course}
                    </span>

                    <span>
                      Year {student.year}
                    </span>

                    <span>
                      {student.availability ||
                        "Availability not specified"}
                    </span>

                  </div>

                  {student.bio && (
                    <p className="student-bio">
                      {student.bio}
                    </p>
                  )}

                  <div className="student-skills">

                    {skills
                      .slice(0, 5)
                      .map((item) => (
                        <span
                          className="skill-chip"
                          key={item.skill_id}
                        >
                          {item.skill?.name}
                        </span>
                      ))}

                  </div>
                      <div className="match-reason">

  <span className="match-reason-label">
    WHY THIS MATCH
  </span>

  <p>
    {getStudentSkills(student.id).some(
      (skill) =>
        getStudentSkills(currentUserId).some(
          (mySkill) =>
            mySkill.skill?.name?.toLowerCase() ===
            skill.skill?.name?.toLowerCase()
        )
    )
      ? "You share relevant skills and can complement each other's strengths."
      : "This student brings different skills that could strengthen your team."}
  </p>

</div>

                  <div className="teammate-actions">

                    <Link
  to={`/student/${student.id}`}
  className="secondary-button"
>
  View Profile
</Link>

                    <button
  type="button"
  className="primary-button"
  onClick={() => handleInvite(student.id)}
  disabled={
    invitingId === student.id ||
    invitedIds.includes(student.id)
  }
>
  {invitingId === student.id
    ? "Sending..."
    : invitedIds.includes(student.id)
    ? "Invited ✓"
    : "Invite"}
</button>

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

export default FindTeammates;
