import { useEffect, useState } from "react";
import "./StudentCalendar.css";

function StudentCalendar() {
  const [assignments, setAssignments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 🔥 LOAD ASSIGNMENTS (AUTO REFRESH)
  useEffect(() => {
    const loadAssignments = () => {
      fetch("https://fsd-project-bd.onrender.com/assignments")
        .then((res) => res.json())
        .then((data) => {
          console.log("Assignments:", data); // debug
          setAssignments(data);
        })
        .catch((err) =>
          console.error("Error fetching assignments:", err)
        );
    };

    loadAssignments();

    // 🔥 Auto refresh every 3 sec
    const interval = setInterval(loadAssignments, 3000);

    return () => clearInterval(interval);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long"
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year &&
    today.getMonth() === month;

  // 🔥 FIXED DATE PARSING
  const getAssignmentsForDay = (day) => {
    return assignments.filter((a) => {
      const rawDate = a.deadline || a.dueDate;

      if (!rawDate) return false;

      // 🔥 FIX: avoid timezone issues
      const date = new Date(rawDate + "T00:00:00");

      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarDays = [];

  // Empty cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="day-cell empty"></div>
    );
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayAssignments = getAssignmentsForDay(day);

    calendarDays.push(
      <div
        key={day}
        className={`day-cell ${
          isCurrentMonth && today.getDate() === day ? "today" : ""
        }`}
      >
        <span className="day-number">{day}</span>

        <div className="day-events">
          {dayAssignments.map((a) => (
            <div key={a.id} className="event-pill">
              {a.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <header className="page-header">
        <h1>Calendar</h1>
        <p>View your assignments schedule</p>
      </header>

      <div className="calendar-layout">
        <section className="calendar-main">
          <div className="calendar-card">

            {/* NAVIGATION */}
            <div className="calendar-nav">
              <button onClick={goToPreviousMonth}>◀</button>
              <h2>{monthName} {year}</h2>
              <button onClick={goToNextMonth}>▶</button>
            </div>

            {/* WEEKDAYS */}
            <div className="weekday-header">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="calendar-grid">
              {calendarDays}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}

export default StudentCalendar;