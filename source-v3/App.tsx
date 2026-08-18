"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  DOMAINS,
  DOMAIN_ORDER,
  FORGE_TEMPLATES,
  QUESTS,
  templatesFor,
  type DomainName,
  type ForgeTemplate,
  type TrainingMode,
} from "./training-data";

const STORAGE_KEY = "ama-fighter-coach-v2";
const LEGACY_KEY = "ama-fighter-coach-v1";

type NavView = "hall" | "forge" | "fight" | "path" | "chronicle";
type Duration = 20 | 30 | 45;

type SessionRecord = {
  id: string;
  templateId: string;
  title: string;
  focus: DomainName;
  duration: Duration;
  mode: TrainingMode;
  completed: number;
  total: number;
  date: number;
};

type FightRecord = {
  id: string;
  opponent: string;
  result: string;
  focus: DomainName;
  happened: string;
  why: string;
  adjust: string;
  date: number;
};

type LedgerRecord = {
  id: string;
  type: "train" | "fight" | "teach";
  title: string;
  detail: string;
  date: number;
  marks: number;
};

type AppState = {
  profile: { name: string; style: string; goal: string };
  domains: Record<DomainName, number>;
  marks: number;
  sessions: SessionRecord[];
  fights: FightRecord[];
  teachings: { id: string; text: string; date: number }[];
  ledger: LedgerRecord[];
  selectedDuration: Duration;
  selectedFocus: DomainName;
  selectedMode: TrainingMode;
  forgeCounters: Record<DomainName, number>;
};

type SessionStep = {
  name: string;
  minutes: number;
  label: string;
  objective: string;
  setup: string;
  instructions: string[];
  workCycle: string;
  formation: string;
  watchFor: string;
  standard: string;
};

