import React, { useEffect, useMemo, useState } from "react";
import {
  Sun,
  Moon,
  Droplets,
  Clock,
  Calendar,
  ChefHat,
  ShoppingCart,
  Check,
  X,
  Plus,
  Minus,
  Home,
  Utensils,
  Apple,
  Salad,
  Sparkles,
  Download,
  Star,
  Leaf,
  Heart,
  Settings,
} from "lucide-react";

// ============================================
// PROTOCOL DATA (keep your foods elsewhere; not touched here)
// ============================================

const PROTOCOL = {
  teas: {
    morning: {
      Mon: "Detox Green Tea",
      Tue: "Pure Energy Tea",
      Wed: "Pure Energy Tea",
      Thu: "Detox Green Tea",
      Fri: "Pure Energy Tea",
      Sat: "Detox Green Tea",
      Sun: "Detox Green Tea",
    },
    evening: {
      Mon: "Nervous System Tea",
      Tue: "Skeletal System Tea",
      Wed: "Nervous System Tea",
      Thu: "Skeletal System Tea",
      Fri: "Nervous System Tea",
      Sat: "Nervous System Tea",
      Sun: "Nervous System Tea",
    },
  },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ============================================
// UTILS
// ============================================

const formatTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);

const getDayKey = (date) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

const getDayName = (date) =>
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    date.getDay()
  ];

// Nice readable range (e.g., "8:23–8:33 AM")
const formatRange = (start, end) => {
  if (!start || !end) return "";
  const s = formatTime(start);
  const e = formatTime(end);
  // if AM/PM differs, keep both; else the formatTime already includes AM/PM in both, which is fine.
  return `${s} – ${e}`;
};

// ============================================
// ICON MAP
// ============================================

const IconMap = ({ name, size = 20, className = "" }) => {
  const icons = {
    sun: Sun,
    moon: Moon,
    droplets: Droplets,
    clock: Clock,
    apple: Apple,
    salad: Salad,
    utensils: Utensils,
    sparkles: Sparkles,
    leaf: Leaf,
    heart: Heart,
    calendar: Calendar,
    settings: Settings,
  };
  const Icon = icons[name] || Sparkles;
  return <Icon size={size} className={className} />;
};

// ============================================
// SCHEDULE MODEL
// ============================================

/**
 * Each schedule item can have:
 * - time: Date (anchor time)
 * - title: string
 * - desc: string
 * - icon: string (key in IconMap)
 * - category: string
 * - water: 'start' | 'end' (optional)
 *
 * Timing clarity improvements:
 * - mode: 'start-at' | 'finish-by'
 *    - start-at: time is the start time (we also compute "finish at" if duration exists)
 *    - finish-by: time is the deadline (we compute "start by/window" if duration exists)
 *
 * - durationMin: number (fixed duration)
 * - durationRange: [min,max] (range duration)
 * - hardStopLabel: string like "Stop drinking water" or "Tea must be DONE"
 */
