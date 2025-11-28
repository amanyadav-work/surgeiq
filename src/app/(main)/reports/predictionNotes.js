const notes = [
  "Surge days detected! Consider increasing staff and supplies.",
  "No major surges predicted. Maintain regular operations.",
  "Upcoming events may cause spikes. Prepare advisory for patients.",
  "AQI and temperature trends suggest possible respiratory cases.",
  "Holiday/event detected, expect higher patient inflow.",
  "Stable conditions, but monitor for unexpected changes.",
  "Multiple surges in short period, review emergency protocols."
];

export function getPredictionNote(data) {
  if (!data || !data.surge_days) return notes[1];
  if (data.surge_days.length === 0) return notes[1];
  if (data.surge_days.length > 5) return notes[6];
  if (data.surge_days.length > 0 && data.surge_days.length <= 2) return notes[2];
  if (data.surge_days.length > 2 && data.surge_days.length <= 5) return notes[0];
  // Random fallback
  return notes[Math.floor(Math.random() * notes.length)];
}