type ActiveSession = {
  template: ForgeTemplate;
  duration: Duration;
  mode: TrainingMode;
  steps: SessionStep[];
  completed: boolean[];
  forgedAt: number;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const newDomainRecord = (value: number) =>
  Object.fromEntries(DOMAIN_ORDER.map((domain) => [domain, value])) as Record<
    DomainName,
    number
  >;

const defaultState = (): AppState => ({
  profile: {
    name: "Cadet",
    style: "Open / Mixed",
    goal: "Build a complete fighter: skill, judgment, and the ability to teach.",
  },
  domains: newDomainRecord(1),
  marks: 0,
  sessions: [],
  fights: [],
  teachings: [],
  ledger: [],
  selectedDuration: 30,
  selectedFocus: "Movement",
  selectedMode: "Partner",
  forgeCounters: newDomainRecord(0),
});

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const dateLabel = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const durationMap: Record<Duration, [number, number, number, number]> = {
  20: [3, 8, 6, 3],
  30: [5, 12, 9, 4],
  45: [7, 18, 14, 6],
};

const formationSetup: Record<TrainingMode, string> = {
  Solo:
    "Set the target, markers, camera, or notes before the timer starts. Work in a clear area and use the solo adaptation below; do not invent an imaginary defender who always reacts perfectly.",
  Partner:
    "Name one trainee and one feeder. The trainee owns the first set. Agree on legal targets, contact level, and a stop word; switch roles halfway through the stage.",
  Warband:
    "Work in groups of three whenever possible: trainee, feeder, and observer. The observer counts only the stated standard. Rotate roles clockwise after each set.",
};

const stageCycles: Record<Duration, { build: string; test: string }> = {
  20: {
    build: "Run two sets of five deliberate repetitions. Rest or confer for 20 seconds between sets, then use the remaining time to repair the first repeated error.",
    test: "Run three 60-second pressure rounds with 20 seconds between rounds. Reset roles or starting range after each round; do not turn the pause into a lecture.",
  },
  30: {
    build: "Run three sets of five deliberate repetitions. Rest or confer for 20 seconds between sets, then repeat the weakest set once with one correction only.",
    test: "Run four 75-second pressure rounds with 25 seconds between rounds. Reset roles or starting range after each round and name one piece of evidence.",
  },
  45: {
    build: "Run four sets of five deliberate repetitions. Rest or confer for 25 seconds between sets. Use the final minutes to repeat the weakest set at the fastest clean pace.",
    test: "Run five two-minute pressure rounds with 30 seconds between rounds. Change only one variable per round—timing, target, range, or opponent response.",
  },
};

function buildSteps(
  template: ForgeTemplate,
  duration: Duration,
  mode: TrainingMode,
): SessionStep[] {
  const [prime, build, pressure, reflect] = durationMap[duration];
  const cycle = stageCycles[duration];
  const sourceIsSkbc = template.source.startsWith("SKBC");
  const sourceNote = sourceIsSkbc
    ? `Technical basis: ${template.source}. The Academy supplies the timer, scaling, and reflection structure.`
    : `Academy extension: ${template.source}. It follows the SKBC method of isolating one problem, earning clean repetitions, and adding pressure gradually.`;
  return [
    {
      name: "Prime the Pattern",
      minutes: prime,
      label: "Prepare",
      objective: `Learn the shape and purpose of ${template.title} before speed or resistance can hide mistakes.`,
      setup: `Clear a safe training space and ready this gear: ${template.gear}. ${formationSetup[mode]}`,
      instructions: [
        `Read the goal aloud: ${template.purpose}`,
        "Read the full Build instructions once. Identify the first action, the intended response, and the recovery or finish. Then rehearse that sequence at roughly 30–40% speed with no resistance.",
        DOMAINS[template.domain].primer,
      ],
      workCycle: `Complete three slow rehearsals, stop and check balance, guard, spacing, and the ability to act again, then repeat. ${sourceNote}`,
      formation: `For this ${mode.toLowerCase()} session: ${template.adaptations[mode]}`,
      watchFor: `Nothing should be rushed. If you cannot say what the repetition is teaching, reread the goal before continuing. Coach's cue: “${template.cue}”`,
      standard: "You can perform the complete pattern slowly, explain its purpose in one sentence, and finish ready for the next action.",
    },
    {
      name: template.title,
      minutes: build,
      label: "Build",
      objective: template.purpose,
      setup: formationSetup[mode],
      instructions: [
        template.drill,
        "Reset fully after every repetition. A miss, block, or failed attempt still counts as useful practice only when the assigned action and recovery remain recognizable.",
      ],
      workCycle: cycle.build,
      formation: template.adaptations[mode],
      watchFor: `Watch only the named skill. Stop the set when safety, structure, or the cue disappears; make one correction and resume at a slower pace. Coach's cue: “${template.cue}”`,
      standard: template.standard,
    },
    {
      name: "Pressure Without Noise",
      minutes: pressure,
      label: "Test",
      objective: "Find out whether the skill survives a real choice without letting unrelated sparring hide the result.",
      setup: "Keep the same formation and legal targets. Begin near 50–60% intensity. The feeder or opponent gives enough resistance to force a decision, but does not abandon the drill to chase ordinary wins.",
      instructions: [
        template.pressure,
        `Use this ${mode.toLowerCase()} version: ${template.adaptations[mode]}`,
        "If the trained skill disappears for two attempts in a row, reduce one variable—speed, target choice, timing, or movement—and rebuild it before continuing.",
      ],
      workCycle: cycle.test,
      formation: "The trainee attempts the skill; the feeder gives honest, safe responses; the observer or trainee records only whether the stated cue and standard appeared.",
      watchFor: `Do not score the whole fight. Score the trained behavior. Keep this cue visible: “${template.cue}”`,
      standard: `${template.standard} The same behavior must also appear at least twice against an unscripted or variable response.`,
    },
    {
      name: "Capture the Lesson",
      minutes: reflect,
      label: "Reflect",
      objective: "Turn the session into one usable observation and one specific next practice.",
      setup: "Stop the drill, lower the weapons, take water, and open the Chronicle or a note. Reflection begins only after contact has stopped.",
      instructions: [
        `Answer this question: ${template.reflection}`,
        "Record one observable example: what happened, on which repetition or round, and what changed when the correction was used.",
        "Choose exactly one next action: repeat this session, return to the Build stage at lower pressure, or carry the cue into open fighting.",
      ],
      workCycle: "Spend the first half answering the question without judging talent. Spend the second half writing one sentence of evidence and one sentence naming the next action.",
      formation: mode === "Solo"
        ? "Review your own notes, counts, or video before deciding what happened."
        : "The trainee speaks first. Partners or observers may add one fact they saw, then the trainee chooses the next action.",
      watchFor: "Use actions that could be seen or counted. Replace “good,” “bad,” and “I just need to try harder” with specific behavior.",
      standard: "Leave with one useful sentence, not a verdict on your talent.",
    },
  ];
}

function mergeStoredState(stored: Partial<AppState> | null): AppState {
  const base = defaultState();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    profile: { ...base.profile, ...(stored.profile ?? {}) },
    domains: { ...base.domains, ...(stored.domains ?? {}) },
    forgeCounters: { ...base.forgeCounters, ...(stored.forgeCounters ?? {}) },
    selectedDuration: [20, 30, 45].includes(Number(stored.selectedDuration))
      ? (Number(stored.selectedDuration) as Duration)
      : 30,
    selectedMode: ["Solo", "Partner", "Warband"].includes(
      String(stored.selectedMode),
    )
      ? (stored.selectedMode as TrainingMode)
      : "Partner",
  };
}

