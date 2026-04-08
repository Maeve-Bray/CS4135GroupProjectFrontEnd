import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
} from "../api/studentAPI";
import { getMyProfile, updateMyProfile } from "../api/authAPI";

const AUTH_STORAGE_KEY = "auth";

const resolveName = (auth) =>
  auth?.name || auth?.fullName || auth?.email?.split("@")[0] || "Your Name";

function StudentProfile() {
  const { auth, setAuth } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [name, setName] = useState(resolveName(auth));
  const [bio, setBio] = useState("");

  const displayRole =
    auth?.role === "STUDENT"
      ? "Student"
      : auth?.role === "TUTOR"
      ? "Tutor"
      : auth?.role;

  const displayStatus = auth?.status || "Active";

 const loadProfile = async () => {
  if (!auth?.userId) return;

  setIsLoading(true);

  try {
    const [userRes, studentRes] = await Promise.all([
      getMyProfile(auth.userId),
      getStudentProfile(auth.userId),
    ]);

    setName(
      userRes.data.name ||
      userRes.data.email?.split("@")[0] ||
      "Your Name"
    );

    setBio(studentRes.data.biography || "");
    setProfileExists(true);

    if (typeof setAuth === "function") {
      setAuth((prev) => ({
        ...prev,
        ...userRes.data,
      }));
    }
  } catch (err) {
    if (err.response?.status === 404) {
      try {
        const userRes = await getMyProfile(auth.userId);

        setName(
          userRes.data.name ||
          userRes.data.email?.split("@")[0] ||
          "Your Name"
        );

        if (typeof setAuth === "function") {
          setAuth((prev) => ({
            ...prev,
            ...userRes.data,
          }));
        }
      } catch (userErr) {
        console.error("Error loading user profile", userErr);
      }

      setBio("");
      setProfileExists(false);
    } else {
      console.error("Error loading student profile", err);
    }
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    setName(resolveName(auth));
  }, [auth?.name, auth?.fullName, auth?.email]);

  useEffect(() => {
    if (auth?.userId) {
      loadProfile();
    }
  }, [auth?.userId]);

  const handleSave = async () => {
    setSaveError("");
    setSuccessMessage("");

    try {
      const trimmedName = name.trim();
      const trimmedBio = bio.trim();

      if (!trimmedName) {
        setSaveError("Name cannot be empty.");
        return;
      }

      const authRes = await updateMyProfile(auth.userId, {
        name: trimmedName,
      });

      const studentPayload = {
        userId: auth.userId,
        biography: trimmedBio,
      };

      if (profileExists) {
        await updateStudentProfile(auth.userId, studentPayload);
      } else {
        await createStudentProfile(studentPayload);
        setProfileExists(true);
      }

      const nextAuth = {
        ...auth,
        ...authRes.data,
        name: trimmedName,
      };

      if (typeof setAuth === "function") {
        setAuth(nextAuth);
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));

      setName(trimmedName);
      setBio(trimmedBio);
      setSuccessMessage("Profile updated.");
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save profile.");
    }
  };

  const handleCancel = () => {
    setName(resolveName(auth));
    setSaveError("");
    setSuccessMessage("");
    loadProfile();
    setIsEditing(false);
  };

  if (isLoading) {
    return <p>Loading profile…</p>;
  }

  const displayName = resolveName(auth);

  return (
    <section className="profile-page">
      <h1 className="brand-title">ShareCraft</h1>

      <div className="profile-content">
        <div className="profile-row">
          <span className="profile-label">Name:</span>

          {isEditing ? (
            <input
              type="text"
              className="profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <span className="profile-value">{name}</span>
          )}
        </div>

        <div className="profile-row">
          <span className="profile-label">Role:</span>
          <span className="profile-value">{displayRole}</span>
        </div>

        <div className="profile-row profile-row--bio">
          <span className="profile-label">Bio:</span>

          {isEditing ? (
            <textarea
              className="profile-textarea"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          ) : (
            <div className="bio-box">
              {bio || "Add a short bio about yourself and what you want to learn."}
            </div>
          )}
        </div>

        <div className="profile-row">
          <span className="profile-label">Account status:</span>
          <span className="profile-value">{displayStatus}</span>
        </div>

        {isEditing ? (
          <div className="profile-actions">
            <button
              type="button"
              className="save-profile-button"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              type="button"
              className="cancel-profile-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="edit-profile-button"
            onClick={() => setIsEditing(true)}
          >
            Edit profile
          </button>
        )}

        {successMessage && <p className="success-text">{successMessage}</p>}
        {saveError && <p className="error-text">{saveError}</p>}
      </div>
    </section>
  );
}

export default StudentProfile;