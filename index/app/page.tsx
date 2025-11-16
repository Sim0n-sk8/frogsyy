"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
// FIX 1: Import Calendar correctly (Value is not exported directly)
import Calendar from "react-calendar";
// Import the type separately
import type { Value } from "react-calendar/dist/cjs/shared/types"; 
import jsPDF from "jspdf";
import "react-calendar/dist/Calendar.css";
// NOTE: Make sure './globals.css' exists and includes the necessary styles
import "./globals.css";

const images = [
  "frg0.png", "frg1.png", "frg2.png", "frg3.png", "frg4.png",
  "frg5.png", "frg6.png", "frg7.png", "frg8.png", "frg9.png", "frg10.png"
];

const STORAGE_KEY = "pain_tracker_entries";

type EntryMap = {
  [date: string]: { number: number; timestamp: number };
};

// Helper to get YYYY-MM-DD in local time
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const [selected, setSelected] = useState<number | null>(null);
  const [entries, setEntries] = useState<EntryMap>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate(new Date()));

  const numbers = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [9, 10, "Upload"]
  ];

  const messages: Record<number, string> = {
    0: "YAAAAYYYY", 1: "Feeling pretty good!", 2: "Nice, a little twinge maybe?",
    3: "Hmm, mild discomfort", 4: "Getting uncomfortable...", 5: "Average day",
    6: "Ouch, that hurts", 7: "Pretty painful!", 8: "Yikes, difficult day",
    9: "Really bad pain!", 10: "AHHH, emergency level!"
  };

  // Load entries from localStorage
  const loadEntries = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setEntries(JSON.parse(stored));
  };

  const saveEntries = (data: EntryMap) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    loadEntries();
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const upload = () => {
    if (selected === null) return;
    const today = formatLocalDate(new Date());
    const updated = { ...entries, [today]: { number: selected, timestamp: Date.now() } };
    setEntries(updated);
    saveEntries(updated);
    alert(messages[selected] || "Entry saved!");
  };

  const emergencyCall = () => {
    window.location.href = "tel:0617083179";
  };

  const handlePrintCalendar = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    let y = 10;
    doc.text("Pain Tracker Calendar", 10, y);
    y += 10;
    Object.entries(entries)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .forEach(([date, entry]) => {
        doc.text(`${date} - Pain: ${entry.number}`, 10, y);
        y += 10;
      });
    doc.save("pain_calendar.pdf");
  };

  if (showCalendar) {
    const today = formatLocalDate(new Date());
    const selectedEntry = entries[selectedDate];
    
    // Set Calendar value to Date object for proper highlighting
    const calendarValue = new Date(selectedDate);
    
    return (
      <div className="calendar-page">
        <button className="back-button" onClick={() => setShowCalendar(false)}>Back</button>
        <h2>{selectedDate === today ? "Today" : new Date(selectedDate).toDateString()}</h2>
        <h3>Pain Level: {selectedEntry?.number ?? "-"}</h3>

        <Calendar
          value={calendarValue} // Use the Date object
          onChange={(
            value: Value, // Use the imported Value type
            event: React.MouseEvent<HTMLButtonElement>
          ) => {
            // FIX 2: Use formatLocalDate to ensure the date key matches the storage key format (YYYY-MM-DD local time)
            if (value instanceof Date) {
              setSelectedDate(formatLocalDate(value));
            } else if (Array.isArray(value) && value[0] instanceof Date) {
              // Take the first date in a range
              setSelectedDate(formatLocalDate(value[0]));
            }
          }}
          tileContent={({ date }) => {
            // FIX 3: Use formatLocalDate to ensure the date key matches the storage key format
            const dateKey = formatLocalDate(date);
            const entry = entries[dateKey];
            return entry ? <div className="calendar-entry">{entry.number}</div> : null;
          }}
        />

        <button className="print-button" onClick={handlePrintCalendar}>Print Calendar</button>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="top">
        {selected !== null ? (
          <>
            <motion.img
              src={images[selected]}
              className="frg"
              alt="feeling"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <div className="selectedBox">{selected}</div>
          </>
        ) : (
          <h2>How are we feeling today?</h2>
        )}
      </div>

      <div className="grid">
        {numbers.map((row, i) => (
          <div key={i} className="row">
            {row.map((item) =>
              item === "Upload" ? (
                <motion.button
                  key="upload"
                  className="upload"
                  onClick={upload}
                  whileTap={{ scale: 0.95 }}
                >
                  Upload
                </motion.button>
              ) : (
                <motion.button
                  key={item}
                  className={`btn ${selected === item ? "active" : ""}`}
                  onClick={() => setSelected(item as number)}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.button>
              )
            )}
          </div>
        ))}
      </div>

      <div className="bottom-buttons">
        <button className="calendar-btn" onClick={() => setShowCalendar(true)}>Calendar</button>
        <button className="emergency-btn" onClick={emergencyCall}>Emergency</button>
      </div>
    </div>
  );
}