const navItems: { id: NavView; label: string; icon: string }[] = [
  { id: "hall", label: "Hall", icon: "⌂" },
  { id: "forge", label: "Forge", icon: "⚒" },
  { id: "fight", label: "Fight", icon: "✎" },
  { id: "path", label: "Path", icon: "♜" },
  { id: "chronicle", label: "Chronicle", icon: "☷" },
];

export default function Home() {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<NavView>("hall");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [timer, setTimer] = useState<{
    index: number;
    remaining: number;
    running: boolean;
  } | null>(null);
  const [toast, setToast] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const legacy = localStorage.getItem(LEGACY_KEY);
      const parsed = JSON.parse(current ?? legacy ?? "null") as Partial<AppState> | null;
      setState(mergeStoredState(parsed));
    } catch {
      setState(defaultState());
    }
    setHydrated(true);

    if ("serviceWorker" in navigator && window.location.protocol === "https:") {
      navigator.serviceWorker
        .register(new URL("sw.js", document.baseURI).pathname)
        .catch(() => undefined);
    }

    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!timer?.running) return;
    const interval = window.setInterval(() => {
      setTimer((current) => {
        if (!current || !current.running) return current;
        if (current.remaining <= 1) {
          setActiveSession((session) => {
            if (!session) return session;
            const completed = [...session.completed];
            completed[current.index] = true;
            return { ...session, completed };
          });
          announce("Step complete. Take one breath before the next.");
          return { ...current, remaining: 0, running: false };
        }
        return { ...current, remaining: current.remaining - 1 };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timer?.running]);

  const announce = (message: string) => {
    setToast(message);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(""), 2600);
  };

  const navigate = (nextView: NavView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sessionCountByDomain = useMemo(
    () =>
      DOMAIN_ORDER.reduce(
        (counts, domain) => ({
          ...counts,
          [domain]: state.sessions.filter((session) => session.focus === domain)
            .length,
        }),
        newDomainRecord(0),
      ),
    [state.sessions],
  );

  const questDomain = useMemo(() => {
    const minimumLevel = Math.min(...DOMAIN_ORDER.map((domain) => state.domains[domain]));
    const candidates = DOMAIN_ORDER.filter(
      (domain) => state.domains[domain] === minimumLevel,
    );
    return [...candidates].sort(
      (a, b) => sessionCountByDomain[a] - sessionCountByDomain[b],
    )[0];
  }, [sessionCountByDomain, state.domains]);

  const quest = QUESTS[questDomain];
  const questStandard =
    DOMAINS[questDomain].standards[Math.min(state.domains[questDomain], 3)];

  const wholeFighter = useMemo(() => {
    const score = (...domains: DomainName[]) =>
      Math.round(
        (domains.reduce((sum, domain) => sum + state.domains[domain], 0) /
          (domains.length * 4)) *
          100,
      );
    return {
      Body: score("Mechanics", "Movement"),
      Craft: score("Mechanics", "Drill Discipline"),
      Mind: score("Geometry", "Intelligence", "Deception"),
      Character: Math.min(100, 20 + state.fights.length * 5 + state.sessions.length * 2),
      Fellowship: Math.min(100, 20 + state.teachings.length * 14),
    };
  }, [state.domains, state.fights.length, state.sessions.length, state.teachings.length]);

  const forgeSession = (templateId?: string, domainOverride?: DomainName) => {
    const focus = domainOverride ?? state.selectedFocus;
    const pool = templatesFor(focus);
    const counter = state.forgeCounters[focus] ?? 0;
    const template =
      (templateId && FORGE_TEMPLATES.find((item) => item.id === templateId)) ||
      pool[counter % pool.length];
    const nextFocus = template.domain;
    const nextCounter = templateId ? counter : counter + 1;

    setState((current) => ({
      ...current,
      selectedFocus: nextFocus,
      forgeCounters: {
        ...current.forgeCounters,
        [focus]: nextCounter,
      },
    }));
    setTimer(null);
    setActiveSession({
      template,
      duration: state.selectedDuration,
      mode: state.selectedMode,
      steps: buildSteps(template, state.selectedDuration, state.selectedMode),
      completed: [false, false, false, false],
      forgedAt: Date.now(),
    });
    navigate("forge");
    window.setTimeout(
      () => document.getElementById("forged-session")?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  };

  const beginQuest = () => {
    setState((current) => ({ ...current, selectedFocus: questDomain }));
    forgeSession(undefined, questDomain);
  };

  const updateBuilder = <K extends "selectedFocus" | "selectedDuration" | "selectedMode">(
    key: K,
    value: AppState[K],
  ) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const toggleTimer = (index: number, seconds: number) => {
    setTimer((current) => {
      if (current?.index === index) return { ...current, running: !current.running };
      return { index, remaining: seconds, running: true };
    });
  };

  const toggleStep = (index: number) => {
    setActiveSession((session) => {
      if (!session) return session;
      const completed = [...session.completed];
      completed[index] = !completed[index];
      return { ...session, completed };
    });
  };

  const completeSession = () => {
    if (!activeSession) return;
    const completed = activeSession.completed.filter(Boolean).length;
    const record: SessionRecord = {
      id: uid(),
      templateId: activeSession.template.id,
      title: activeSession.template.title,
      focus: activeSession.template.domain,
      duration: activeSession.duration,
      mode: activeSession.mode,
      completed,
      total: activeSession.steps.length,
      date: Date.now(),
    };
    setState((current) => ({
      ...current,
      marks: current.marks + 2,
      sessions: [record, ...current.sessions],
      ledger: [
        {
          id: uid(),
          type: "train",
          title: record.title,
          detail: `${record.duration}-minute ${record.mode.toLowerCase()} session · ${completed}/${record.total} steps marked complete`,
          date: record.date,
          marks: 2,
        },
        ...current.ledger,
      ],
    }));
    setTimer(null);
    setActiveSession(null);
    announce("+2 Training Marks · the work is recorded.");
  };

  const recordFight = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const happened = String(form.get("happened") ?? "").trim();
    const adjust = String(form.get("adjust") ?? "").trim();
    if (!happened && !adjust) {
      announce("Record one observation or one next adjustment.");
      return;
    }
    const record: FightRecord = {
      id: uid(),
      opponent: String(form.get("opponent") ?? "").trim(),
      result: String(form.get("result") ?? "lesson"),
      focus: String(form.get("focus") ?? state.selectedFocus) as DomainName,
      happened,
      why: String(form.get("why") ?? "").trim(),
      adjust,
      date: Date.now(),
    };
    setState((current) => ({
      ...current,
      marks: current.marks + 1,
      fights: [record, ...current.fights],
      selectedFocus: record.focus,
      ledger: [
        {
          id: uid(),
          type: "fight",
          title: `${record.focus} reflection`,
          detail: record.adjust || record.happened,
          date: record.date,
          marks: 1,
        },
        ...current.ledger,
      ],
    }));
    event.currentTarget.reset();
    announce("+1 Training Mark · the lesson is captured.");
  };

  const recordTeaching = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("teaching") ?? "").trim();
    if (!text) {
      announce("Name the lesson or correction you shared.");
      return;
    }
    const date = Date.now();
    setState((current) => ({
      ...current,
      marks: current.marks + 3,
      teachings: [{ id: uid(), text, date }, ...current.teachings],
      ledger: [
        { id: uid(), type: "teach", title: "Teach-back", detail: text, date, marks: 3 },
        ...current.ledger,
      ],
    }));
    event.currentTarget.reset();
    announce("+3 Training Marks · knowledge shared.");
  };

  const setAssessment = (domain: DomainName, level: number) => {
    setState((current) => ({
      ...current,
      domains: { ...current.domains, [domain]: level },
    }));
    announce("Assessment updated. Keep the evidence honest.");
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      profile: {
        name: String(form.get("name") ?? "").trim() || "Cadet",
        style: String(form.get("style") ?? "Open / Mixed"),
        goal: String(form.get("goal") ?? "").trim(),
      },
    }));
    setSettingsOpen(false);
    announce("Fighter record saved.");
  };

  const installApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
      return;
    }
    announce("Open your browser menu and choose “Install app” or “Add to Home screen.”");
  };

  const clearData = () => {
    if (!window.confirm("Clear all Fighter Coach data on this device? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
    setState(defaultState());
    setActiveSession(null);
    setTimer(null);
    announce("Local training record cleared.");
  };

  const latestAdjustment = state.fights.find((fight) => fight.adjust)?.adjust;
  const currentTemplateNumber = activeSession
    ? templatesFor(activeSession.template.domain).findIndex(
        (item) => item.id === activeSession.template.id,
      ) + 1
    : 0;

  return (
    <div className="site-frame">
      <header className="app-header">
        <button className="brand-lockup" onClick={() => navigate("hall")} aria-label="Go to the Hall">
          <img src="academy/crest.svg" className="crest" alt="Academy crest" />
          <span>
            <span className="eyebrow">Academy of Mercenary Arts</span>
            <strong>Fighter Coach</strong>
            <small>Developing Fighters. Building Warlords.</small>
          </span>
        </button>
        <div className="header-actions">
          <button className="install-button" onClick={installApp}>
            <span aria-hidden="true">↓</span> Install
          </button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Open fighter record">
            ⚙
          </button>
        </div>
      </header>

      <main className="app-main">
        {view === "hall" && (
          <section className="view hall-view" aria-labelledby="hall-title">
            <div className="hall-grid">
              <article className="hero-banner parchment-card">
                <div>
                  <p className="eyebrow">The Hall · Welcome, {state.profile.name}</p>
                  <h1 id="hall-title">Good training has one purpose.</h1>
                  <p>Leave the field knowing exactly what to practice next.</p>
                </div>
                <div className="hero-mark" aria-hidden="true">
                  <span>56</span>
                  <small>forged sessions</small>
                </div>
              </article>

              <article className="quest-card" style={{ "--domain": DOMAINS[questDomain].color } as CSSProperties}>
                <div className="quest-ribbon">TODAY&apos;S QUEST</div>
                <p className="quest-domain">{DOMAINS[questDomain].icon} {questDomain}</p>
                <h2>{quest.title}</h2>
                <p>{quest.text}</p>
                <div className="quest-standard">
                  <span>Success standard</span>
                  <strong>{questStandard}</strong>
                </div>
                <button className="primary-button gold" onClick={beginQuest}>Forge Today&apos;s Practice</button>
              </article>
            </div>

            <div className="stat-grid">
              <article className="stat-card"><span>Training Marks</span><strong>{state.marks}</strong><small>consistency, not rank</small></article>
              <article className="stat-card"><span>Sessions</span><strong>{state.sessions.length}</strong><small>focused practices</small></article>
              <article className="stat-card"><span>Reflections</span><strong>{state.fights.length}</strong><small>lessons captured</small></article>
              <article className="stat-card"><span>Teach-backs</span><strong>{state.teachings.length}</strong><small>knowledge shared</small></article>
            </div>

            <section className="section-block">
              <div className="section-heading">
                <div><p className="eyebrow">Whole-Fighter Doctrine</p><h2>Train the whole person.</h2></div>
                <span className="small-note">Measured through habits</span>
              </div>
              <div className="doctrine-grid">
                {Object.entries(wholeFighter).map(([name, value]) => (
                  <article className="doctrine-card" key={name}>
                    <strong>{name}</strong>
                    <div className="meter"><i style={{ width: `${value}%` }} /></div>
                    <small>{value}% evidence</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-block counsel-section">
              <div className="section-heading">
                <div><p className="eyebrow">Coach&apos;s Counsel</p><h2>{latestAdjustment ? "Carry the lesson forward." : "One correction. One week."}</h2></div>
              </div>
              <article className="counsel-card">
                <div className="wax-seal">A</div>
                <div>
                  <p>{latestAdjustment ? `Your last adjustment was: “${latestAdjustment}” Build the next practice around it before adding something new.` : "Do not train everything at once. Choose one weakness, isolate it, then pressure-test it."}</p>
                  <button className="text-button" onClick={() => navigate("forge")}>Enter the Forge →</button>
                </div>
              </article>
            </section>
          </section>
        )}

        {view === "forge" && (
          <section className="view" aria-labelledby="forge-title">
            <div className="section-heading top-heading">
              <div><p className="eyebrow">The Training Forge</p><h1 id="forge-title">Build one honest practice.</h1><p className="heading-copy">Eight authored plans in every domain. Technical instruction follows the supplied SKBC classes first; the Academy supplies session structure, scaling, reflection, and extensions where SKBC does not prescribe an exact drill.</p></div>
              <div className="library-count"><strong>56</strong><span>session plans</span></div>
            </div>

            <article className="builder-card parchment-card">
              <div className="builder-grid">
                <label>
                  Training domain
                  <select value={state.selectedFocus} onChange={(event) => updateBuilder("selectedFocus", event.target.value as DomainName)}>
                    {DOMAIN_ORDER.map((domain) => <option key={domain}>{domain}</option>)}
                  </select>
                </label>
                <fieldset>
                  <legend>Who is training?</legend>
                  <div className="segmented-control">
                    {(["Solo", "Partner", "Warband"] as TrainingMode[]).map((mode) => (
                      <button type="button" className={state.selectedMode === mode ? "selected" : ""} onClick={() => updateBuilder("selectedMode", mode)} key={mode}>{mode}</button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Time available</legend>
                  <div className="segmented-control">
                    {([20, 30, 45] as Duration[]).map((duration) => (
                      <button type="button" className={state.selectedDuration === duration ? "selected" : ""} onClick={() => updateBuilder("selectedDuration", duration)} key={duration}>{duration} min</button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <button className="primary-button forge-button" onClick={() => forgeSession()}><span aria-hidden="true">⚒</span> Forge Session</button>
            </article>

            {activeSession ? (
              <section className="forged-session" id="forged-session" aria-live="polite">
                <article className="session-banner" style={{ "--domain": DOMAINS[activeSession.template.domain].color } as CSSProperties}>
                  <div>
                    <p className="eyebrow">Forged Session · {currentTemplateNumber} of 8 in {activeSession.template.domain}</p>
                    <h2>{activeSession.template.title}</h2>
                    <p>{activeSession.template.purpose}</p>
                  </div>
                  <div className="session-seal"><span>{DOMAINS[activeSession.template.domain].icon}</span><small>{activeSession.duration} min</small></div>
                </article>

                <div className="session-facts">
                  <span>Formation <strong>{activeSession.mode}</strong></span>
                  <span>Gear <strong>{activeSession.template.gear}</strong></span>
                  <span>Technical source <strong>{activeSession.template.source}</strong></span>
                </div>

                <div className="source-note">
                  <strong>{activeSession.template.source.startsWith("SKBC") ? "SKBC-derived technique" : "Academy extension"}</strong>
                  <span>{activeSession.template.source.startsWith("SKBC")
                    ? "The named SKBC lesson governs the fighting concept. Academy doctrine only organizes the practice into timed stages."
                    : "This practice fills an Academy training need while following SKBC's isolate, repeat, test, and review progression."}</span>
                </div>

                <div className="session-cue"><span>Coach&apos;s cue</span><strong>“{activeSession.template.cue}”</strong></div>

                <div className="step-list">
                  {activeSession.steps.map((step, index) => {
                    const isActiveTimer = timer?.index === index;
                    const seconds = step.minutes * 60;
                    return (
                      <article className={`session-step ${activeSession.completed[index] ? "complete" : ""}`} key={`${activeSession.template.id}-${index}`}>
                        <div className="step-rail"><span>{index + 1}</span><i /></div>
                        <div className="step-content">
                          <div className="step-heading"><div><small>{step.label}</small><h3>{step.name}</h3></div><span className="time-pill">{step.minutes} min</span></div>
                          <p className="step-objective">{step.objective}</p>
                          <div className="instruction-grid">
                            <section><span>Set up</span><p>{step.setup}</p></section>
                            <section className="instruction-run"><span>Do this</span><ol>{step.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol></section>
                            <section><span>Work cycle</span><p>{step.workCycle}</p></section>
                            <section><span>Roles / formation</span><p>{step.formation}</p></section>
                            <section><span>Coach for</span><p>{step.watchFor}</p></section>
                          </div>
                          <div className="step-standard"><span>Complete this stage when</span><strong>{step.standard}</strong></div>
                          <div className="step-actions">
                            <button className="timer-button" onClick={() => toggleTimer(index, seconds)}>
                              {isActiveTimer && timer?.running ? "Pause" : isActiveTimer && timer?.remaining < seconds ? "Resume" : "Start timer"}
                            </button>
                            <span className="timer-readout">{isActiveTimer ? formatTime(timer.remaining) : formatTime(seconds)}</span>
                            <button className="check-button" onClick={() => toggleStep(index)}>{activeSession.completed[index] ? "Done ✓" : "Mark done"}</button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <button className="primary-button finish-button" onClick={completeSession}>Complete & Record Session</button>
              </section>
            ) : (
              <div className="empty-state forge-empty"><span>⚔</span><h2>No session forged yet.</h2><p>Choose one domain, one formation, and the time you truly have.</p></div>
            )}

            <section className="section-block armory-section">
              <div className="section-heading"><div><p className="eyebrow">Session Armory</p><h2>All eight {state.selectedFocus} practices.</h2></div><span className="small-note">56 total · SKBC first · Academy structured</span></div>
              <div className="armory-grid">
                {templatesFor(state.selectedFocus).map((template, index) => (
                  <article className="armory-card" key={template.id}>
                    <span className="armory-number">{String(index + 1).padStart(2, "0")}</span>
                    <div><p className="eyebrow">{template.source}</p><h3>{template.title}</h3><p>{template.purpose}</p><small>{template.gear}</small></div>
                    <button className="secondary-button" onClick={() => forgeSession(template.id)}>Forge this plan</button>
                  </article>
                ))}
              </div>
            </section>
          </section>
        )}

        {view === "fight" && (
          <section className="view" aria-labelledby="fight-title">
            <div className="section-heading top-heading"><div><p className="eyebrow">After-Action Hall</p><h1 id="fight-title">Turn fights into information.</h1><p className="heading-copy">Record what happened, why, and the one adjustment under your control.</p></div></div>
            <form className="parchment-card form-card" onSubmit={recordFight}>
              <div className="form-grid two">
                <label>Opponent or session<input name="opponent" type="text" placeholder="Name or ‘open ditch’" /></label>
                <label>Result<select name="result" defaultValue="lesson"><option value="lesson">No score — lesson only</option><option value="win">Win</option><option value="loss">Loss</option><option value="mixed">Mixed set</option></select></label>
              </div>
              <label>Training focus<select name="focus" defaultValue={state.selectedFocus}>{DOMAIN_ORDER.map((domain) => <option key={domain}>{domain}</option>)}</select></label>
              <label>What happened?<textarea name="happened" rows={3} placeholder="One concrete observation" /></label>
              <label>Why did it happen?<textarea name="why" rows={3} placeholder="Range, timing, read, habit, fatigue…" /></label>
              <label>What will you adjust next?<textarea name="adjust" rows={3} placeholder="One action you can practice" /></label>
              <button className="primary-button" type="submit">Record Reflection</button>
            </form>

            <section className="section-block">
              <div className="section-heading"><div><p className="eyebrow">Recent Lessons</p><h2>Your field notes.</h2></div></div>
              <div className="history-list">
                {state.fights.length ? state.fights.slice(0, 10).map((fight) => (
                  <article className="history-item fight" key={fight.id}>
                    <strong>{fight.focus} · {fight.result === "lesson" ? "Lesson only" : fight.result}</strong>
                    <p>{fight.happened || "No observation recorded."}</p>
                    <p><em>Next:</em> {fight.adjust || "No adjustment recorded."}</p>
                    <small>{dateLabel(fight.date)}{fight.opponent ? ` · ${fight.opponent}` : ""}</small>
                  </article>
                )) : <div className="empty-state"><h2>No reflections yet.</h2><p>Wins and losses both become useful when they produce the next adjustment.</p></div>}
              </div>
            </section>
          </section>
        )}

        {view === "path" && (
          <section className="view" aria-labelledby="path-title">
            <div className="section-heading top-heading"><div><p className="eyebrow">The Warlord Path</p><h1 id="path-title">Mastery is service.</h1><p className="heading-copy">Record the highest standard you can demonstrate reliably. Ask a Preceptor or trusted mentor to verify when possible.</p></div></div>
            <article className="notice-card"><strong>Aspirational Academy path.</strong><p>This app records training evidence. It does not grant, promise, or replace official Amtgard Orders, awards, or the Warlord title.</p></article>
            <div className="domain-grid">
              {DOMAIN_ORDER.map((domain) => {
                const definition = DOMAINS[domain];
                const level = state.domains[domain];
                return (
                  <article className="domain-card" key={domain} style={{ "--domain": definition.color } as CSSProperties}>
                    <header><span className="domain-icon">{definition.icon}</span><div><p className="eyebrow">{definition.short}</p><h2>{domain}</h2></div><span className="level-pill">Level {level}</span></header>
                    <p>{definition.description}</p>
                    <div className="level-track" aria-label={`${domain} level ${level} of 4`}>{[1, 2, 3, 4].map((item) => <i className={item <= level ? "filled" : ""} key={item} />)}</div>
                    <div className="next-standard"><span>{level < 4 ? "Current evidence standard" : "Teaching-level standard"}</span><strong>{definition.standards[level - 1]}</strong></div>
                    <details><summary>Record assessment</summary><div className="assessment-list">{definition.standards.map((standard, index) => <button className={level === index + 1 ? "selected" : ""} onClick={() => setAssessment(domain, index + 1)} key={standard}><strong>{index + 1}</strong><span>{standard}</span></button>)}</div></details>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {view === "chronicle" && (
          <section className="view" aria-labelledby="chronicle-title">
            <div className="section-heading top-heading"><div><p className="eyebrow">The Chronicle</p><h1 id="chronicle-title">Keep evidence of the work.</h1><p className="heading-copy">Training Marks reward consistency only. They are not rank, award credit, or proof of mastery.</p></div></div>
            <div className="chronicle-summary">
              <article className="big-stat"><span>Training Marks</span><strong>{state.marks}</strong><small>Practice 2 · Reflection 1 · Teach 3</small></article>
              <article className="big-stat"><span>Teaching Acts</span><strong>{state.teachings.length}</strong><small>knowledge shared</small></article>
              <article className="big-stat"><span>Minutes Trained</span><strong>{state.sessions.reduce((sum, session) => sum + session.duration, 0)}</strong><small>focused time recorded</small></article>
            </div>

            <form className="parchment-card teaching-card" onSubmit={recordTeaching}>
              <p className="eyebrow">Teach It Back</p><h2>Make another fighter stronger.</h2><p>Record a short lesson, drill, or useful correction you shared.</p>
              <label>What did you teach?<input name="teaching" type="text" placeholder="e.g. four range zones" /></label>
              <button className="secondary-button" type="submit">Record Teaching</button>
            </form>

            <section className="section-block">
              <div className="section-heading"><div><p className="eyebrow">Evidence Ledger</p><h2>Recent work.</h2></div><button className="text-button danger" onClick={clearData}>Clear device data</button></div>
              <div className="history-list">
                {state.ledger.length ? state.ledger.slice(0, 30).map((record) => (
                  <article className={`history-item ${record.type}`} key={record.id}><strong>{record.title} · +{record.marks}</strong><p>{record.detail}</p><small>{dateLabel(record.date)}</small></article>
                )) : <div className="empty-state"><h2>The ledger is blank.</h2><p>Focused practice, reflection, and teaching will appear here.</p></div>}
              </div>
            </section>
          </section>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button key={item.id} className={view === item.id ? "active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => navigate(item.id)}><span aria-hidden="true">{item.icon}</span><small>{item.label}</small></button>
        ))}
      </nav>

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSettingsOpen(false)}>
          <section className="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title" onMouseDown={(event) => event.stopPropagation()}>
            <form onSubmit={saveProfile}>
              <div className="dialog-heading"><div><p className="eyebrow">Fighter Record</p><h2 id="profile-title">Your Academy profile</h2></div><button className="icon-button" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close fighter record">×</button></div>
              <label>Fighter name<input name="name" defaultValue={state.profile.name} /></label>
              <label>Primary style<select name="style" defaultValue={state.profile.style}><option>Open / Mixed</option><option>Single Sword</option><option>Sword &amp; Board</option><option>Florentine</option><option>Great Weapon</option><option>Polearm</option><option>Archery / Hybrid</option></select></label>
              <label>Current training goal<textarea name="goal" rows={4} defaultValue={state.profile.goal} placeholder="What are you trying to improve over the next 12 weeks?" /></label>
              <div className="install-note"><strong>Install on your phone</strong><p>Use the Install button or choose “Install app / Add to Home screen” in your browser menu. Your Chronicle stays on this device.</p></div>
              <div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setSettingsOpen(false)}>Cancel</button><button className="primary-button" type="submit">Save Record</button></div>
            </form>
          </section>
        </div>
      )}

      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