const generateSchedule = (wakeTime) => {
  const w = new Date(wakeTime);
  const day = getDayKey(w);

  // Helper: create Date from offset
  const at = (mins) => addMinutes(w, mins);

  return [
    {
      time: at(0),
      mode: "start-at",
      durationMin: 5,
      title: "AWAKENING",
      desc: "20 deep breaths. Affirmations: “I am whole. My systems are restoring.”",
      icon: "sun",
      category: "morning",
      water: "start",
      hardStopLabel: "Water window begins",
    },
    {
      time: at(15),
      mode: "start-at",
      durationMin: 2,
      title: "Turn Kettle On",
      desc: "Prepare for morning tea.",
      icon: "sparkles",
      category: "morning",
    },
    {
      time: at(15),
      mode: "start-at",
      durationRange: [10, 20],
      title: "MOVEMENT",
      desc: "10–20 min intuitive movement. Stretch, spiral, flow.",
      icon: "sparkles",
      category: "morning",
    },
    {
      time: at(30),
      mode: "start-at",
      durationMin: 5,
      title: "HYDRATION + CAPSULE",
      desc: "2 cups water + Digestive System Support capsule.",
      icon: "droplets",
      category: "morning",
    },

    // Morning tea: SHOW AS FINISH-BY 8:50 so user understands it must be done by then.
    // Steep 17–27 min → start window is finishBy - 27 to finishBy - 17
    {
      time: at(50), // this is the "DONE BY" time
      mode: "finish-by",
      durationRange: [17, 27],
      title: "MORNING TEA",
      desc: `${PROTOCOL.teas.morning[day]} — Steep 17–27 min. NO sweetener.`,
      icon: "sparkles",
      category: "morning",
      water: "end",
      hardStopLabel: "Tea must be DONE / stop liquids by this time",
    },

    {
      time: at(100),
      mode: "start-at",
      durationMin: 10,
      title: "MELONS (optional)",
      desc: "If having melons: eat them SOLO. Wait 20 min before other fruits.",
      icon: "apple",
      category: "breakfast",
      optional: true,
    },
    {
      time: at(120),
      mode: "start-at",
      durationMin: 20,
      title: "BREAKFAST",
      desc: "Max 3 fruits + Multivitamin. Chew 30–50x per bite.",
      icon: "apple",
      category: "breakfast",
    },

    // Water window: start
    {
      time: at(210),
      mode: "start-at",
      durationMin: 3,
      title: "20 BREATHS",
      desc: "Deep diaphragmatic breathing.",
      icon: "sparkles",
      category: "transition",
      water: "start",
      hardStopLabel: "Water window begins",
    },

    {
      time: at(320),
      mode: "start-at",
      durationMin: 3,
      title: "20 BREATHS",
      desc: "Pre-lunch breathing.",
      icon: "sparkles",
      category: "transition",
    },

    // Lunch capsule ends water window
    {
      time: at(340),
      mode: "start-at",
      durationMin: 2,
      title: "LUNCH CAPSULE",
      desc: "Immune & Lymphatic Support — take 20 min before lunch.",
      icon: "leaf",
      category: "lunch",
      water: "end",
      hardStopLabel: "Stop water / liquids before meal window",
    },

    {
      time: at(360),
      mode: "start-at",
      durationMin: 30,
      title: "LUNCH",
      desc: "Complex carbs + vegetables ONLY. NO proteins/oils/vinegars.",
      icon: "salad",
      category: "lunch",
    },

    // Water window: start
    {
      time: at(450),
      mode: "start-at",
      durationMin: 3,
      title: "20 BREATHS",
      desc: "Post-lunch breathing.",
      icon: "sparkles",
      category: "transition",
      water: "start",
      hardStopLabel: "Water window begins",
    },

    {
      time: at(600),
      mode: "start-at",
      durationMin: 3,
      title: "20 BREATHS",
      desc: "Pre-dinner breathing.",
      icon: "sparkles",
      category: "transition",
    },

    {
      time: at(610),
      mode: "start-at",
      durationMin: 2,
      title: "DINNER CAPSULE",
      desc: "Reproductive System Support — take 20 min before dinner.",
      icon: "leaf",
      category: "dinner",
      water: "end",
      hardStopLabel: "Stop water / liquids before meal window",
    },

    {
      time: at(630),
      mode: "start-at",
      durationMin: 35,
      title: "DINNER",
      desc: "Proteins + vegetables + Mineral Complex (2 caps). Oils/vinegars OK.",
      icon: "utensils",
      category: "dinner",
    },

    // Water window: start
    {
      time: at(720),
      mode: "start-at",
      durationMin: 3,
      title: "20 BREATHS",
      desc: "Post-dinner breathing.",
      icon: "sparkles",
      category: "transition",
      water: "start",
      hardStopLabel: "Water window begins",
    },

    // Evening tea can also be modeled as finish-by if you want strict completion;
    // leaving start-at but giving duration guidance.
    {
      time: at(750),
      mode: "start-at",
      durationMin: 25,
      title: "EVENING TEA",
      desc: `${PROTOCOL.teas.evening[day]} — 2+ hours after dinner. NO sweetener.`,
      icon: "moon",
      category: "evening",
    },

    {
      time: at(810),
      mode: "start-at",
      durationMin: 20,
      title: "WIND DOWN",
      desc: "Journaling, meditation, gentle stretching. 20 breaths.",
      icon: "heart",
      category: "evening",
    },

    {
      time: at(840),
      mode: "finish-by",
      durationMin: 10,
      title: "SLEEP",
      desc: "Honor the night as time for repair.",
      icon: "moon",
      category: "evening",
      hardStopLabel: "Lights out / sleep by this time",
    },
  ];
};

