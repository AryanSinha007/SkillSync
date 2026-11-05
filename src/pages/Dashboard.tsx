import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import DashboardModuleIcon from "../components/DashboardModuleIcon";

function Dashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        const name = data.user.user_metadata?.full_name;

        if (name) {
          setUserName(name);
        }
      }
    }

    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="dashboard-page">

      <header className="dashboard-navbar">

        <div className="logo">
          <img className="skillsync-logo-image" src="/skillsync-logo.svg" alt="SkillSync" />
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Log Out
        </button>

      </header>

      <main className="dashboard-content">

        <div className="dashboard-welcome">
          <div>
            <span className="section-tag">
              STUDENT DASHBOARD
            </span>

            <h1>
              Welcome, {userName} 👋
            </h1>

            <p>
              Let's find the right teammates for your next project.
            </p>
          </div>
        </div>

               <div className="dashboard-grid">

          {/* Complete Profile */}
          <div className="dashboard-card">

            <DashboardModuleIcon kind="profile" />

            <h2>Complete your profile</h2>

            <p>
              Add your skills, interests, experience and
              availability so SkillSync can find better matches.
            </p>

            <Link
              to="/profile"
              className="primary-button"
            >
              Complete Profile →
            </Link>

          </div>


          {/* Find Teammates */}
          <div className="dashboard-card">

            <DashboardModuleIcon kind="teammates" />

            <h2>Find teammates</h2>

            <p>
              Discover students whose skills complement
              your own.
            </p>

            <Link
              to="/teammates"
              className="secondary-button"
            >
              Find Teammates
            </Link>

          </div>


          {/* Explore Projects */}
          <div className="dashboard-card">

            <DashboardModuleIcon kind="projects" />

            <h2>Explore projects</h2>

            <p>
              Find college projects and hackathons looking
              for students like you.
            </p>

            <Link
  to="/projects"
  className="secondary-button"
>
  Explore Projects
</Link>

          </div>


          {/* Team Invitations */}
          <div className="dashboard-card">

            <DashboardModuleIcon kind="invitations" />

            <h2>Team invitations</h2>

            <p>
              Check invitations from students who want
              you to join their project team.
            </p>

            <Link
              to="/invitations"
              className="secondary-button"
            >
              View Invitations
            </Link>

          </div>
          <div className="dashboard-card">

  <DashboardModuleIcon kind="team" />

  <h2>My Team</h2>

  <p>
    View your current team, teammates and
    team information.
  </p>

  <Link
    to="/my-team"
    className="secondary-button"
  >
    Open My Team
  </Link>

</div>

        </div>

        
        

        <section className="dashboard-section">

          <div className="dashboard-section-header">
            <div>
              <span className="section-tag">
                YOUR ACTIVITY
              </span>

              <h2>Getting started</h2>
            </div>
          </div>

          <div className="profile-progress">

            <div>
              <span>Profile completion</span>
              <strong>20%</strong>
            </div>

            <div className="dashboard-progress-bar">
              <div className="dashboard-progress-fill"></div>
            </div>

            <p>
              Complete your profile to get personalized
              teammate recommendations.
            </p>

          </div>
          

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
