import { DEFAULT_MISTAKE_CATEGORY, getMistakeCategoryLabel, normalizeMistakeCategory } from './dataModel.js'

export function calculateWeeklyCoachReview(logs, options = {}) {
  const weekLogs = getReviewLogs(logs, options)
  const sortedLogs = [...weekLogs].sort((a, b) => a.date.localeCompare(b.date))
  const sessions = sortedLogs.length
  const minutes = sortedLogs.reduce((sum, log) => sum + log.duration, 0)
  const weakness = prioritizeWeakness(sortedLogs)
  const trends = {
    cleanReps: calculateTrend(sortedLogs, (log) => log.cleanReps, { higherIsBetter: true }),
    accuracy: calculateTrend(sortedLogs, accuracyRate, { higherIsBetter: true }),
    sparPerformance: calculateTrend(sortedLogs, sparWinRate, { higherIsBetter: true }),
    conditioning: calculateTrend(sortedLogs, (log) => log.conditioningRoundsSurvived, { higherIsBetter: true }),
    mistakeFrequency: calculateTrend(sortedLogs, (log) => log.mistakeCount, { higherIsBetter: false }),
  }

  const verdict = generateCoachVerdict({ sessions, minutes, trends, weakness })

  return {
    rangeLabel: buildRangeLabel(sortedLogs),
    sessions,
    minutes,
    sparse: sessions < 2,
    trends,
    weakness,
    verdict,
    nextWeekFocus: recommendNextWeekFocus({ sessions, minutes, trends, weakness }),
    sundayReview: recommendSundayReview({ trends, weakness }),
  }
}

export function prioritizeWeakness(logs) {
  const counts = logs.reduce((acc, log) => {
    const weakness = weaknessLabelForLog(log)
    if (!weakness) return acc
    acc[weakness] = (acc[weakness] || 0) + 1
    return acc
  }, {})

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (!entries.length) {
    return {
      label: 'No weakness identified yet',
      count: 0,
      enoughData: false,
    }
  }

  return {
    label: entries[0][0],
    count: entries[0][1],
    enoughData: entries[0][1] >= 2,
  }
}

export function generateCoachVerdict({ sessions, minutes, trends, weakness }) {
  if (sessions < 2) {
    return [
      'Not enough logs for a strong weekly verdict yet.',
      'Log at least two sessions this week so the coach can compare trends.',
    ]
  }

  const verdict = [`Priority weakness this week: ${weakness.label}.`]

  if (trends.accuracy.direction === 'up' && trends.mistakeFrequency.direction === 'down') {
    verdict.push('Accuracy improved and mistake frequency fell. Keep the same skill focus and add controlled pressure.')
  } else if (trends.accuracy.direction === 'up' && trends.mistakeFrequency.direction === 'up') {
    verdict.push('Accuracy improved, but mistake frequency rose under pressure.')
  } else if (trends.accuracy.direction === 'down') {
    verdict.push('Accuracy slipped. Next week should emphasize technical precision before extra speed.')
  }

  if (trends.sparPerformance.direction === 'down') {
    verdict.push('Spar performance is trending down. Emphasize tactical reads over extra volume.')
  }

  if (trends.conditioning.direction === 'down') {
    verdict.push('Conditioning trend dropped. Keep Thursday pressure work, but protect form quality.')
  }

  if (trends.mistakeFrequency.direction === 'up') {
    verdict.push(`Friday should isolate ${weakness.label} and reduce repeat mistakes before broad sparring.`)
  } else {
    verdict.push(`Friday should pressure-test ${weakness.label} with one clear constraint.`)
  }

  if (sessions < 4 || minutes < 180) {
    verdict.push('Next week needs consistency before more complexity.')
  }

  return verdict
}