// Compute “start/finish” display for any item
function getTimingForItem(item) {
  const anchor = item?.time ? new Date(item.time) : null;
  if (!anchor) return { startAt: null, finishAt: null, startWindow: null, finishBy: null };

  const fixed = typeof item.durationMin === "number" ? item.durationMin : null;
  const range =
    Array.isArray(item.durationRange) && item.durationRange.length === 2
      ? item.durationRange
      : null;

  if (item.mode === "finish-by") {
    const finishBy = anchor;

    if (range) {
      const [minMins, maxMins] = range;
      // start must be between finishBy - max and finishBy - min
      return {
        startAt: null,
        finishAt: null,
        startWindow: [addMinutes(finishBy, -maxMins), addMinutes(finishBy, -minMins)],
        finishBy,
      };
    }

    if (fixed != null) {
      return {
        startAt: addMinutes(finishBy, -fixed),
        finishAt: null,
        startWindow: null,
        finishBy,
      };
    }

    return { startAt: null, finishAt: null, startWindow: null, finishBy };
  }

  // default: start-at
  const startAt = anchor;

  if (range) {
    const [minMins, maxMins] = range;
    return {
      startAt,
      finishAt: null,
      startWindow: null,
      finishBy: null,
      finishWindow: [addMinutes(startAt, minMins), addMinutes(startAt, maxMins)],
    };
  }

  if (fixed != null) {
    return {
      startAt,
      finishAt: addMinutes(startAt, fixed),
      startWindow: null,
      finishBy: null,
    };
  }

  return { startAt, finishAt: null, startWindow: null, finishBy: null };
}

// ============================================
// ICS GENERATOR (regenerates with new wakeTime)
// ============================================

const generateICS = (schedule, dateKey) => {
  const formatICSDate = (d) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Divine Protocol//Wellness App//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Divine Protocol
X-WR-TIMEZONE:America/New_York
`;

  schedule.forEach((item, idx) => {
    // For calendar: pick a sensible DTSTART
    const timing = getTimingForItem(item);

    // If finish-by with a startWindow, use the earliest start as DTSTART
    let dtStart = timing.startAt || (timing.startWindow ? timing.startWindow[0] : item.time);
    dtStart = new Date(dtStart);

    // End: if finish-by, end at finishBy; else if duration, end at finishAt or max finishWindow
    let dtEnd = null;

    if (item.mode === "finish-by" && timing.finishBy) {
      dtEnd = new Date(timing.finishBy);
    } else if (timing.finishAt) {
      dtEnd = new Date(timing.finishAt);
    } else if (timing.finishWindow) {
      dtEnd = new Date(timing.finishWindow[1]);
    } else {
      dtEnd = addMinutes(dtStart, 15);
    }

    // Alarm 5 min before DTSTART
    const alarmMins = 5;

    const summary = `🌿 ${item.title}`;
    const detailsLines = [];
    detailsLines.push(item.desc || "");
    if (item.hardStopLabel) detailsLines.push(`NOTE: ${item.hardStopLabel}`);
    if (item.mode === "finish-by" && timing.finishBy) {
      detailsLines.push(`Finish by: ${formatTime(timing.finishBy)}`);
      if (timing.startWindow) {
        detailsLines.push(`Start window: ${formatRange(timing.startWindow[0], timing.startWindow[1])}`);
      } else if (timing.startAt) {
        detailsLines.push(`Start by: ${formatTime(timing.startAt)}`);
      }
    } else if (timing.startAt) {
      detailsLines.push(`Start at: ${formatTime(timing.startAt)}`);
      if (timing.finishAt) detailsLines.push(`Finish at: ${formatTime(timing.finishAt)}`);
      if (timing.finishWindow) detailsLines.push(`Finish window: ${formatRange(timing.finishWindow[0], timing.finishWindow[1])}`);
    }

    const description = detailsLines
      .filter(Boolean)
      .join("\\n")
      .replace(/,/g, "\\,");

    ics += `BEGIN:VEVENT
UID:divine-protocol-${dateKey}-${idx}@app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(dtStart)}
DTEND:${formatICSDate(dtEnd)}
SUMMARY:${summary}
DESCRIPTION:${description}
BEGIN:VALARM
TRIGGER:-PT${alarmMins}M
ACTION:DISPLAY
DESCRIPTION:${item.title} in ${alarmMins} minutes
END:VALARM
END:VEVENT
`;
  });

  ics += "END:VCALENDAR";
  return ics;
};

const downloadICS = (schedule, dateKey) => {
  const ics = generateICS(schedule, dateKey);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `divine-protocol-${dateKey}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ============================================
