import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import welcomeAnimation from "../assets/Education edit.json";
import "./WelcomePage.css";

const quotes = [
  "Discipline is the bridge between goals and accomplishment.",
  "Push yourself, because no one else is going to do it for you.",
  "Success doesn’t just find you. You have to go out and get it.",
  "Study hard, stay consistent, and trust the process.",
  "Each day is a chance to get better. Don't waste it."
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="welcome-darkpage">
      <div className="stars-background" />

      <div className="text-container">
        <h1 className="title-top">Synaptica 🧠</h1>
        <p className="bright-subheading">Smart learning starts here</p>
        <p className="quote">"{quotes[quoteIndex]}"</p>

        <button className="start-btn" onClick={() => navigate("/login")}>
          Get Started →
        </button>
      </div>

      <div className="lottie-section">
        <Lottie animationData={welcomeAnimation} loop={true} className="welcome-lottie" />
      </div>
    </div>
  );
};

export default WelcomePage;
