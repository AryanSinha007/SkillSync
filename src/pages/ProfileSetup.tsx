import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProfileSetup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    // Get existing profile if one exists
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setFullName(data.full_name || "");
      setCollege(data.college || "");
      setCourse(data.course || "");
      setYear(data.year ? String(data.year) : "");
      setBio(data.bio || "");
      setAvailability(data.availability || "");
    } else {
      // Use authentication metadata as initial name
      setFullName(user.user_metadata?.full_name || "");
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!fullName || !college || !course || !year) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        college,
        course,
        year: Number(year),
        bio,
        availability,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Profile saved successfully!");

    setTimeout(() => {
      navigate("/skills");
    }, 800);
  }

  return (
    <div className="profile-page">

      <div className="profile-container">

        <div className="profile-header">

          <div className="logo">
            <img className="skillsync-logo-image" src="/skillsync-logo.svg" alt="SkillSync" />
          </div>

          <span className="profile-step">
            Step 1 of 2
          </span>

        </div>

        <div className="profile-heading">

          <span className="section-tag">
            BUILD YOUR PROFILE
          </span>

          <h1>Tell us about yourself.</h1>

          <p>
            This information helps SkillSync find teammates
            who complement your skills and interests.
          </p>

        </div>

        <form
          className="profile-form"
          onSubmit={handleSave}
        >

          <section className="profile-section">

            <div className="profile-section-heading">
              <h2>Personal Information</h2>
              <p>Basic information about you.</p>
            </div>

            <div className="form-grid">

              <label>
                Full Name
                <input
                  type="text"
                  placeholder="Aryan Sinha"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                />
              </label>

              <label>
                College
                <input
                  type="text"
                  placeholder="Your college name"
                  value={college}
                  onChange={(event) =>
                    setCollege(event.target.value)
                  }
                />
              </label>

              <label>
                Course
                <input
                  type="text"
                  placeholder="B.Tech Computer Science"
                  value={course}
                  onChange={(event) =>
                    setCourse(event.target.value)
                  }
                />
              </label>

              <label>
                Year
                <select
                  value={year}
                  onChange={(event) =>
                    setYear(event.target.value)
                  }
                >
                  <option value="">
                    Select year
                  </option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </label>

            </div>

          </section>

          <section className="profile-section">

            <div className="profile-section-heading">
              <h2>About You</h2>
              <p>Help potential teammates understand you.</p>
            </div>

            <label>
              Short Bio
              <textarea
                placeholder="Tell teammates about yourself, your experience, and what you like building..."
                rows={5}
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
              />
            </label>

          </section>

          <section className="profile-section">

            <div className="profile-section-heading">
              <h2>Availability</h2>
              <p>When are you usually available for projects?</p>
            </div>

            <div className="availability-options">

              {[
                "Weekday evenings",
                "Weekends",
                "Flexible",
                "Limited availability",
              ].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={
                    availability === option
                      ? "availability-option selected"
                      : "availability-option"
                  }
                  onClick={() =>
                    setAvailability(option)
                  }
                >
                  {option}
                </button>
              ))}

            </div>

          </section>

          {error && (
            <p className="profile-error">
              {error}
            </p>
          )}

          {message && (
            <p className="profile-success">
              {message}
            </p>
          )}

          <div className="profile-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/dashboard")}
            >
              Save Later
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Continue to Skills →"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ProfileSetup;