// MODAL (tap schedule item → full directions)
// ============================================

function DetailModal({ open, onClose, item }) {
  if (!open || !item) return null;

  const timing = getTimingForItem(item);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* sheet */}
      <div className="relative w-full md:max-w-lg mx-auto bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-emerald-100 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <IconMap name={item.icon} size={24} className="text-white" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-600 font-bold">
                {item.category || "schedule"}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
            </div>
          </div>

          <button
            className="p-2 rounded-xl hover:bg-gray-100 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        {/* Timing block */}
        <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          {item.mode === "finish-by" ? (
            <>
              <div className="text-sm text-emerald-800 font-bold">
                Finish by: <span className="font-extrabold">{formatTime(timing.finishBy || item.time)}</span>
              </div>

              {timing.startWindow && (
                <div className="mt-1 text-sm text-emerald-700">
                  Start window:{" "}
                  <span className="font-semibold">
                    {formatRange(timing.startWindow[0], timing.startWindow[1])}
                  </span>
                </div>
              )}

              {timing.startAt && (
                <div className="mt-1 text-sm text-emerald-700">
                  Start by: <span className="font-semibold">{formatTime(timing.startAt)}</span>
                </div>
              )}

              {item.hardStopLabel && (
                <div className="mt-2 text-xs text-emerald-700">
                  <span className="font-bold">Important:</span> {item.hardStopLabel}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-sm text-emerald-800 font-bold">
                Start at: <span className="font-extrabold">{formatTime(timing.startAt || item.time)}</span>
              </div>

              {timing.finishAt && (
                <div className="mt-1 text-sm text-emerald-700">
                  Finish at: <span className="font-semibold">{formatTime(timing.finishAt)}</span>
                </div>
              )}

              {timing.finishWindow && (
                <div className="mt-1 text-sm text-emerald-700">
                  Finish window:{" "}
                  <span className="font-semibold">
                    {formatRange(timing.finishWindow[0], timing.finishWindow[1])}
                  </span>
                </div>
              )}

              {item.hardStopLabel && (
                <div className="mt-2 text-xs text-emerald-700">
                  <span className="font-bold">Note:</span> {item.hardStopLabel}
                </div>
              )}
            </>
          )}
        </div>

        {/* Rules tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {item.water === "start" && (
            <span className="text-xs bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-semibold">
              💧 Water OK
            </span>
          )}
          {item.water === "end" && (
            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
              🚫 Stop water
            </span>
          )}
          {item.optional && (
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
              Optional
            </span>
          )}
        </div>

        {/* Full instructions */}
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
            Full Directions
          </div>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {item.desc}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// APP
// ============================================

export default function App() {
  const [view, setView] = useState("home");

  const [wakeTime, setWakeTime] = useState(() => {
    const saved = localStorage.getItem("dp_wakeTime");
    if (saved) return new Date(saved);
    const t = new Date();
    t.setHours(8, 0, 0, 0);
    return t;
  });

  const [schedule, setSchedule] = useState(() => generateSchedule(new Date()));
  const [now, setNow] = useState(new Date());

  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem("dp_completed");
    return saved ? JSON.parse(saved) : {};
  });

  // Settings
  const [autoCalendarOnWake, setAutoCalendarOnWake] = useState(() => {
    const saved = localStorage.getItem("dp_autoCalOnWake");
    return saved ? JSON.parse(saved) : false;
  });

  // Modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // Today keys
  const todayKey = useMemo(() => now.toISOString().split("T")[0], [now]);

  // Update time every minute
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(i);
  }, []);

  // Regenerate schedule whenever wakeTime changes (and persist)
  useEffect(() => {
    const newSched = generateSchedule(wakeTime);
    setSchedule(newSched);
    localStorage.setItem("dp_wakeTime", wakeTime.toISOString());
  }, [wakeTime]);

  // Save completed tasks
  useEffect(() => {
    localStorage.setItem("dp_completed", JSON.stringify(completed));
  }, [completed]);

  // Save settings
  useEffect(() => {
    localStorage.setItem("dp_autoCalOnWake", JSON.stringify(autoCalendarOnWake));
  }, [autoCalendarOnWake]);

  // Current schedule item
  const getCurrentItem = () => {
    for (let i = schedule.length - 1; i >= 0; i--) {
      if (new Date(schedule[i].time) <= now) return { current: schedule[i], next: schedule[i + 1], index: i };
    }
    return { current: null, next: schedule[0], index: -1 };
  };

  const { current, next } = getCurrentItem();

  // “I’m awake” button: re-time day to NOW, and (optionally) auto-download the updated calendar
  const handleClockIn = () => {
    const newWake = new Date();
    const newSched = generateSchedule(newWake);

    setWakeTime(newWake);
    setSchedule(newSched);

    // Reset today's completion
    setCompleted({ date: todayKey });

    if (autoCalendarOnWake) {
      downloadICS(newSched, todayKey);
    }
  };

  // Toggle completion
  const toggleTask = (idx) => {
    setCompleted((prev) => ({ ...prev, date: todayKey, [idx]: !prev[idx] }));
  };

  const openDetails = (item) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const doneCount = useMemo(
    () => Object.values(completed).filter((v) => v === true).length,
    [completed]
  );

  // ============================================
  // HOME
  // ============================================

  const renderHome = () => (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-teal-300 rounded-full blur-2xl"></div>
        </div>
        <div className="relative">
          <div className="text-5xl mb-2">🌿</div>
          <h1 className="text-2xl font-light text-white tracking-widest">DIVINE PROTOCOL</h1>
          <p className="text-emerald-200 mt-1 text-sm font-medium">{getDayName(now)}</p>
          <p className="text-4xl font-extralight text-white mt-2 tracking-wide">{formatTime(now)}</p>
        </div>
      </div>

      {/* Clock In */}
      <button
        onClick={handleClockIn}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-3 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]"
      >
        <Sun size={24} />
        <span>I’m Awake — Start My Day</span>
      </button>

      {/* Download Calendar */}
      <button
        onClick={() => downloadICS(schedule, todayKey)}
        className="w-full py-3 bg-white border-2 border-emerald-500 text-emerald-700 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
      >
        <Download size={20} />
        <span>Download Today’s Schedule (.ics)</span>
      </button>

      {/* Current Activity */}
      {current && (
        <button
          onClick={() => openDetails(current)}
          className="w-full text-left bg-white rounded-2xl p-5 shadow-lg border border-emerald-100 hover:border-emerald-300 transition"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs uppercase tracking-wider text-emerald-600 font-bold">Now</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <IconMap name={current.icon} size={28} className="text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{current.title}</h3>

              {/* Timing line */}
              <div className="mt-1 text-sm text-gray-600">
                {(() => {
                  const t = getTimingForItem(current);
                  if (current.mode === "finish-by") {
                    return (
                      <>
                        <span className="font-semibold text-gray-700">Finish by </span>
                        {formatTime(t.finishBy || current.time)}
                        {t.startWindow ? (
                          <span className="block text-xs text-gray-500 mt-0.5">
                            Start window: {formatRange(t.startWindow[0], t.startWindow[1])}
                          </span>
                        ) : null}
                      </>
                    );
                  }
                  return (
                    <>
                      <span className="font-semibold text-gray-700">Start at </span>
                      {formatTime(t.startAt || current.time)}
                      {t.finishAt ? (
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Finish at: {formatTime(t.finishAt)}
                        </span>
                      ) : null}
                      {t.finishWindow ? (
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Finish window: {formatRange(t.finishWindow[0], t.finishWindow[1])}
                        </span>
                      ) : null}
                    </>
                  );
                })()}
              </div>

              <p className="text-gray-600 text-sm mt-2 line-clamp-2">{current.desc}</p>
              <p className="text-xs text-emerald-700 mt-2 font-semibold">Tap to view full directions</p>
            </div>
          </div>
        </button>
      )}

      {/* Next Up */}
      {next && (
        <button
          onClick={() => openDetails(next)}
          className="w-full text-left bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100 hover:border-emerald-300 transition"
        >
          <div className="text-xs uppercase tracking-wider text-emerald-600 mb-2 font-bold">
            Next
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconMap name={next.icon} size={20} className="text-emerald-600" />
              <span className="font-semibold text-gray-700">{next.title}</span>
            </div>
            <div className="text-sm text-gray-600">
              {(() => {
                const t = getTimingForItem(next);
                return next.mode === "finish-by"
                  ? `Finish by ${formatTime(t.finishBy || next.time)}`
                  : `Start ${formatTime(t.startAt || next.time)}`;
              })()}
            </div>
          </div>
          <div className="text-xs text-emerald-700 mt-2 font-semibold">Tap to view full directions</div>
        </button>
      )}
