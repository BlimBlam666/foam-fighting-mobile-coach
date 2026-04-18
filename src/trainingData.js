export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const olympicPhases = [
  { name: 'Phase 1 Warm-Up', duration: 10 },
  { name: 'Phase 2 Skill Isolation', duration: 20 },
  { name: 'Phase 3 Applied Drill Work', duration: 20 },
  { name: 'Phase 4 Pressure Integration', duration: 20 },
  { name: 'Phase 5 Review / Reflection', duration: 10 },
]

export const trainingFocuses = {
  technicalPrecision: {
    id: 'technicalPrecision',
    title: 'Technical Precision Day',
    focus: 'Mechanics + Technical Precision',
    system: 'Neural',
    metric: 'Accuracy %',
    trackedMetrics: ['Accuracy %', 'Clean reps', 'Form breakdown %'],
    color: 'rose',
    goal: 'Perfect mechanics by isolating one shot and earning a 90% clean-hit gate before adding speed.',
    warmup: 'Dynamic mobility, wrist/elbow prep, and shoulder activation.',
    requiredDrills: [
      'Pick ONE shot only',
      '10 slow-motion reps',
      '20 moderate reps',
      '20 explosive reps',
      '20 fatigued reps',
      'Pell or target practice across 4 quadrants',
      'Light spar: only score with the practiced shot',
    ],
    phases: [
      'Warm-up: mobility, wrist/elbow prep, shoulder activation',
      'Skill isolation: one shot only, slow to explosive reps',
      'Applied drill: pell/target work across 4 quadrants',
      'Pressure integration: light spar, practiced shot scores only',
      'Review: accuracy %, form breakdown %, clean-hit gate',
    ],
    drillIdeas: ['10 slow-motion', '20 moderate', '20 explosive', '20 fatigued', '4-quadrant pell'],
  },
  movementRange: {
    id: 'movementRange',
    title: 'Movement / Range Control Day',
    focus: 'Footwork + Range + Mobility',
    system: 'Movement',
    metric: 'Accuracy %',
    trackedMetrics: ['Accuracy %', 'Mistake frequency'],
    color: 'sky',
    goal: 'Build a superior footwork engine that creates safe angles without overcommitting.',
    warmup: 'Dynamic mobility and movement prep.',
    requiredDrills: [
      'Ladder / cone / marker work',
      'Shuffle matrix',
      'Lateral burst',
      'Gather/lunge chain',
      'Retreat/reentry',
      'Partner range drill: continuous entries and exits',
      'Constraint spar: no strikes unless footwork created angle first',
    ],
    phases: [
      'Warm-up: mobility and footwork prep',
      'Skill isolation: shuffle, burst, gather/lunge, retreat/reentry',
      'Applied drill: partner entry/exit range control',
      'Pressure integration: angle-first constraint spar',
      'Review: overcommitments, angle creation, reset quality',
    ],
    drillIdeas: ['Shuffle matrix', 'Lateral burst', 'Gather/lunge chain', 'Retreat/reentry', 'Angle-first spar'],
  },
  tacticalIq: {
    id: 'tacticalIq',
    title: 'Tactical IQ Day',
    focus: 'Tactical IQ + Reads',
    system: 'Cognitive',
    metric: 'Mistake frequency',
    trackedMetrics: ['Mistake frequency', 'Accuracy %'],
    color: 'violet',
    goal: 'Build the Combat Computer with observation, prediction, setups, and punish chains.',
    warmup: 'Film study or live observation before physical work.',
    requiredDrills: [
      'Watch yourself or others fight',
      'Note 3 patterns',
      'Prediction drill: call shot BEFORE block, then defend',
      'Return chains: block to return',
      'Return chains: block to bait to punish',
      'Tertiary setups',
      'Tactical spar: win only by setup; no raw aggression',
    ],
    phases: [
      'Warm-up: film/observation and pattern notes',
      'Skill isolation: prediction drill and called reads',
      'Applied drill: block-return, bait-punish, tertiary setups',
      'Pressure integration: setup-only tactical spar',
      'Review: patterns found, reads missed, punish windows',
    ],
    drillIdeas: ['3 pattern notes', 'Call shot before block', 'Block to return', 'Block to bait to punish', 'Setup-only spar'],
  },
  pressureConditioning: {
    id: 'pressureConditioning',
    title: 'Pressure / Conditioning Day',
    focus: 'Pressure Sparring + Conditioning',
    system: 'Stress',
    metric: 'Conditioning rounds survived',
    trackedMetrics: ['Conditioning rounds survived', 'Spar wins %', 'Mistake frequency'],
    color: 'amber',
    goal: 'Build performance under fatigue while preserving form and decision quality.',
    warmup: 'Activation and readiness check before the circuit.',
    requiredDrills: [
      'Conditioning circuit for 3 rounds',
      'Lunges x20',
      'Burpees x10',
      'Sprint x20m',
      'Shadow swings x30',
      'Immediate fatigue spar',
      'First-to-10 tournament simulation',
    ],
    phases: [
      'Warm-up: activation and breathing',
      'Skill isolation: fatigue mechanics check',
      'Applied drill: 3-round conditioning circuit',
      'Pressure integration: fatigue spar and first-to-10',
      'Review: form breaks, mistakes under fatigue, reset quality',
    ],
    drillIdeas: ['Lunges x20', 'Burpees x10', 'Sprint x20m', 'Shadow swings x30', 'First-to-10'],
  },
  weaknessIsolation: {
    id: 'weaknessIsolation',
    title: 'Weakness Isolation Day',
    focus: 'Weakness Isolation / Correction',
    system: 'Adaptive',
    metric: 'Mistake frequency',
    trackedMetrics: ['Mistake frequency', 'Clean reps', 'Accuracy %'],
    color: 'emerald',
    goal: 'Attack the weakest link by isolating the exact thing that lost fights this week.',
    warmup: 'Warm up around the weakness without adding unrelated volume.',
    requiredDrills: [
      'Ask: What lost me fights this week?',
      'Choose one weakness only',
      'Examples: bad blocks, panic under pressure, slow footwork, weak offside',
      'Train only that weakness for the entire session',
      'Pressure test the corrected variable',
    ],
    phases: [
      'Warm-up: prepare the weak pattern',
      'Skill isolation: single weakness correction',
      'Applied drill: reps that target only that weakness',
      'Pressure integration: constraint spar around the weakness',
      'Review: what improved, what still failed, next overload',
    ],
    drillIdeas: ['Bad blocks', 'Panic under pressure', 'Slow footwork', 'Weak offside', 'Single-variable spar'],
  },
  competitionSimulation: {
    id: 'competitionSimulation',
    title: 'Competition Day',
    focus: 'Competition Simulation',
    system: 'Performance',
    metric: 'Tournament placement',
    trackedMetrics: ['Tournament placement', 'Spar wins %', 'Mistake frequency'],
    color: 'fuchsia',
    goal: 'Replicate tournament pressure with bracket sparring, scorekeeping, and post-analysis.',
    warmup: 'Use exactly the same warm-up ritual every week.',
    requiredDrills: [
      'Warm-up ritual exactly the same every week',
      'Bracket sparring',
      'Single elimination',
      'Score kept',
      'Bystanders watching',
      'Pressure added',
      'Post analysis: wins/losses, mistakes, adjustments',
    ],
    phases: [
      'Warm-up: weekly competition ritual',
      'Skill isolation: first-fight readiness cues',
      'Applied drill: bracket sparring with score kept',
      'Pressure integration: single elimination with observers',
      'Review: wins/losses, mistakes, adjustments',
    ],
    drillIdeas: ['Warm-up ritual', 'Bracket sparring', 'Single elimination', 'Score kept', 'Post analysis'],
  },
  activeRecovery: {
    id: 'activeRecovery',
    title: 'Active Recovery Day',
    focus: 'Recovery / Film / Visualization',
    system: 'Recovery',
    metric: 'Mistake frequency',
    trackedMetrics: ['Mistake frequency'],
    color: 'slate',
    goal: 'Improve without fatigue through mobility, visualization, film review, and journaling.',
    warmup: 'Easy mobility and downshift breathing.',
    requiredDrills: [
      'Mobility',
      'Visualization',
      'Film review',
      'Journal',
      'Reflect: what improved?',
      'Reflect: what failed?',
      'Reflect: what next?',
    ],
    phases: [
      'Warm-up: mobility and breathing',
      'Skill isolation: visualization reps',
      'Applied drill: film review and pattern notes',
      'Pressure integration: mental rehearsal without fatigue',
      'Review: improved, failed, next',
    ],
    drillIdeas: ['Mobility', 'Visualization', 'Film review', 'Journal', 'Next-week target'],
  },
}

