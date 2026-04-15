import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  createTutorProfile,
  getTutorProfile,
  updateTutorProfile,
} from "../api/tutorAPI";
import {
  CUSTOM_TOPIC,
  SKILL_BRANCHES,
  areasForBranch,
  findCategoryKeysFromLabels,
  resolveTopicFromName,
  topicsFor,
} from "../data/skillCategories";
import "../styles/dashboard.css";

const emptySkill = () => ({
  categoryKey: "",
  subcategoryKey: "",
  topicKey: "",
  name: "",
  proficiencyLevel: "",
  experienceNote: "",
});

const PROFICIENCY_OPTIONS = [
  { value: "", label: "Select proficiency" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

function getSkillCardClass(skillName = "") {
  const lower = skillName.toLowerCase();

  if (
    lower.includes("math") ||
    lower.includes("algebra") ||
    lower.includes("geometry") ||
    lower.includes("calculus")
  ) {
    return "skill-card skill-card--math";
  }

  if (
    lower.includes("science") ||
    lower.includes("chemistry") ||
    lower.includes("physics") ||
    lower.includes("biology")
  ) {
    return "skill-card skill-card--science";
  }

  return "skill-card skill-card--default";
}

export default function SkillsPage({ tutorId }) {
  const { auth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [biography, setBiography] = useState("");
  const [skills, setSkills] = useState([emptySkill()]);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const applySkills = (profile) => {
    if (!profile) {
      setSkills([emptySkill()]);
      return;
    }

    const apiSkills = profile.skills;
    if (Array.isArray(apiSkills) && apiSkills.length > 0) {
      setSkills(
        apiSkills.map((item) => {
          const { categoryKey, subcategoryKey } = findCategoryKeysFromLabels(
            item.category,
            item.subcategory
          );

          const { topicKey, name } = resolveTopicFromName(
            categoryKey,
            subcategoryKey,
            item.name
          );

          return {
            categoryKey,
            subcategoryKey,
            topicKey,
            name,
            proficiencyLevel:
              item.proficiencyLevel ?? item.proficiency ?? "",
            experienceNote: item.experienceNote ?? "",
          };
        })
      );
    } else {
      setSkills([emptySkill()]);
    }
  };

  const loadProfile = useCallback(async () => {
    if (!tutorId) return;
    setIsLoading(true);
    setSaveError("");
    setSuccessMessage("");

    try {
      const tutorRes = await getTutorProfile(tutorId);
      setProfileData(tutorRes.data);
      setBiography(tutorRes.data.biography || "");
      applySkills(tutorRes.data);
    } catch (err) {
      setProfileData(null);
      applySkills(null);
    } finally {
      setIsLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    if (tutorId) {
      loadProfile();
    }
  }, [loadProfile, tutorId]);

  const addSkill = () => {
    setSkills([...skills, emptySkill()]);
  };

  const removeSkill = (index) => {
    if (skills.length <= 1) return;
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index, field, value) => {
    const next = [...skills];
    const row = { ...next[index], [field]: value };

    if (field === "categoryKey") {
      row.subcategoryKey = "";
      row.topicKey = "";
      row.name = "";
    }

    if (field === "subcategoryKey") {
      row.topicKey = "";
      row.name = "";
    }

    next[index] = row;
    setSkills(next);
  };

  const updateTopicSelection = (index, topicKey) => {
    setSkills((prev) => {
      const next = [...prev];
      const row = { ...next[index] };
      const topicList = topicsFor(row.categoryKey, row.subcategoryKey);

      if (!topicKey) {
        row.topicKey = "";
        row.name = "";
      } else if (topicKey === CUSTOM_TOPIC) {
        row.topicKey = CUSTOM_TOPIC;
        row.name = "";
      } else {
        const t = topicList.find((x) => x.key === topicKey);
        row.topicKey = topicKey;
        row.name = t?.label ?? "";
      }

      next[index] = row;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSuccessMessage("");

    const skillsPayload = skills
      .filter((row) => row.name.trim())
      .map((row) => {
        const branch = SKILL_BRANCHES.find((b) => b.key === row.categoryKey);
        const area = branch?.areas.find((a) => a.key === row.subcategoryKey);

        return {
          name: row.name.trim(),
          proficiencyLevel: (row.proficiencyLevel || "").trim() || undefined,
          category: branch?.label,
          subcategory: area?.label,
          experienceNote: (row.experienceNote || "").trim() || undefined,
        };
      });

    if (skillsPayload.length === 0) {
      setSaveError(
        "Add at least one skill: choose Academic or Non-academic, an area, and a topic (or Other)."
      );
      return;
    }

    const profilePayload = {
      userId: tutorId,
      biography: biography.trim(), // Keep previous biography if updating
      skills: skillsPayload,
    };

    try {
      if (profileData) {
        await updateTutorProfile(tutorId, profilePayload);
      } else {
        await createTutorProfile(profilePayload);
      }

      setSuccessMessage("Skills saved successfully.");
      await loadProfile();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save skills.");
    }
  };

  if (isLoading) {
    return <p>Loading skills…</p>;
  }

  const listedSkills = skills.filter((skill) => skill.name.trim());

  return (
    <div className="skills-page-premium-wrapper">
      <style>{`
        .skills-page-premium-wrapper {
          padding: 40px;
          min-height: 100vh;
          background: #f4f7f6; /* Matching overall dashboard background */
          font-family: inherit;
        }

        .premium-header {
          margin-bottom: 32px;
        }

        .premium-header h1 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 32px;
          font-weight: 700;
          color: #111;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .premium-header p {
          font-size: 16px;
          color: #666;
          margin: 0;
          max-width: 600px;
          line-height: 1.5;
        }

        .active-skills-container {
          margin-bottom: 48px;
        }

        .section-title {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 28px;
          color: #111;
          margin-bottom: 24px;
          border-left: 5px solid #8ea88d; /* ShareCraft light sage border */
          padding-left: 14px;
        }

        .premium-skill-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1.5px solid #8ea88d; /* Sage border */
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .premium-skill-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(85, 108, 84, 0.1);
          border-color: #3a6b58;
          background: #fbfffb;
        }

        .premium-skill-card h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          color: #111;
          margin: 0 0 8px 0;
        }

        .badge-proficiency {
          display: inline-block;
          background: #e3ffe2; /* ShareCraft very light pastel green */
          color: #3a6b58;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-container {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1.5px solid rgba(85, 108, 84, 0.15); /* Light sage border */
        }

        .form-entry-block {
          background: #fafcfa;
          border: 1px solid #d2e0d1;
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 24px;
          transition: all 0.2s ease;
        }

        .form-entry-block:hover {
          border-color: #bad9b9;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(85, 108, 84, 0.05);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }
        
        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .premium-select, .premium-input, .premium-textarea {
          width: 100%;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1.5px solid #d2e0d1;
          background: #f9fbf9;
          color: #222;
          font-size: 16px;
          transition: all 0.2s ease;
          outline: none;
          font-family: Georgia, "Times New Roman", serif;
        }

        .premium-select:focus, .premium-input:focus, .premium-textarea:focus {
          border-color: #8ea88d;
          background: white;
          box-shadow: 0 0 0 3px rgba(142, 168, 141, 0.18);
        }

        .btn {
          cursor: pointer;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 600;
          border-radius: 14px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-remove {
          background: #fff;
          color: #a12727;
          border: 1.5px solid #ebbcbc;
          padding: 10px 18px;
          margin-top: 20px;
          font-size: 15px;
        }

        .btn-remove:hover {
          background: #fff0f0;
        }

        .btn-add {
          background: rgba(186, 217, 185, 0.15); /* Soft sage */
          color: #3a6b58;
          border: 2px dashed #8ea88d;
          width: 100%;
          padding: 20px;
          font-size: 17px;
        }

        .btn-add:hover {
          background: rgba(186, 217, 185, 0.3);
          border-color: #3a6b58;
        }

        .btn-save {
          background: #bad9b9;
          color: #111;
          border: 1.5px solid #8ea88d;
          padding: 16px 32px;
          font-size: 19px;
          width: 100%;
          margin-top: 32px;
          box-shadow: 0 4px 12px rgba(186, 217, 185, 0.3);
        }

        .btn-save:hover {
          background: #a8cdac;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(186, 217, 185, 0.4);
        }

        .alert {
          padding: 16px;
          border-radius: 12px;
          margin-top: 24px;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 500;
        }
        .alert-success { background: #e3ffe2; color: #2a5a29; border: 1.5px solid rgba(85, 108, 84, 0.45); }
        .alert-error { background: #fff0f1; color: #a12727; border: 1.5px solid #ebbcbc; }
        
        .skills-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        
        .empty-state {
          padding: 40px;
          text-align: center;
          background: #f4f7f6;
          border-radius: 16px;
          color: #697f65;
          border: 1.5px dashed #8ea88d;
          font-family: Georgia, "Times New Roman", serif;
        }
      `}</style>

      <div className="premium-header">
        <h1>My Skills Library</h1>
        <p>Curate your active skills, define your expertise levels, and showcase exactly what you bring to the table.</p>
      </div>

      <div className="active-skills-container">
        <h2 className="section-title">Current Active Skills</h2>
        {listedSkills.length > 0 ? (
          <div className="skills-grid-modern">
            {listedSkills.map((skill, index) => (
              <div key={`${skill.name}-${index}`} className="premium-skill-card">
                <h3>{skill.name}</h3>
                {skill.proficiencyLevel && (
                  <span className="badge-proficiency">{skill.proficiencyLevel}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't listed any skills yet. Start adding them below!</p>
          </div>
        )}
      </div>

      <div className="form-container">
        <h2 className="section-title">Update Your Toolset</h2>
        <form onSubmit={handleSubmit}>
          {skills.map((row, index) => {
            const areas = areasForBranch(row.categoryKey);
            const topicList = topicsFor(row.categoryKey, row.subcategoryKey);

            return (
              <div key={index} className="form-entry-block">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Broad Category</label>
                    <select
                      className="premium-select"
                      value={row.categoryKey}
                      onChange={(e) => updateSkill(index, "categoryKey", e.target.value)}
                    >
                      <option value="">Choose classification...</option>
                      {SKILL_BRANCHES.map((b) => (
                        <option key={b.key} value={b.key}>{b.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Skill Area</label>
                    <select
                      className="premium-select"
                      value={row.subcategoryKey}
                      onChange={(e) => updateSkill(index, "subcategoryKey", e.target.value)}
                      disabled={!row.categoryKey}
                    >
                      <option value="">Select specific area...</option>
                      {areas.map((a) => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field full-width">
                    <label>Specific Topic</label>
                    <select
                      className="premium-select"
                      value={topicList.some((t) => t.key === row.topicKey) ? row.topicKey : (row.topicKey === CUSTOM_TOPIC ? CUSTOM_TOPIC : "")}
                      onChange={(e) => updateTopicSelection(index, e.target.value)}
                      disabled={!row.subcategoryKey}
                    >
                      <option value="">Select exact topic...</option>
                      {topicList.map((t) => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                      <option value={CUSTOM_TOPIC}>Topic missing? Specify other...</option>
                    </select>
                  </div>

                  {row.topicKey === CUSTOM_TOPIC && row.subcategoryKey && (
                    <div className="form-field full-width">
                      <label>Define custom topic name</label>
                      <input
                        type="text"
                        className="premium-input"
                        placeholder="e.g. Advanced Quantum Mechanics"
                        value={row.name}
                        onChange={(e) => updateSkill(index, "name", e.target.value)}
                      />
                    </div>
                  )}

                  <div className="form-field">
                    <label>Your Proficiency</label>
                    <select
                      className="premium-select"
                      value={row.proficiencyLevel}
                      onChange={(e) => updateSkill(index, "proficiencyLevel", e.target.value)}
                    >
                      {PROFICIENCY_OPTIONS.map((o) => (
                        <option key={o.value || "empty"} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Experience Note (Optional)</label>
                    <textarea
                      className="premium-textarea"
                      rows={1}
                      placeholder="Brief context on your experience"
                      value={row.experienceNote}
                      onChange={(e) => updateSkill(index, "experienceNote", e.target.value)}
                    />
                  </div>
                </div>

                <button type="button" className="btn btn-remove" onClick={() => removeSkill(index)}>
                  Remove Skill Entry
                </button>
              </div>
            );
          })}

          <button type="button" className="btn btn-add" onClick={addSkill}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Another Skill
          </button>

          <button type="submit" className="btn btn-save">
            Save Skills Portfolio
          </button>
        </form>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {saveError && <div className="alert alert-error">{saveError}</div>}
      </div>
    </div>
  );
}
