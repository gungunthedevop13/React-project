import React, { useState, useEffect, useRef } from "react";
import './ProfilePage.css';


const STORAGE_KEY = "profileData";

const defaultUser = {
  name: "",
  title: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  bio: "",
  avatar: "https://via.placeholder.com/130?text=Avatar",
  social: {
    linkedin: "",
    twitter: "",
    github: "",
  },
};

const ProfilePage = () => {
  const [user, setUser] = useState(defaultUser);
  const [savedUser, setSavedUser] = useState(defaultUser);
  const [savedMessage, setSavedMessage] = useState("");
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const mergedUser = {
        ...defaultUser,
        ...parsed,
        social: {
          ...defaultUser.social,
          ...(parsed.social || {}),
        },
      };
      setUser(mergedUser);
      setSavedUser(mergedUser);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined })); // clear error on change

    if (name.startsWith("social.")) {
      const key = name.split(".")[1];
      setUser((prev) => ({
        ...prev,
        social: { ...prev.social, [key]: value },
      }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = "Invalid email address";
    }
    if (user.website && !/^https?:\/\/.+/.test(user.website)) {
      newErrors.website = "Website must start with http:// or https://";
    }

    // Validate social URLs (if not empty)
    Object.entries(user.social).forEach(([key, val]) => {
      if (val && !/^https?:\/\/.+/.test(val)) {
        newErrors[`social.${key}`] = "Must be a valid URL starting with http:// or https://";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setSavedUser(user);
    setSavedMessage("Profile saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleReset = () => {
    setUser(savedUser);
    setErrors({});
    setSavedMessage("Changes reverted.");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setUser((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop avatar upload handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setUser((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="profile-container" role="main">
      <header className="profile-header">
        <div
          className="profile-avatar-wrapper"
          onClick={handleAvatarClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          aria-label="Drag and drop to upload avatar or click to select"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleAvatarClick()}
        >
          <img src={user.avatar} alt="User avatar" className="profile-avatar" />
          <button
            type="button"
            className="profile-avatar-button"
            onClick={handleAvatarClick}
            aria-label="Update profile picture"
          >
            Update Picture
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="profile-name-title">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={user.name}
            onChange={handleChange}
            className="profile-input profile-input-name"
            aria-label="Full Name"
          />
          <input
            type="text"
            name="title"
            placeholder="Professional Title"
            value={user.title}
            onChange={handleChange}
            className="profile-input profile-input-title"
            aria-label="Professional Title"
          />
        </div>
      </header>

      <section className="profile-section">
        <h2 className="profile-section-title">Contact Info</h2>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={user.email}
          onChange={handleChange}
          className={`profile-input ${errors.email ? "input-error" : ""}`}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <small className="error-text" id="email-error">
            {errors.email}
          </small>
        )}

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={user.phone}
          onChange={handleChange}
          className="profile-input"
          aria-label="Phone Number"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={user.location}
          onChange={handleChange}
          className="profile-input"
          aria-label="Location"
        />

        <input
          type="url"
          name="website"
          placeholder="Website URL"
          value={user.website}
          onChange={handleChange}
          className={`profile-input ${errors.website ? "input-error" : ""}`}
          aria-invalid={errors.website ? "true" : "false"}
          aria-describedby={errors.website ? "website-error" : undefined}
        />
        {errors.website && (
          <small className="error-text" id="website-error">
            {errors.website}
          </small>
        )}
      </section>

      <section className="profile-section">
        <h2 className="profile-section-title">About Me</h2>
        <textarea
          name="bio"
          placeholder="Write a short bio..."
          value={user.bio}
          onChange={handleChange}
          className="profile-textarea"
          maxLength={300}
          aria-label="Write a short bio"
        />
        <small className="char-count">{user.bio.length} / 300 characters</small>
      </section>

      <section className="profile-section">
        <h2 className="profile-section-title">Social Profiles</h2>
        {["linkedin", "twitter", "github"].map((key) => (
          <div key={key} className="social-input-wrapper">
            <input
              type="url"
              name={`social.${key}`}
              placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
              value={user.social[key]}
              onChange={handleChange}
              className={`profile-input ${errors[`social.${key}`] ? "input-error" : ""}`}
              aria-invalid={errors[`social.${key}`] ? "true" : "false"}
              aria-describedby={errors[`social.${key}`] ? `${key}-error` : undefined}
            />
            {errors[`social.${key}`] && (
              <small className="error-text" id={`${key}-error`}>
                {errors[`social.${key}`]}
              </small>
            )}
          </div>
        ))}
      </section>

      <div className="profile-buttons">
        <button className="profile-save-button" onClick={handleSave} aria-label="Save Profile">
          Save Profile
        </button>
        <button
          className="profile-reset-button"
          onClick={handleReset}
          aria-label="Reset Changes"
          type="button"
        >
          Reset
        </button>
      </div>

      {savedMessage && <p className="profile-saved-message">{savedMessage}</p>}
    </div>
  );
};

export default ProfilePage;
