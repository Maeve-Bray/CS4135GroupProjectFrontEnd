import { useCallback, useEffect, useState } from "react";
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

export default function TutorProfile({ tutorId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [biography, setBiography] = useState("");
  const [skills, setSkills] = useState([emptySkill()]);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const applyProfile = (profile) => {
    if (!profile) {
      setBiography("");
      setSkills([emptySkill()]);
      return;
    }
    setBiography(profile.biography ?? "");
    const apiSkills = profile.skills;
    if (Array.isArray(apiSkills) && apiSkills.length > 0) {
      setSkills(
        apiSkills.map((item) => {
          const { categoryKey, subcategoryKey } = findCategoryKeysFromLabels(
            item.category,
            item.subcategory,
          );
          const { topicKey, name } = resolveTopicFromName(
            categoryKey,
            subcategoryKey,
            item.name,
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
        }),
      );
    } else {
      setSkills([emptySkill()]);
    }
  };

  const loadProfile = useCallback(async () => {
    if (!tutorId) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await getTutorProfile(tutorId);
      setProfileData(res.data);
      applyProfile(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileData(null);
        applyProfile(null);
      } else {
        console.error("Error loading tutor profile", err);
        setLoadError("Unable to load profile right now.");
        setProfileData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
        "Add at least one skill: choose Academic or Non-academic, an area, and a topic (or Other).",
      );
      return;
    }

    const profilePayload = {
      userId: tutorId,
      biography: biography.trim(),
      skills: skillsPayload,
    };

    try {
      if (profileData) {
        await updateTutorProfile(tutorId, profilePayload);
      } else {
        await createTutorProfile(profilePayload);
      }
      setSuccessMessage("Profile saved successfully :).");
      await loadProfile();
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save profile.");
    }
  };

  if (isLoading) {
    return <p>Loading profile…</p>;
  }

  if (loadError) {
    return <p className="error-text">{loadError}</p>;
  }

  return (
    <div className="tutor-profile-page">
      <h2>My Tutor Profile</h2>

      {profileData && (
        <p style={{ marginBottom: "16px" }}>
          <strong>Verification status:</strong>{" "}
          {profileData.verificationStatus ?? "UNKNOWN"}
          {profileData.averageRating != null && (
            <>
              {" "}
              · <strong>Average rating:</strong> {profileData.averageRating}
            </>
          )}
        </p>
      )}

      {!profileData && (
        <p style={{ marginBottom: "12px" }}>
          You do not have a tutor profile yet. Add your details below.
        </p>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label style={{ display: "block", width: "100%", marginBottom: "12px" }}>
          Biography
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            rows={4}
            style={{ display: "block", width: "100%", marginTop: "6px" }}
            placeholder="Tell students about your experience and teaching style!"
          />
        </label>

        <div style={{ marginBottom: "12px" }}>
          <strong>Skills</strong>
          {skills.map((row, index) => {
            const areas = areasForBranch(row.categoryKey);
            const topicList = topicsFor(row.categoryKey, row.subcategoryKey);

            return (
              <div key={index} className="tutor-profile-skill-block">
                <div className="tutor-profile-skill-grid">
                  <label>
                    Category
                    <select
                      value={row.categoryKey}
                      onChange={(e) =>
                        updateSkill(index, "categoryKey", e.target.value)
                      }
                    >
                      <option value="">Academic or Non-academic</option>
                      {SKILL_BRANCHES.map((b) => (
                        <option key={b.key} value={b.key}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Subcategory
                    <select
                      value={row.subcategoryKey}
                      onChange={(e) =>
                        updateSkill(index, "subcategoryKey", e.target.value)
                      }
                      disabled={!row.categoryKey}
                    >
                      <option value="">Select skill area</option>
                      {areas.map((a) => (
                        <option key={a.key} value={a.key}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="tutor-profile-skill-span2">
                    Specific topic
                    <select
                      value={
                        topicList.some((t) => t.key === row.topicKey)
                          ? row.topicKey
                          : row.topicKey === CUSTOM_TOPIC
                            ? CUSTOM_TOPIC
                            : ""
                      }
                      onChange={(e) =>
                        updateTopicSelection(index, e.target.value)
                      }
                      disabled={!row.subcategoryKey}
                    >
                      <option value="">Select topic</option>
                      {topicList.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                      <option value={CUSTOM_TOPIC}>Other (type below)</option>
                    </select>
                  </label>
                  {row.topicKey === CUSTOM_TOPIC && row.subcategoryKey && (
                    <label className="tutor-profile-skill-span2">
                      Describe your topic
                      <input
                        type="text"
                        placeholder="e.g. a topic not listed above"
                        value={row.name}
                        onChange={(e) =>
                          updateSkill(index, "name", e.target.value)
                        }
                      />
                    </label>
                  )}
                  <label>
                    Proficiency
                    <select
                      value={row.proficiencyLevel}
                      onChange={(e) =>
                        updateSkill(
                          index,
                          "proficiencyLevel",
                          e.target.value,
                        )
                      }
                    >
                      {PROFICIENCY_OPTIONS.map((o) => (
                        <option key={o.value || "empty"} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="tutor-profile-skill-span2">
                    Experience note (optional)
                    <textarea
                      rows={2}
                      placeholder="Optional context"
                      value={row.experienceNote}
                      onChange={(e) =>
                        updateSkill(index, "experienceNote", e.target.value)
                      }
                    />
                  </label>
                </div>
                <button type="button" onClick={() => removeSkill(index)}>
                  Remove skill
                </button>
              </div>
            );
          })}
          <button type="button" onClick={addSkill} style={{ marginTop: "8px" }}>
            Add skill
          </button>
        </div>

        <button type="submit">
          {profileData ? "Update profile" : "Create profile"}
        </button>
      </form>

      {successMessage && (
        <p style={{ marginTop: "12px" }}>{successMessage}</p>
      )}
      {saveError && (
        <p style={{ marginTop: "12px" }} className="error-text">
          {saveError}
        </p>
      )}
    </div>
  );
}
