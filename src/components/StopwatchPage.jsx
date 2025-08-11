import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./StopwatchPage.css";

const StopwatchPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60).toString().padStart(2, "0");
    const secsRem = (secs % 60).toString().padStart(2, "0");
    return `${mins}:${secsRem}`;
  };

  const startStopwatch = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopStopwatch = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const resetStopwatch = () => {
    stopStopwatch();
    setElapsedSeconds(0);
  };

  return (
    <div className="stopwatch-container">
      <h1>⏱ Manual Countdown</h1>
      <div className="time-display">{formatTime(elapsedSeconds)}</div>
      <div className="controls">
        <button onClick={startStopwatch} disabled={isRunning}>Start</button>
        <button onClick={stopStopwatch} disabled={!isRunning}>Stop</button>
        <button onClick={resetStopwatch}>Reset</button>
      </div>
      <button className="back-button" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default StopwatchPage;
