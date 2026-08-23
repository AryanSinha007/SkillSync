import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Team {
  id: number;
  name: string;
  created_by: string;
  created_at: string;
}

interface TeamMember {
  id: number;
  team_id: number;
  student_id: string;
  role: string;
  profile: {
    full_name: string;
    college: string;
    course: string;
    year: number;
    bio: string;
    availability: string;
  };
}

function MyTeam() {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    // Find the team the current student belongs to
    const { data: membership, error: membershipError } =
      await supabase
        .from("team_members")
        .select("team_id")
        .eq("student_id", user.id)
        .maybeSingle();

    if (membershipError) {
      setError(membershipError.message);
      setLoading(false);
      return;
    }

    if (!membership) {
      setLoading(false);
      return;
    }

    // Get team details
    const { data: teamData, error: teamError } =
      await supabase
        .from("teams")
        .select("*")
        .eq("id", membership.team_id)
        .single();

    if (teamError) {
      setError(teamError.message);
      setLoading(false);
      return;
    }

    // Get team members + profiles
    const { data: memberData, error: memberError } =
      await supabase
        .from("team_members")
        .select(`
          id,
          team_id,
          student_id,
          role,
          profile:profiles (
            full_name,
            college,
            course,
            year,
            bio,
            availability
          )
        `)
        .eq("team_id", membership.team_id);

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    setTeam(teamData);
    setMembers(
      (memberData || []) as unknown as TeamMember[]
    );

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p>Loading your team...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-page">
        <p className="profile-error">{error}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="my-team-page">

        <header className="my-team-navbar">

          <Link to="/dashboard" className="logo">
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

        <main className="my-team-container">

          <div className="no-team-card">

            <div className="no-team-icon">
              ✦
            </div>

            <span className="section-tag">
              YOUR TEAM
            </span>

            <h1>
              You haven't joined a team yet.
            </h1>

            <p>
              Find students with complementary skills
              and start building your team.
            </p>

            <Link
              to="/teammates"
              className="primary-button"
            >
              Find Teammates
            </Link>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="my-team-page">

      <header className="my-team-navbar">

        <Link to="/dashboard" className="logo">
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

      <main className="my-team-container">

        <section className="team-hero">

          <div>

            <span className="section-tag">
              YOUR TEAM
            </span>

            <h1>{team.name}</h1>

            <p>
              {members.length}{" "}
              {members.length === 1
                ? "member"
                : "members"}{" "}
              • Created{" "}
              {new Date(
                team.created_at
              ).toLocaleDateString()}
            </p>

          </div>

          <div className="team-status">
            <span className="team-status-dot"></span>
            Active
          </div>

        </section>


        <section className="team-section">

          <div className="team-section-heading">

            <div>

              <span className="section-tag">
                TEAM MEMBERS
              </span>

              <h2>
                Meet your teammates
              </h2>

            </div>

            <span className="member-count">
              {members.length} members
            </span>

          </div>


          <div className="team-members-grid">

            {members.map((member) => (

              <article
                className="team-member-card"
                key={member.id}
              >

                <div className="team-member-top">

                  <div className="team-member-avatar">
                    {member.profile?.full_name
                      ?.charAt(0)
                      .toUpperCase() || "S"}
                  </div>

                  <div>

                    <h3>
                      {member.profile?.full_name}
                    </h3>

                    <span
                      className={
                        member.role === "leader"
                          ? "member-role leader"
                          : "member-role"
                      }
                    >
                      {member.role}
                    </span>

                  </div>

                </div>


                <div className="team-member-info">

                  <span>
                    {member.profile?.college}
                  </span>

                  <span>
                    {member.profile?.course}
                  </span>

                  <span>
                    Year {member.profile?.year}
                  </span>

                </div>


                {member.profile?.bio && (
                  <p className="team-member-bio">
                    {member.profile.bio}
                  </p>
                )}

              </article>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default MyTeam;