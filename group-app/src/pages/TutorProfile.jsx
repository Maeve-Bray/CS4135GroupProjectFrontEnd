import { useCallback, useEffect, useState } from "react";
import {
  createTutorProfile,
  getTutorProfile,
  updateTutorProfile,
} from "../api/tutorAPI";

export default function TutorProfile({ tutorId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [biography, setBiography] = useState("");
  const [skills, setSkills] = useState([{ name: "", proficiencyLevel: "" }]);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const applyProfile = (profile) => {
    if (!profile) {
      setBiography("");
      setSkills([{ name: "", proficiencyLevel: "" }]);
      return;
    }
    setBiography(profile.biography ?? "");
    const apiSkills = profile.skills;
    if (Array.isArray(apiSkills) && apiSkills.length > 0) {
      setSkills(
        apiSkills.map((item) => ({
          name: item.name ?? "",
          proficiencyLevel:
            item.proficiencyLevel ?? item.proficiency ?? "",
        }))
      );
    } else {
      setSkills([{ name: "", proficiencyLevel: "" }]);
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
    setSkills([...skills, { name: "", proficiencyLevel: "" }]);
  };

  const removeSkill = (index) => {
    if (skills.length <= 1) return;
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index, field, value) => {
    const next = [...skills];
    next[index] = { ...next[index], [field]: value };
    setSkills(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSuccessMessage("");

    const skillsPayload = skills
      .filter((row) => row.name.trim())
      .map((row) => ({
        name: row.name.trim(),
        proficiencyLevel: (row.proficiencyLevel || "").trim() || undefined,
      }));

    if (skillsPayload.length === 0) {
      setSaveError("Add at least one skill with a proficiency level and name.");
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
    <div>
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
          {skills.map((row, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "8px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Skill name"
                value={row.name}
                onChange={(e) => updateSkill(index, "name", e.target.value)}
              />
              <input
                type="text"
                placeholder="Proficiency (e.g. Advanced)"
                value={row.proficiencyLevel}
                onChange={(e) =>
                  updateSkill(index, "proficiencyLevel", e.target.value)
                }
              />
              <button type="button" onClick={() => removeSkill(index)}>
                Remove
              </button>
            </div>
          ))}
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