const formatRange = (a, b) => `${formatTime(a)}–${formatTime(b)}`;

function getTimingForItem(item) {
  // Default: “at time”
  const base = item.time;

  // Tea: steep 17–27 minutes, and must be DONE by this time
  if (item.title === "MORNING TEA" || item.title === "EVENING TEA") {
    const finishBy = base;
    const startWindowStart = addMinutes(finishBy, -27);
    const startWindowEnd = addMinutes(finishBy, -17);
    return {
      mode: "finish-by",
      finishBy,
      startWindow: [startWindowStart, startWindowEnd],
      labelPrimary: `Finish by ${formatTime(finishBy)}`,
      labelSecondary: `Start window: ${formatRange(startWindowStart, startWindowEnd)}`
    };
  }

  // Capsules: “take 20 min before meal” = start at this exact time, meal follows
  if (item.title.includes("CAPSULE")) {
    return {
      mode: "start-at",
      startAt: base,
      labelPrimary: `At ${formatTime(base)}`,
      labelSecondary: "Take now (20 min before the meal)"
    };
  }

  // Default: show “At time”
  return {
    mode: "start-at",
    startAt: base,
    labelPrimary: `At ${formatTime(base)}`,
    labelSecondary: ""
  };
}


      {/* Water Windows Info */}
      <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="text-cyan-600" size={20} />
          <span className="font-bold text-cyan-800">Water Windows</span>
        </div>
        <div className="text-sm text-cyan-700 space-y-1">
          <p>• <strong>Wake → Morning tea finish:</strong> water OK until tea is DONE</p>
          <p>• <strong>Midday window:</strong> water OK between the designated breath + capsule boundaries</p>
          <p>• <strong>Afternoon window:</strong> water OK between post-lunch and dinner capsule boundary</p>
          <p>• <strong>Night window:</strong> water OK from post-dinner onward</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Today’s Progress</span>
          <span className="text-emerald-600 font-bold">
            {doneCount} / {schedule.length}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
            style={{ width: `${(doneCount / schedule.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  // ============================================
  // SCHEDULE VIEW
  // ============================================

  const renderSchedule = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-light text-gray-800">Today’s Schedule</h2>
          <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold">
            {doneCount}/{schedule.length}
          </span>
        </div>

        {/* Wake Time Adjuster */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-amber-800 font-bold text-sm">Wake Time</span>
              <p className="text-xs text-amber-600">All times adjust automatically</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWakeTime(addMinutes(wakeTime, -30))}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-amber-100 transition"
              >
                <Minus size={16} />
              </button>
              <span className="w-24 text-center font-mono text-lg font-bold">
                {formatTime(wakeTime)}
              </span>
              <button
                onClick={() => setWakeTime(addMinutes(wakeTime, 30))}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-amber-100 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleClockIn}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow hover:shadow-lg transition"
            >
              I’m Awake Now (re-time today)
            </button>
            <button
              onClick={() => downloadICS(schedule, todayKey)}
              className="flex-1 py-3 bg-white border border-amber-300 text-amber-800 rounded-xl font-semibold hover:bg-amber-50 transition flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Export Calendar
            </button>
          </div>
        </div>

        {/* Schedule Items */}
        <div className="space-y-2">
          {schedule.map((item, i) => {
            const isCurrent = current === item;
            const isPast = new Date(item.time) < now && !isCurrent;
            const isDone = completed[i];

            const timing = getTimingForItem(item);

            const timeLabel =
              item.mode === "finish-by"
                ? `Finish by ${formatTime(timing.finishBy || item.time)}`
                : `Start ${formatTime(timing.startAt || item.time)}`;

            const subLabel =
              item.mode === "finish-by"
                ? timing.startWindow
                  ? `Start window: ${formatRange(timing.startWindow[0], timing.startWindow[1])}`
                  : timing.startAt
                    ? `Start by: ${formatTime(timing.startAt)}`
                    : ""
                : timing.finishAt
                  ? `Finish at: ${formatTime(timing.finishAt)}`
                  : timing.finishWindow
                    ? `Finish window: ${formatRange(timing.finishWindow[0], timing.finishWindow[1])}`
                    : "";

            return (
              <div
                key={i}
                className={`p-4 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-[1.01]"
                    : isDone
                      ? "bg-emerald-50 border-2 border-emerald-300"
                      : isPast
                        ? "bg-gray-50 opacity-70 border border-gray-200"
                        : "bg-white border border-gray-100 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(i)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCurrent ? "bg-white/20" : isDone ? "bg-emerald-200" : "bg-gray-100"
                    }`}
                    title="Mark complete"
                  >
                    {isDone ? (
                      <Check size={20} className="text-emerald-600" />
                    ) : (
                      <IconMap name={item.icon} size={18} className={isCurrent ? "text-white" : "text-gray-500"} />
                    )}
                  </button>

                  <button
                    onClick={() => openDetails(item)}
                    className="flex-1 min-w-0 text-left"
                    title="Tap to view full directions"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${isCurrent ? "text-white/90" : "text-gray-600"}`}>
                        {timeLabel}
                      </span>

                      {item.water === "start" && (
                        <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                          💧 Water OK
                        </span>
                      )}
                      {item.water === "end" && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          🚫 Stop water
                        </span>
                      )}
                      {item.optional && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          Optional
                        </span>
                      )}
                    </div>

                    <h4 className={`font-bold mt-1 ${isCurrent ? "text-white" : isDone ? "text-emerald-700" : "text-gray-800"}`}>
                      {item.title}
                    </h4>

                    {subLabel ? (
                      <div className={`text-xs mt-1 ${isCurrent ? "text-white/80" : "text-gray-500"}`}>
                        {subLabel}
                      </div>
                    ) : null}

                    <p className={`text-sm mt-2 ${isCurrent ? "text-white/80" : "text-gray-500"} line-clamp-2`}>
                      {item.desc}
                    </p>

                    <div className={`text-xs mt-2 font-semibold ${isCurrent ? "text-white/90" : "text-emerald-700"}`}>
                      Tap for full directions →
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ============================================
  // SETTINGS VIEW (small but useful for calendar auto-download)
  // ============================================
  const renderSettings = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-light text-gray-800">Settings</h2>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-bold text-gray-800">Auto-download calendar on wake</div>
            <div className="text-sm text-gray-500 mt-1">
              If enabled, when she taps “I’m Awake”, the app will automatically download the updated .ics for today.
            </div>
          </div>

          <button
            onClick={() => setAutoCalendarOnWake((p) => !p)}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              autoCalendarOnWake ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {autoCalendarOnWake ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <div className="text-sm text-amber-800 font-bold">Tip</div>
        <div className="text-sm text-amber-700 mt-1">
          Even without auto-download, she can always export the updated schedule after waking by tapping{" "}
          <span className="font-semibold">Export Calendar</span> in the Schedule tab.
        </div>
      </div>
    </div>
  );

  // ============================================
  // PLACEHOLDERS (so your nav doesn’t break)
  // ============================================
  const renderPlaceholder = (title, subtitle) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-light text-gray-800">{title}</h2>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 text-gray-600">
        {subtitle}
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-emerald-50/50 to-teal-50/50">
      <div className="max-w-lg mx-auto px-4 pb-28 pt-6">
        {view === "home" && renderHome()}
        {view === "schedule" && renderSchedule()}
        {view === "build" && renderPlaceholder("Build Meals", "Meal Builder is next — we’ll wire targets, saved recipes, and rule-enforced selections after schedule is flawless.")}
        {view === "week" && renderPlaceholder("Week", "Weekly planning view is next — we’ll connect it to saved recipes and frequency tracking.")}
        {view === "grocery" && renderPlaceholder("Grocery", "Grocery list will come from the weekly plan + saved recipes once Build/Week are wired.")}
        {view === "settings" && renderSettings()}
      </div>

      {/* Detail Modal */}
      <DetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        item={detailItem}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 py-2 pb-safe">
        <div className="max-w-lg mx-auto flex justify-around">
          {[
            { id: "home", icon: Home, label: "Today" },
            { id: "schedule", icon: Clock, label: "Schedule" },
            { id: "build", icon: ChefHat, label: "Build" },
            { id: "week", icon: Calendar, label: "Week" },
            { id: "grocery", icon: ShoppingCart, label: "Grocery" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                view === id ? "bg-emerald-100 text-emerald-700" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={22} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