export function recommendNextWeekFocus({ sessions, minutes, trends, weakness }) {
  if (sessions < 2) return 'Build the data baseline: log two or more sessions before changing the plan.'
  if (trends.mistakeFrequency.direction === 'up') return `Reduce ${weakness.label} with Friday weakness isolation and slower pressure rounds.`
  if (trends.accuracy.direction === 'down') return 'Emphasize Monday technical precision: more clean reps, fewer speed increases.'
  if (trends.sparPerformance.direction === 'down') return 'Emphasize Wednesday tactical reads before adding more sparring volume.'
  if (trends.conditioning.direction === 'down') return 'Emphasize Thursday conditioning while keeping form standards strict.'
  if (sessions < 4 || minutes < 180) return 'Emphasize schedule consistency: complete more planned days before adding load.'
  return 'Keep the Olympic split steady and add pressure only after clean execution holds.'
}

function recommendSundayReview({ trends, weakness }) {
  return [
    `Watch for the repeated weakness: ${weakness.label}.`,
    trendReviewText('accuracy', trends.accuracy),
    trendReviewText('mistakes', trends.mistakeFrequency),
    'Choose one Friday weakness target and one next-week success metric.',
  ]
}

function trendReviewText(label, trend) {
  if (trend.direction === 'insufficient') return `Review ${label}: not enough structured logs yet.`
  return `Review ${label}: ${trend.startAverage} -> ${trend.endAverage} (${trend.label}).`
}

function calculateTrend(logs, selector, options) {
  const values = logs
    .map((log) => ({ date: log.date, value: selector(log) }))
    .filter((item) => typeof item.value === 'number' && Number.isFinite(item.value))

  if (values.length < 2) {
    return {
      direction: 'insufficient',
      label: 'Need more logs',
      count: values.length,
      startAverage: null,
      endAverage: null,
      delta: null,
    }
  }

  const midpoint = Math.ceil(values.length / 2)
  const startAverage = average(values.slice(0, midpoint).map((item) => item.value))
  const endAverage = average(values.slice(midpoint).map((item) => item.value))
  const rawDelta = endAverage - startAverage
  const meaningful = Math.abs(rawDelta) >= 1
  const improved = options.higherIsBetter ? rawDelta > 0 : rawDelta < 0
  const direction = rawDelta > 0 ? 'up' : 'down'

  if (!meaningful) {
    return {
      direction: 'flat',
      label: 'Stable',
      count: values.length,
      startAverage,
      endAverage,
      delta: rawDelta,
    }
  }

  return {
    direction,
    label: improved ? 'Improved' : 'Declined',
    count: values.length,
    startAverage,
    endAverage,
    delta: rawDelta,
  }
}

function getReviewLogs(logs, options) {
  if (options.logs) return options.logs
  if (!logs.length) return []

  const anchor = options.anchorDate || logs.map((log) => log.date).sort().at(-1)
  const start = startOfWeek(anchor)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)

  return logs.filter((log) => {
    const date = dateOnly(log.date)
    return date >= start && date <= end
  })
}

function buildRangeLabel(logs) {
  if (!logs.length) return 'No logged week yet'
  return `${logs[0].date} to ${logs.at(-1).date}`
}

function weaknessLabelForLog(log) {
  const category = normalizeMistakeCategory(log.mistakeCategory, log.problem)
  if (category !== DEFAULT_MISTAKE_CATEGORY) return getMistakeCategoryLabel(category)
  return normalizeProblem(log.problem)
}

function normalizeProblem(problem) {
  if (typeof problem !== 'string') return ''
  const normalized = problem.trim()
  if (!normalized || normalized.toLowerCase() === 'no issue noted') return ''
  return normalized
}

function accuracyRate(log) {
  if (typeof log.attempts === 'number' && log.attempts > 0 && typeof log.successes === 'number') {
    return Math.round((log.successes / log.attempts) * 100)
  }
  return null
}

function sparWinRate(log) {
  if (typeof log.sparWins !== 'number') return null
  const losses = typeof log.sparLosses === 'number' ? log.sparLosses : 0
  const total = log.sparWins + losses
  if (total <= 0) return null
  return Math.round((log.sparWins / total) * 100)
}

function average(values) {
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function startOfWeek(dateString) {
  const date = dateOnly(dateString)
  const day = date.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  date.setUTCDate(date.getUTCDate() + mondayOffset)
  return date
}

function dateOnly(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`)
}
