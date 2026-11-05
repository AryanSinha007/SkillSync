import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface SelectedSkill {
  skillId: number;
  proficiency: number;
}

function SkillsSetup() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("category")
      .order("name");

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSkills(data || []);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: existingSkills } = await supabase
        .from("student_skills")
        .select("skill_id, proficiency")
        .eq("student_id", user.id);

      if (existingSkills) {
        setSelectedSkills(
          existingSkills.map((item) => ({
            skillId: item.skill_id,
            proficiency: item.proficiency,
          }))
        );
      }
    }

    setLoading(false);
  }

  function toggleSkill(skillId: number) {
    const exists = selectedSkills.some(
      (skill) => skill.skillId === skillId
    );

    if (exists) {
      setSelectedSkills((current) =>
        current.filter((skill) => skill.skillId !== skillId)
      );
    } else {
      setSelectedSkills((current) => [
        ...current,
        {
          skillId,
          proficiency: 3,
        },
      ]);
    }
  }

  function updateProficiency(
    skillId: number,
    proficiency: number
  ) {
    setSelectedSkills((current) =>
      current.map((skill) =>
        skill.skillId === skillId
          ? { ...skill, proficiency }
          : skill
      )
    );
  }

  async function handleSave() {
  setSaving(true);
  setError("");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("Current user:", user);
  console.log("User error:", userError);

  if (userError || !user) {
    setError(
      "Your login session has expired. Please log in again."
    );
    setSaving(false);
    return;
  }

  if (selectedSkills.length < 2) {
    setError("Please select at least two skills.");
    setSaving(false);
    return;
  }

  console.log("Selected skills:", selectedSkills);

  // Remove previous skills
  const { error: deleteError } = await supabase
    .from("student_skills")
    .delete()
    .eq("student_id", user.id);

  if (deleteError) {
    console.error("Delete error:", deleteError);

    setError(
      `Could not update your skills: ${deleteError.message}`
    );

    setSaving(false);
    return;
  }

  const records = selectedSkills.map((skill) => ({
    student_id: user.id,
    skill_id: skill.skillId,
    proficiency: skill.proficiency,
  }));

  console.log("Records to insert:", records);

  const { data, error: insertError } = await supabase
    .from("student_skills")
    .insert(records)
    .select();

  if (insertError) {
    console.error("Insert error:", insertError);

    setError(
      `Could not save your skills: ${insertError.message}`
    );

    setSaving(false);
    return;
  }

  console.log("Successfully saved:", data);

  setSaving(false);

  navigate("/dashboard");
}
  const categories = [
    "All",
    ...Array.from(
      new Set(skills.map((skill) => skill.category))
    ),
  ];

  const filteredSkills =
    activeCategory === "All"
      ? skills
      : skills.filter(
          (skill) => skill.category === activeCategory
        );

  const selectedSkillObjects = skills.filter((skill) =>
    selectedSkills.some(
      (selected) => selected.skillId === skill.id
    )
  );

  if (loading) {
    return (
      <div className="auth-page">
        <p>Loading skills...</p>
      </div>
    );
  }

  return (
    <div className="skills-page">

      <div className="skills-container">

        <header className="profile-header">

          <div className="logo">
            <span className="logo-mark">S</span>
            <span>SkillSync</span>
          </div>

          <span className="profile-step">
            Step 2 of 2
          </span>

        </header>

        <div className="skills-heading">

          <span className="section-tag">
            YOUR SKILLS
          </span>

          <h1>What are you good at?</h1>

          <p>
            Select the skills you can bring to a project.
            Your skills help SkillSync find teammates who
            complement you.
          </p>

        </div>

        {selectedSkillObjects.length > 0 && (
          <section className="selected-skills-section">

            <div className="selected-header">
              <div>
                <h2>
                  Your selected skills
                </h2>

                <p>
                  {selectedSkillObjects.length} skills selected
                </p>
              </div>
            </div>

            <div className="selected-skills-list">

              {selectedSkillObjects.map((skill) => {

                const selected = selectedSkills.find(
                  (item) => item.skillId === skill.id
                );

                return (
                  <div
                    className="selected-skill"
                    key={skill.id}
                  >

                    <div className="selected-skill-info">
                      <strong>{skill.name}</strong>

                      <span>
                        {skill.category}
                      </span>
                    </div>

                    <select
                      value={selected?.proficiency || 3}
                      onChange={(event) =>
                        updateProficiency(
                          skill.id,
                          Number(event.target.value)
                        )
                      }
                    >
                      <option value="1">
                        Beginner
                      </option>

                      <option value="2">
                        Basic
                      </option>

                      <option value="3">
                        Intermediate
                      </option>

                      <option value="4">
                        Advanced
                      </option>

                      <option value="5">
                        Expert
                      </option>
                    </select>

                    <button
                      type="button"
                      className="remove-skill"
                      onClick={() =>
                        toggleSkill(skill.id)
                      }
                    >
                      ×
                    </button>

                  </div>
                );
              })}

            </div>

          </section>
        )}

        <section className="skills-section">

          <div className="category-tabs">

            {categories.map((category) => (
              <button
                type="button"
                key={category}
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

          <div className="skills-grid">

            {filteredSkills.map((skill) => {

              const selected = selectedSkills.some(
                (item) => item.skillId === skill.id
              );

              return (
                <button
                  type="button"
                  key={skill.id}
                  className={
                    selected
                      ? "skill-option selected"
                      : "skill-option"
                  }
                  onClick={() =>
                    toggleSkill(skill.id)
                  }
                >

                  <span className="skill-check">
                    {selected ? "✓" : "+"}
                  </span>

                  <span className="skill-option-content">
                    <strong>{skill.name}</strong>
                    <small>{skill.category}</small>
                  </span>

                </button>
              );
            })}

          </div>

        </section>

        {error && (
          <p className="profile-error">
            {error}
          </p>
        )}

        <div className="skills-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/dashboard")}
          >
            Back
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Skills →"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default SkillsSetup;