export const scheduleTemplates = {
  standardOlympic: {
    id: 'standardOlympic',
    name: 'Standard Olympic split',
    description: 'Six training days plus Sunday active recovery.',
    schedule: {
      Monday: 'technicalPrecision',
      Tuesday: 'movementRange',
      Wednesday: 'tacticalIq',
      Thursday: 'pressureConditioning',
      Friday: 'weaknessIsolation',
      Saturday: 'competitionSimulation',
      Sunday: 'activeRecovery',
    },
  },
  fightersPracticeWednesday: {
    id: 'fightersPracticeWednesday',
    name: 'Fighters Practice Wednesday',
    description: 'Moves competition simulation to Wednesday park practice and keeps Sunday recovery.',
    schedule: {
      Monday: 'technicalPrecision',
      Tuesday: 'movementRange',
      Wednesday: 'competitionSimulation',
      Thursday: 'pressureConditioning',
      Friday: 'weaknessIsolation',
      Saturday: 'tacticalIq',
      Sunday: 'activeRecovery',
    },
  },
  fullParkSunday: {
    id: 'fullParkSunday',
    name: 'Full Park Sunday',
    description: 'Moves competition simulation to Sunday and recovery work to Saturday.',
    schedule: {
      Monday: 'technicalPrecision',
      Tuesday: 'movementRange',
      Wednesday: 'tacticalIq',
      Thursday: 'pressureConditioning',
      Friday: 'weaknessIsolation',
      Saturday: 'activeRecovery',
      Sunday: 'competitionSimulation',
    },
  },
}

