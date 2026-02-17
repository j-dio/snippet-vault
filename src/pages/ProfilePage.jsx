import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Save, User } from "lucide-react";
import { languageOptions } from "../constants/languages";
import toast from "react-hot-toast";
import styles from "./ProfilePage.module.css";

function ProfilePage() {
  const { session, user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [preferredLanguages, setPreferredLanguages] = useState(
    profile?.preferred_languages || []
  );
  const [saving, setSaving] = useState(false);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const toggleLanguage = (lang) => {
    setPreferredLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await updateProfile({
      display_name: displayName || null,
      username: username || null,
      bio: bio || null,
      preferred_languages: preferredLanguages,
    });

    if (error) {
      if (error.message?.includes("duplicate") || error.code === "23505") {
        toast.error("Username is already taken");
      } else {
        toast.error("Failed to update profile");
      }
    } else {
      toast.success("Profile updated!");
    }

    setSaving(false);
  };

  return (
    <main className={styles.container} role="main">
      <div className={styles.card}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/")}
            aria-label="Back to vault"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <h1>Profile</h1>
        </div>

        <div className={styles.avatarSection}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile avatar"
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <User size={32} />
            </div>
          )}
          <p className={styles.email}>{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              placeholder="How you want to be known"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              pattern="^[a-zA-Z0-9_-]+$"
              title="Letters, numbers, hyphens, and underscores only"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <span className={styles.charCount}>{bio.length}/200</span>
          </div>

          <div className={styles.field}>
            <label>Preferred Languages</label>
            <div className={styles.languageGrid}>
              {languageOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.languageChip} ${
                    preferredLanguages.includes(value)
                      ? styles.languageChipActive
                      : ""
                  }`}
                  onClick={() => toggleLanguage(value)}
                  aria-pressed={preferredLanguages.includes(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? "Saving..." : "Save Profile"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}

export default ProfilePage;
