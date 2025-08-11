import React, { useEffect, useState } from "react";
import "./TimetablePage.css";

const getColorForText = (text) => {
  if (!text) return "#fff";
  const colors = [
    "#fce4ec", "#e8f5e9", "#e3f2fd", "#fff9c4",
    "#f3e5f5", "#ffe0b2", "#dcedc8", "#b2ebf2",
    "#ffccbc", "#d1c4e9", "#c8e6c9", "#f0f4c3",
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const defaultTimes = ["08:00", "09:00", "10:00", "11:00"];
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TimetablePage = () => {
  const [timeSlots, setTimeSlots] = useState(() => {
    return JSON.parse(localStorage.getItem("timeSlots")) || defaultTimes;
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("timetable"));
    if (!saved) return {};

    const migrated = {};
    for (const key in saved) {
      if (typeof saved[key] === "string") {
        migrated[key] = { value: saved[key], height: "auto" };
      } else {
        migrated[key] = saved[key];
      }
    }
    return migrated;
  });

  useEffect(() => {
    localStorage.setItem("timetable", JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem("timeSlots", JSON.stringify(timeSlots));
  }, [timeSlots]);

  const handleCellChange = (day, time, value, height) => {
    const newTimetable = {
      ...timetable,
      [`${day}-${time}`]: { value, height }
    };
    setTimetable(newTimetable);
  };

  const addTimeSlot = () => {
    const nextHour = timeSlots.length + 8;
    const newTime = `${nextHour.toString().padStart(2, "0")}:00`;
    setTimeSlots([...timeSlots, newTime]);
  };

  const removeTimeSlot = () => {
    if (timeSlots.length <= defaultTimes.length) {
      alert("You cannot remove default time slots.");
      return;
    }

    const updatedSlots = [...timeSlots];
    const removed = updatedSlots.pop();

    const updatedTimetable = { ...timetable };
    weekdays.forEach((day) => {
      const key = `${day}-${removed}`;
      delete updatedTimetable[key];
    });

    setTimeSlots(updatedSlots);
    setTimetable(updatedTimetable);
  };

  const handleTimeSlotEdit = (index, newValue) => {
    const trimmedValue = newValue.trim();
    if (!trimmedValue || timeSlots.includes(trimmedValue)) return;

    const oldTime = timeSlots[index];
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index] = trimmedValue;

    // Update timetable keys
    const updatedTimetable = {};
    for (const key in timetable) {
      if (key.includes(`-${oldTime}`)) {
        const newKey = key.replace(`-${oldTime}`, `-${trimmedValue}`);
        updatedTimetable[newKey] = timetable[key];
      } else {
        updatedTimetable[key] = timetable[key];
      }
    }

    setTimeSlots(newTimeSlots);
    setTimetable(updatedTimetable);
  };

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <h2>Weekly Timetable</h2>
        <div className="btn-group">
          <button className="add-slot-btn" onClick={addTimeSlot}>➕ Add Time Slot</button>
          <button className="remove-slot-btn" onClick={removeTimeSlot}>➖ Remove Time Slot</button>
        </div>
      </div>

      <div className="timetable-scroll">
        <table className="timetable">
          <thead>
            <tr>
              <th>Day</th>
              {timeSlots.map((time, index) => (
                <th key={time}>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTimeSlotEdit(index, e.target.innerText)}
                    style={{ cursor: "text", display: "inline-block", minWidth: "60px" }}
                  >
                    {time}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekdays.map((day) => (
              <tr key={day}>
                <td className="day-label">{day}</td>
                {timeSlots.map((time) => {
                  const key = `${day}-${time}`;
                  const { value, height } = timetable[key] || { value: "", height: "auto" };
                  const bgColor = getColorForText(value);

                  return (
                    <td key={key} style={{ backgroundColor: bgColor }}>
                      <textarea
                        value={value}
                        style={{ height }}
                        onChange={(e) => {
                          const el = e.target;
                          el.style.height = "auto";
                          el.style.height = el.scrollHeight + "px";
                          handleCellChange(day, time, el.value, el.style.height);
                        }}
                        rows={1}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetablePage;