export const defaultScheduleTemplateId = 'standardOlympic'

export function createScheduleFromTemplate(templateId = defaultScheduleTemplateId) {
  const template = scheduleTemplates[templateId] || scheduleTemplates[defaultScheduleTemplateId]
  return { ...template.schedule }
}

export function normalizeSchedule(schedule) {
  const fallback = createScheduleFromTemplate()
  const normalized = {}

  weekdays.forEach((day) => {
    normalized[day] = trainingFocuses[schedule?.[day]] ? schedule[day] : fallback[day]
  })

  return normalized
}

export function getWeeklyPlan(schedule = createScheduleFromTemplate()) {
  const normalized = normalizeSchedule(schedule)
  return weekdays.map((day) => {
    const focus = trainingFocuses[normalized[day]]
    return {
      ...focus,
      day,
      short: day.slice(0, 3),
      focusId: focus.id,
      phases: focus.phases.map((phase, index) => {
        const structure = olympicPhases[index]
        return `${structure.name} (${structure.duration} min): ${phase}`
      }),
    }
  })
}

export function getPlanForDay(day, schedule) {
  return getWeeklyPlan(schedule).find((plan) => plan.day === day) || getWeeklyPlan(schedule)[0]
}

export const weeklyPlan = getWeeklyPlan()

export const phaseWeeks = [
  { week: 'Week 1', phase: 'Build', intensity: 65, volume: 80, focus: 'Volume + clean skill acquisition' },
  { week: 'Week 2', phase: 'Build', intensity: 75, volume: 90, focus: 'Specific overload + pressure' },
  { week: 'Week 3', phase: 'Build', intensity: 88, volume: 95, focus: 'Tournament-speed performance' },
  { week: 'Week 4', phase: 'Deload', intensity: 50, volume: 50, focus: '50% workload, recovery + analysis' },
]

export const library = Object.fromEntries(
  Object.values(trainingFocuses).map((focus) => [focus.title, focus.requiredDrills]),
)

export const demoLogs = [
  {
    date: '2026-04-13',
    day: 'Monday',
    focus: 'Mechanics + Technical Precision',
    duration: 90,
    mainDrill: '4-quadrant pell',
    metricType: 'Accuracy %',
    result: '88',
    success: 'No',
    energy: 7,
    confidence: 6,
    win: 'Cleaner elbow path',
    problem: 'Form breakdown under speed',
  },
  {
    date: '2026-04-14',
    day: 'Tuesday',
    focus: 'Footwork + Range + Mobility',
    duration: 60,
    mainDrill: 'Retreat/reentry',
    metricType: 'Mistake frequency',
    result: '4',
    success: 'Yes',
    energy: 8,
    confidence: 7,
    win: 'Created angles before striking',
    problem: 'Late retreat',
  },
  {
    date: '2026-04-15',
    day: 'Wednesday',
    focus: 'Tactical IQ + Reads',
    duration: 75,
    mainDrill: 'Call shot before block',
    metricType: 'Mistake frequency',
    result: '6',
    success: 'No',
    energy: 6,
    confidence: 5,
    win: 'Better pattern notes',
    problem: 'Too slow on returns',
  },
]
