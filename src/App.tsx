import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileSetup from "./pages/ProfileSetup";
import SkillsSetup from "./pages/SkillsSetup";
import FindTeammates from "./pages/FindTeammates";
import StudentProfile from "./pages/StudentProfile";
import Invitations from "./pages/Invitations";
import MyTeam from "./pages/MyTeam";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import SkillSyncChatbot from "./components/SkillSyncChatbot";

function Home(){
  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <div className="logo">
          <img className="skillsync-logo-image" src="/skillsync-logo.svg" alt="SkillSync" />
        </div>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="login-button">
  Log In
</Link>
          <Link to="/signup" className="primary-button small">
  Get Started
</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot"></span>
              Built for college projects & hackathons
            </div>

            <h1>
              Find the right
              <span> team.</span>
              <br />
              Build something
              <span> great.</span>
            </h1>

            <p className="hero-description">
              SkillSync helps college students find teammates based on their
              skills, interests, experience, and availability — not random
              selection.
            </p>

            <div className="hero-actions">
              <Link to="/signup" className="primary-button">
  Find My Team
  <span>→</span>
</Link>

              <button className="secondary-button">
                Explore Projects
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>Skill-based</strong>
                <span>Matching</span>
              </div>

              <div>
                <strong>Smart</strong>
                <span>Recommendations</span>
              </div>

              <div>
                <strong>Better</strong>
                <span>Teams</span>
              </div>
            </div>
          </div>

          {/* Matching Preview */}
          <div className="hero-visual">
            <div className="glow"></div>

            <div className="match-card main-card">
              <div className="match-header">
                <div>
                  <span className="small-label">TEAM MATCH</span>
                  <h3>AI Attendance System</h3>
                </div>

                <div className="match-score">92%</div>
              </div>

              <div className="match-label">
                <span>Perfect skill match</span>
                <span>92 / 100</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>

              <div className="profile-preview">
                <div className="avatar">RS</div>

                <div className="profile-info">
                  <strong>Rahul Sharma</strong>
                  <span>Machine Learning • Python</span>
                </div>

                <span className="available">Available</span>
              </div>

              <div className="skills">
                <span>Python</span>
                <span>ML</span>
                <span>Computer Vision</span>
              </div>

              <button className="card-button">View Profile →</button>
            </div>

            <div className="floating-card top-card">
              <span className="floating-icon">✓</span>
              <div>
                <strong>Skill Gap Filled</strong>
                <span>Your team needs ML expertise</span>
              </div>
            </div>

            <div className="floating-card bottom-card">
              <span className="floating-icon">✦</span>
              <div>
                <strong>3 teammates found</strong>
                <span>Based on your project</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section" id="features">
          <div className="section-heading">
            <span className="section-tag">WHY SKILLSYNC</span>
            <h2>Build teams that actually work.</h2>
            <p>
              Stop wasting time searching for teammates. Let your skills
              guide the way.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">◎</div>
              <h3>Skill Matching</h3>
              <p>
                Find students whose skills complement your own and match your
                project's requirements.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✦</div>
              <h3>Smart Recommendations</h3>
              <p>
                Get compatibility scores based on skills, interests,
                experience, and availability.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">◇</div>
              <h3>Better Teams</h3>
              <p>
                See exactly which skills your team has and which ones are still
                missing.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section how-section" id="how-it-works">
          <div className="section-heading">
            <span className="section-tag">HOW IT WORKS</span>
            <h2>From idea to team in four steps.</h2>
          </div>

          <div className="steps">
            <div className="step">
              <span className="step-number">01</span>
              <h3>Create your profile</h3>
              <p>Add your skills, interests, experience, and availability.</p>
            </div>

            <div className="step">
              <span className="step-number">02</span>
              <h3>Discover projects</h3>
              <p>Find college projects and hackathons that interest you.</p>
            </div>

            <div className="step">
              <span className="step-number">03</span>
              <h3>Find your match</h3>
              <p>See teammates ranked by their compatibility with your needs.</p>
            </div>

            <div className="step">
              <span className="step-number">04</span>
              <h3>Build your team</h3>
              <p>Send invitations and create a balanced project team.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section" id="about">
          <div>
            <span className="section-tag">READY TO BUILD?</span>
            <h2>Your next great project starts with the right team.</h2>
            <p>
              Create your SkillSync profile and discover teammates who bring
              the skills your project needs.
            </p>
          </div>

          <button className="primary-button">
            Get Started <span>→</span>
          </button>
        </section>
      </main>

      <footer>
        <div className="logo">
          <img className="skillsync-logo-image" src="/skillsync-logo.svg" alt="SkillSync" />
        </div>

        <p>Skill-based team formation for students.</p>

        <span>© 2026 SkillSync</span>
      </footer>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfileSetup />
    </ProtectedRoute>
  }
/>
<Route
  path="/skills"
  element={
    <ProtectedRoute>
      <SkillsSetup />
    </ProtectedRoute>
  }
/>
<Route
  path="/teammates"
  element={
    <ProtectedRoute>
      <FindTeammates />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/:id"
  element={
    <ProtectedRoute>
      <StudentProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/invitations"
  element={
    <ProtectedRoute>
      <Invitations />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-team"
  element={
    <ProtectedRoute>
      <MyTeam />
    </ProtectedRoute>
  }
/>
<Route
  path="/projects"
  element={
    <ProtectedRoute>
      <Projects />
    </ProtectedRoute>
  }
/>
<Route
  path="/projects/:id"
  element={
    <ProtectedRoute>
      <ProjectDetails />
    </ProtectedRoute>
  }
/>
      </Routes>
      <SkillSyncChatbot />
    </BrowserRouter>
  );
}

export default App;